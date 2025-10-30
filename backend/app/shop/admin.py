from django.contrib import admin
from .models import Badge, UserBadge


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['icon', 'name', 'rarity', 'price', 'is_active']
    list_filter = ['rarity', 'is_active']
    search_fields = ['name', 'description']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'purchased_at', 'is_equipped']
    list_filter = ['is_equipped', 'badge__rarity']
    search_fields = ['user__username', 'badge__name']
