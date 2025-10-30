from rest_framework import generics, permissions, response
from django.utils import timezone
from .models import RunLog
from .serializers import RunLogCreateSerializer, WeeklyRunsSerializer, RunLogSerializer
from app.common.utils import get_current_week_start, week_range

class RunLogCreateView(generics.CreateAPIView):
    serializer_class = RunLogCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return ctx

class WeeklyRunsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        week_start = get_current_week_start()
        start_dt, end_dt = week_range(week_start)
        qs = RunLog.objects.filter(
            user=user,
            timestamp__gte=start_dt,
            timestamp__lt=end_dt
        ).order_by("-timestamp")
        total = sum(r.distance_km for r in qs)
        data = {
            "runs": RunLogSerializer(qs, many=True).data,
            "total_distance_km": total,
            "week_start": week_start,
            "week_end": (end_dt.date()),
        }
        ser = WeeklyRunsSerializer(data)
        return response.Response(ser.data)
