from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("app.authapp.urls")),
    path("api/runs/", include("app.runs.urls")),
    path("api/squads/", include("app.squads.urls")),
    path("api/", include("app.leaderboard.urls")),
    path("api/debug/", include("app.tasks.urls")),
    path("api/shop/", include("app.shop.urls")),

    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
