from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from app.common.utils import get_current_week_start, get_previous_week_start, week_range
from app.squads.models import (
    Squad,
    SquadWeeklyGoal,
    SquadMemberStats,
    WeeklyResultLog,
)
from app.runs.models import RunLog
from django.contrib.auth import get_user_model

User = get_user_model()

def compute_week_points(goal_cur, goal_prev, progress_cur):
    if progress_cur >= goal_cur:
        base_points = 50
        bonus_points = 20 if goal_cur > goal_prev else 5
        pts = base_points + bonus_points
        return pts, True
    else:
        return -20, False

@transaction.atomic
def closeout_week(test_current_week=False):
    """
    Called weekly (Sunday 23:59:59 -> new Monday).
    We'll finalize LAST week.

    Args:
        test_current_week: If True, close out THIS week instead (for testing only)
    """
    if test_current_week:
        # For testing: close out the CURRENT week
        week_start = get_current_week_start()
        prev_week_start = get_previous_week_start()
    else:
        # Normal operation: close out LAST week
        week_start = get_previous_week_start()
        prev_week_start = week_start - timedelta(days=7)

    squads = Squad.objects.all()
    for squad in squads:
        # find last week's record
        goal_qs = SquadWeeklyGoal.objects.filter(squad=squad, week_start_date=week_start)
        if not goal_qs.exists():
            continue
        goal_obj = goal_qs.first()
        if goal_obj.closed_out:
            continue

        # compute total_distance_km for that squad + week_start
        start_dt, end_dt = week_range(goal_obj.week_start_date)
        members_ids = squad.members.values_list("id", flat=True)
        total_km = RunLog.objects.filter(
            user_id__in=members_ids,
            timestamp__gte=start_dt,
            timestamp__lt=end_dt,
        ).aggregate(sum_km=Sum("distance_km"))["sum_km"] or 0.0

        # prev week's goal for scaling
        prev_goal_obj = SquadWeeklyGoal.objects.filter(squad=squad, week_start_date=prev_week_start).first()
        goal_prev_val = prev_goal_obj.target_distance_km if prev_goal_obj else 0.0

        # scoring
        points_change, achieved = compute_week_points(
            goal_obj.target_distance_km,
            goal_prev_val,
            total_km
        )

        # update SquadWeeklyGoal
        goal_obj.total_distance_km = total_km
        goal_obj.achieved = achieved
        goal_obj.points_awarded_each_member = points_change
        goal_obj.closed_out = True
        goal_obj.save()

        # Award points to the SQUAD (not individuals)
        squad.total_points += points_change
        squad.save()

        # update each member's streaks (but NOT individual points)
        for member in squad.members.select_related("profile").all():
            stats, _ = SquadMemberStats.objects.get_or_create(squad=squad, user=member)
            if achieved:
                if stats.last_week_achieved:
                    stats.current_streak_weeks += 1
                else:
                    stats.current_streak_weeks = 1
                if stats.current_streak_weeks > stats.longest_streak_weeks:
                    stats.longest_streak_weeks = stats.current_streak_weeks
                stats.last_week_achieved = True
            else:
                stats.current_streak_weeks = 0
                stats.last_week_achieved = False
            stats.save()

            # log result for personal weekly summary
            WeeklyResultLog.objects.update_or_create(
                user=member,
                squad=squad,
                week_start_date=week_start,
                defaults={"points_change": points_change}
            )
