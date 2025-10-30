from rest_framework import generics, permissions, response, pagination, status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Q
from .models import (
    Squad,
    SquadMessage,
    SquadWeeklyGoal,
    SquadMemberStats,
    WeeklyResultLog,
)
from app.runs.models import RunLog
from app.common.utils import get_current_week_start, week_range, get_previous_week_start
from .serializers import (
    SquadCreateSerializer,
    SquadDetailSerializer,
    SquadInviteSerializer,
    SquadMessageSerializer,
    SquadMessageCreateSerializer,
    SquadGoalSerializer,
    SquadGoalCreateUpdateSerializer,
    SquadMemberStatsSerializer,
)
from django.contrib.auth import get_user_model

User = get_user_model()

class SquadListCreateView(generics.ListCreateAPIView):
    serializer_class = SquadDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.squads.all().prefetch_related("members","owner")

    def get_serializer_class(self):
        if self.request.method.lower() == "post":
            return SquadCreateSerializer
        return SquadDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return ctx

class SquadDetailView(generics.RetrieveAPIView):
    serializer_class = SquadDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # user must be in squad
        return Squad.objects.filter(members=self.request.user).prefetch_related("members","owner")

class SquadInviteView(generics.CreateAPIView):
    serializer_class = SquadInviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        squad = get_object_or_404(Squad, pk=self.kwargs["pk"])
        ctx["squad"] = squad
        return ctx

class SquadMessagePagination(pagination.PageNumberPagination):
    page_size = 50

class SquadMessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = SquadMessagePagination

    def get_queryset(self):
        squad = get_object_or_404(Squad, pk=self.kwargs["pk"], members=self.request.user)
        return SquadMessage.objects.filter(squad=squad).order_by("-timestamp")

    def get_serializer_class(self):
        if self.request.method.lower() == "post":
            return SquadMessageCreateSerializer
        return SquadMessageSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        squad = get_object_or_404(Squad, pk=self.kwargs["pk"])
        ctx["squad"] = squad
        return ctx

    def perform_create(self, serializer):
        squad = get_object_or_404(Squad, pk=self.kwargs["pk"])
        if self.request.user not in squad.members.all():
            raise PermissionError("Not a squad member.")
        serializer.save()

class SquadGoalView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk, members=request.user)
        week_start = get_current_week_start()
        # update total_distance_km live:
        start_dt, end_dt = week_range(week_start)
        members_ids = squad.members.values_list("id", flat=True)
        total_km = RunLog.objects.filter(
            user_id__in=members_ids,
            timestamp__gte=start_dt,
            timestamp__lt=end_dt,
        ).aggregate(total=Sum("distance_km"))["total"] or 0.0

        goal, _ = SquadWeeklyGoal.objects.get_or_create(
            squad=squad,
            week_start_date=week_start,
            defaults={"target_distance_km": 0, "total_distance_km": total_km},
        )
        # refresh live progress
        goal.total_distance_km = total_km
        # Check if goal is achieved (but don't close out yet)
        goal.achieved = total_km >= goal.target_distance_km if goal.target_distance_km > 0 else False
        goal.save()

        ser = SquadGoalSerializer(goal)
        return response.Response(ser.data)

    def post(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk, members=request.user)
        ser = SquadGoalCreateUpdateSerializer(
            data=request.data,
            context={"request": request, "squad": squad},
        )
        ser.is_valid(raise_exception=True)
        goal = ser.save()
        return response.Response(SquadGoalSerializer(goal).data)

class SquadGoalPreviousView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk, members=request.user)
        prev_week_start = get_previous_week_start()

        goal = SquadWeeklyGoal.objects.filter(
            squad=squad,
            week_start_date=prev_week_start
        ).first()

        if not goal:
            return response.Response(
                {"target_distance_km": 0},
                status=status.HTTP_200_OK
            )

        ser = SquadGoalSerializer(goal)
        return response.Response(ser.data)

class SquadLeaderboardView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk, members=request.user)
        members = squad.members.select_related("profile").all()
        stats_map = {
            (s.user_id): s for s in SquadMemberStats.objects.filter(squad=squad)
        }
        data = []
        for m in members:
            stat = stats_map.get(m.id)
            data.append({
                "username": m.username,
                "display_name": m.profile.display_name if hasattr(m,"profile") else m.username,
                "total_points": m.profile.total_points if hasattr(m,"profile") else 0,
                "current_streak_weeks": stat.current_streak_weeks if stat else 0,
                "longest_streak_weeks": stat.longest_streak_weeks if stat else 0,
            })
        data.sort(key=lambda x: x["total_points"], reverse=True)
        return response.Response({"members": data})

class MyWeeklySummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        current_week = get_current_week_start()

        squads = user.squads.all()
        out = []
        for squad in squads:
            # get current goal
            goal = SquadWeeklyGoal.objects.filter(
                squad=squad,
                week_start_date=current_week
            ).first()

            # last closeout = previous week's result
            prev_week = get_previous_week_start()
            wr = WeeklyResultLog.objects.filter(
                user=user,
                squad=squad,
                week_start_date=prev_week
            ).first()

            # compute progress (live)
            if goal:
                start_dt, end_dt = week_range(goal.week_start_date)
                members_ids = squad.members.values_list("id", flat=True)
                total_km = RunLog.objects.filter(
                    user_id__in=members_ids,
                    timestamp__gte=start_dt,
                    timestamp__lt=end_dt,
                ).aggregate(Sum("distance_km"))["distance_km__sum"] or 0.0
                progress_cur = total_km
                goal_cur = goal.target_distance_km
                achieved = goal.achieved
            else:
                progress_cur = 0.0
                goal_cur = 0.0
                achieved = False

            # streak for user
            stats = SquadMemberStats.objects.filter(squad=squad, user=user).first()
            current_streak = stats.current_streak_weeks if stats else 0
            longest_streak = stats.longest_streak_weeks if stats else 0

            out.append({
                "squad_id": squad.id,
                "squad_name": squad.name,
                "goal_cur": goal_cur,
                "progress_cur": progress_cur,
                "achieved": achieved,
                "points_change_last_closeout": wr.points_change if wr else 0,
                "current_streak_weeks": current_streak,
                "longest_streak_weeks": longest_streak,
            })
        return response.Response({"summary": out})

class SquadDetailFullView(generics.GenericAPIView):
    """
    GET squad details + current goal status + streak leaderboard
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk, members=request.user)

        # serialize squad base info
        squad_data = SquadDetailSerializer(squad).data

        # goal info
        week_start = get_current_week_start()
        goal = SquadWeeklyGoal.objects.filter(
            squad=squad,
            week_start_date=week_start
        ).first()
        goal_data = SquadGoalSerializer(goal).data if goal else None

        # leaderboard info
        lb_resp = SquadLeaderboardView().get(request, pk)
        leaderboard_data = lb_resp.data["members"]

        return response.Response({
            "squad": squad_data,
            "goal": goal_data,
            "leaderboard": leaderboard_data,
        })

class SquadBrowseView(generics.ListAPIView):
    """
    Browse and search public squads
    """
    serializer_class = SquadDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Squad.objects.filter(is_private=False).prefetch_related("members", "owner")

        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))

        # Exclude squads user is already in
        exclude_joined = self.request.query_params.get('exclude_joined', 'true')
        if exclude_joined.lower() == 'true':
            queryset = queryset.exclude(members=self.request.user)

        return queryset.order_by('-created_at')

class SquadJoinView(APIView):
    """
    Join a public squad
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk)

        # Check if private
        if squad.is_private:
            return response.Response(
                {"error": "This squad is private. You need an invitation to join."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if already a member
        if request.user in squad.members.all():
            return response.Response(
                {"error": "You are already a member of this squad."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add user to squad
        squad.members.add(request.user)

        return response.Response(
            {"message": "Successfully joined squad!", "squad": SquadDetailSerializer(squad).data},
            status=status.HTTP_200_OK
        )

class SquadLeaveView(APIView):
    """
    Leave a squad - if owner leaves, squad is deleted
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk, members=request.user)

        # If owner leaves, delete the entire squad
        if squad.owner == request.user:
            squad_name = squad.name
            squad.delete()
            return response.Response(
                {"message": f"Squad '{squad_name}' has been deleted."},
                status=status.HTTP_200_OK
            )

        # Remove user from squad
        squad.members.remove(request.user)
        squad.admins.remove(request.user)

        return response.Response(
            {"message": "Successfully left squad."},
            status=status.HTTP_200_OK
        )

class SquadDeleteView(APIView):
    """
    Delete a squad (owner only)
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        squad = get_object_or_404(Squad, pk=pk)

        # Only owner can delete
        if squad.owner != request.user:
            return response.Response(
                {"error": "Only the squad owner can delete the squad."},
                status=status.HTTP_403_FORBIDDEN
            )

        squad_name = squad.name
        squad.delete()

        return response.Response(
            {"message": f"Squad '{squad_name}' has been deleted."},
            status=status.HTTP_200_OK
        )
