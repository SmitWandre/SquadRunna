from rest_framework import serializers
from .models import Badge, UserBadge


class BadgeSerializer(serializers.ModelSerializer):
    is_owned = serializers.SerializerMethodField()
    is_equipped = serializers.SerializerMethodField()

    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'rarity', 'price', 'is_owned', 'is_equipped']

    def get_is_owned(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserBadge.objects.filter(user=request.user, badge=obj).exists()
        return False

    def get_is_equipped(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_badge = UserBadge.objects.filter(user=request.user, badge=obj).first()
            return user_badge.is_equipped if user_badge else False
        return False


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'purchased_at', 'is_equipped']
