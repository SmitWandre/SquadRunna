from django.urls import path
from .views import RegisterView, LoginView, MeProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("me/", MeProfileView.as_view(), name="me_profile"),
]
