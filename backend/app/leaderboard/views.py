from rest_framework import generics, permissions, response
from django.contrib.auth import get_user_model
from app.squads.models import Squad
from app.squads.views import SquadLeaderboardView
from django.db.models import F

User = get_user_model()

class GlobalLeaderboardView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # top 10 users by total_points
        qs = User.objects.select_related("profile").all()
        data = []
        for u in qs:
            pts = u.profile.total_points if hasattr(u,"profile") else 0
            data.append({
                "username": u.username,
                "display_name": u.profile.display_name if hasattr(u,"profile") else u.username,
                "total_points": pts,
            })
        data.sort(key=lambda x: x["total_points"], reverse=True)
        data = data[:10]
        return response.Response({"global_top_10": data})
