from django.urls import path
from .views import RunLogCreateView, WeeklyRunsView

urlpatterns = [
    path("", RunLogCreateView.as_view(), name="create_run"),
    path("weekly/", WeeklyRunsView.as_view(), name="weekly_runs"),
]
