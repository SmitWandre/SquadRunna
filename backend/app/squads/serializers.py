from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import (
    Squad,
    SquadMessage,
    SquadWeeklyGoal,
    SquadMemberStats,
)
from app.common.utils import get_current_week_start, miles_to_km
from django.utils import timezone

User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source="profile.display_name", read_only=True)
    total_points = serializers.IntegerField(source="profile.total_points", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "display_name", "total_points"]

class SquadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Squad
        fields = ["id","name","description","is_private"]

    def create(self, validated_data):
        user = self.context["request"].user
        squad = Squad.objects.create(
            name=validated_data["name"],
            description=validated_data.get("description", ""),
            is_private=validated_data.get("is_private", False),
            owner=user
        )
        squad.members.add(user)
        squad.admins.add(user)
        # ensure SquadMemberStats row for owner
        SquadMemberStats.objects.get_or_create(squad=squad, user=user)
        return squad

class SquadDetailSerializer(serializers.ModelSerializer):
    owner = SimpleUserSerializer(read_only=True)
    members = SimpleUserSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = Squad
        fields = ["id","name","description","owner","members","member_count","is_member","is_private","created_at","total_points"]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False

class SquadInviteSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate(self, data):
        req_user = self.context["request"].user
        squad: Squad = self.context["squad"]
        if squad.owner != req_user:
            raise serializers.ValidationError("Only squad owner can invite.")
        try:
            invited = User.objects.get(username=data["username"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        data["invited_user"] = invited
        return data

    def create(self, validated_data):
        squad: Squad = self.context["squad"]
        invited_user = validated_data["invited_user"]
        squad.members.add(invited_user)
        SquadMemberStats.objects.get_or_create(squad=squad, user=invited_user)
        return {"status": "ok"}

class SquadMessageSerializer(serializers.ModelSerializer):
    sender = SimpleUserSerializer(read_only=True)
    class Meta:
        model = SquadMessage
        fields = ["id","sender","text","timestamp"]

class SquadMessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField()

    def create(self, validated_data):
        user = self.context["request"].user
        squad: Squad = self.context["squad"]

        if user not in squad.members.all():
            raise serializers.ValidationError("Not a squad member.")
        msg = SquadMessage.objects.create(
            squad=squad,
            sender=user,
            text=validated_data["text"]
        )
        return msg

class SquadGoalSerializer(serializers.ModelSerializer):
    progress_km = serializers.SerializerMethodField()
    percent_complete = serializers.SerializerMethodField()
    class Meta:
        model = SquadWeeklyGoal
        fields = [
            "squad",
            "week_start_date",
            "target_distance_km",
            "total_distance_km",
            "progress_km",
            "percent_complete",
            "achieved",
            "points_awarded_each_member",
            "closed_out",
            "unit_entered",
        ]

    def get_progress_km(self,obj):
        return obj.total_distance_km

    def get_percent_complete(self,obj):
        if obj.target_distance_km <= 0:
            return 0.0
        return round((obj.total_distance_km / obj.target_distance_km)*100,2)

class SquadGoalCreateUpdateSerializer(serializers.Serializer):
    target_distance = serializers.FloatField()
    unit = serializers.ChoiceField(choices=[("km","km"),("mi","mi")], default="km")

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        squad: Squad = self.context["squad"]
        if user not in squad.members.all():
            raise serializers.ValidationError("Not a member.")
        week_start = get_current_week_start()

        target_distance = validated_data["target_distance"]
        unit = validated_data["unit"]
        km_target = target_distance if unit == "km" else miles_to_km(target_distance)

        goal, _ = SquadWeeklyGoal.objects.get_or_create(
            squad=squad,
            week_start_date=week_start,
            defaults={"target_distance_km": km_target, "unit_entered": unit},
        )
        # update target mid-week overwrites
        goal.target_distance_km = km_target
        goal.unit_entered = unit
        goal.save()
        return goal

class SquadMemberStatsSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    class Meta:
        model = SquadMemberStats
        fields = [
            "user",
            "current_streak_weeks",
            "longest_streak_weeks",
            "last_week_achieved",
        ]
