from django.urls import path
from .views import (
    BadgeListView,
    PurchaseBadgeView,
    MyBadgesView,
    EquipBadgeView,
    UnequipBadgeView,
)

urlpatterns = [
    path('badges/', BadgeListView.as_view(), name='badge_list'),
    path('badges/<int:badge_id>/purchase/', PurchaseBadgeView.as_view(), name='purchase_badge'),
    path('my-badges/', MyBadgesView.as_view(), name='my_badges'),
    path('badges/<int:badge_id>/equip/', EquipBadgeView.as_view(), name='equip_badge'),
    path('badges/unequip/', UnequipBadgeView.as_view(), name='unequip_badge'),
]
