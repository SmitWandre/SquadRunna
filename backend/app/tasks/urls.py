from django.urls import path
from .views import DebugCloseoutView

urlpatterns = [
    path("closeout-week/", DebugCloseoutView.as_view(), name="debug_closeout"),
]
