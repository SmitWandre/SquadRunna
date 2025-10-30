from django.db import models
from django.conf import settings
from django.utils import timezone

class RunLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="runs")
    distance_km = models.FloatField()
    duration_minutes = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    def __str__(self):
        return f"{self.user.username} {self.distance_km} km @ {self.timestamp}"
