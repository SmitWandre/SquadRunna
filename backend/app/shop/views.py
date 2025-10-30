from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from .models import Badge, UserBadge
from .serializers import BadgeSerializer, UserBadgeSerializer
from app.squads.models import Squad


class BadgeListView(generics.ListAPIView):
    """List all available badges in the shop"""
    queryset = Badge.objects.filter(is_active=True)
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]


class PurchaseBadgeView(APIView):
    """Purchase a badge using squad points"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, badge_id):
        user = request.user

        try:
            badge = Badge.objects.get(id=badge_id, is_active=True)
        except Badge.DoesNotExist:
            return Response(
                {"error": "Badge not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user already owns this badge
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            return Response(
                {"error": "You already own this badge"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate total squad points user has across all squads
        user_squads = Squad.objects.filter(members=user)
        total_squad_points = sum(squad.total_points for squad in user_squads)

        # Check if user can afford the badge
        if total_squad_points < badge.price:
            return Response(
                {
                    "error": f"Not enough points. You have {total_squad_points}, need {badge.price}",
                    "current_points": total_squad_points,
                    "required_points": badge.price
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Deduct points from squads (proportionally)
        with transaction.atomic():
            remaining_cost = badge.price
            for squad in user_squads:
                if remaining_cost <= 0:
                    break

                deduction = min(squad.total_points, remaining_cost)
                squad.total_points -= deduction
                squad.save()
                remaining_cost -= deduction

            # Create user badge
            user_badge = UserBadge.objects.create(user=user, badge=badge)

        return Response(
            {
                "message": f"Successfully purchased {badge.name}!",
                "badge": BadgeSerializer(badge, context={'request': request}).data,
                "remaining_points": total_squad_points - badge.price
            },
            status=status.HTTP_201_CREATED
        )


class MyBadgesView(generics.ListAPIView):
    """List user's owned badges"""
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user).select_related('badge')


class EquipBadgeView(APIView):
    """Equip/unequip a badge"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, badge_id):
        try:
            user_badge = UserBadge.objects.get(user=request.user, badge_id=badge_id)
        except UserBadge.DoesNotExist:
            return Response(
                {"error": "You don't own this badge"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Unequip all other badges
        UserBadge.objects.filter(user=request.user).update(is_equipped=False)

        # Equip this badge
        user_badge.is_equipped = True
        user_badge.save()

        return Response(
            {
                "message": f"Equipped {user_badge.badge.name}!",
                "badge": UserBadgeSerializer(user_badge).data
            },
            status=status.HTTP_200_OK
        )


class UnequipBadgeView(APIView):
    """Unequip current badge"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        UserBadge.objects.filter(user=request.user).update(is_equipped=False)
        return Response(
            {"message": "Badge unequipped"},
            status=status.HTTP_200_OK
        )
