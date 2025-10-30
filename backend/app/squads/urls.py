from django.urls import path
from .views import (
    SquadListCreateView,
    SquadDetailView,
    SquadInviteView,
    SquadMessageListCreateView,
    SquadGoalView,
    SquadGoalPreviousView,
    SquadLeaderboardView,
    MyWeeklySummaryView,
    SquadDetailFullView,
    SquadBrowseView,
    SquadJoinView,
    SquadLeaveView,
    SquadDeleteView,
)

urlpatterns = [
    path("", SquadListCreateView.as_view(), name="squad_list_create"),
    path("browse/", SquadBrowseView.as_view(), name="squad_browse"),
    path("<int:pk>/", SquadDetailFullView.as_view(), name="squad_full_detail"),
    path("<int:pk>/basic/", SquadDetailView.as_view(), name="squad_basic"),
    path("<int:pk>/invite/", SquadInviteView.as_view(), name="squad_invite"),
    path("<int:pk>/join/", SquadJoinView.as_view(), name="squad_join"),
    path("<int:pk>/leave/", SquadLeaveView.as_view(), name="squad_leave"),
    path("<int:pk>/delete/", SquadDeleteView.as_view(), name="squad_delete"),
    path("<int:pk>/messages/", SquadMessageListCreateView.as_view(), name="squad_messages"),
    path("<int:pk>/goal/", SquadGoalView.as_view(), name="squad_goal"),
    path("<int:pk>/goal/previous/", SquadGoalPreviousView.as_view(), name="squad_goal_previous"),
    path("<int:pk>/leaderboard/", SquadLeaderboardView.as_view(), name="squad_leaderboard"),
    path("me/weekly-summary/", MyWeeklySummaryView.as_view(), name="my_weekly_summary"),
]
