from django.db import models
from django.conf import settings
from django.utils import timezone

class Squad(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_squads")
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="squads")
    admins = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="admin_squads", blank=True)
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    total_points = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class SquadMessage(models.Model):
    squad = models.ForeignKey(Squad, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["timestamp"]

class SquadWeeklyGoal(models.Model):
    squad = models.ForeignKey(Squad, on_delete=models.CASCADE, related_name="weekly_goals")
    week_start_date = models.DateField(db_index=True)
    target_distance_km = models.FloatField()
    total_distance_km = models.FloatField(default=0)
    achieved = models.BooleanField(default=False)
    points_awarded_each_member = models.IntegerField(default=0)
    closed_out = models.BooleanField(default=False)
    unit_entered = models.CharField(max_length=5, default="km")  # "km" or "mi"

    class Meta:
        unique_together = ("squad","week_start_date")

class SquadMemberStats(models.Model):
    squad = models.ForeignKey(Squad, on_delete=models.CASCADE, related_name="member_stats")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="squad_stats")
    current_streak_weeks = models.IntegerField(default=0)
    longest_streak_weeks = models.IntegerField(default=0)
    last_week_achieved = models.BooleanField(default=False)

    class Meta:
        unique_together = ("squad","user")

class WeeklyResultLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    squad = models.ForeignKey(Squad, on_delete=models.CASCADE)
    week_start_date = models.DateField()
    points_change = models.IntegerField()

    class Meta:
        unique_together = ("user","squad","week_start_date")
