from django.urls import path
from .views import GlobalLeaderboardView

urlpatterns = [
    path("leaderboard/global/", GlobalLeaderboardView.as_view(), name="leaderboard_global"),
]
