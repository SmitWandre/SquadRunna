from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView

def api_root(request):
    return JsonResponse({
        "message": "SquadRun API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/auth/",
            "runs": "/api/runs/",
            "squads": "/api/squads/",
            "leaderboard": "/api/leaderboard/",
            "shop": "/api/shop/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path("", api_root, name="api_root"),
    path("admin/", admin.site.urls),

    path("api/auth/", include("app.authapp.urls")),
    path("api/runs/", include("app.runs.urls")),
    path("api/squads/", include("app.squads.urls")),
    path("api/", include("app.leaderboard.urls")),
    path("api/debug/", include("app.tasks.urls")),
    path("api/shop/", include("app.shop.urls")),

    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
