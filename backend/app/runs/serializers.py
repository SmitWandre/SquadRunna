from rest_framework import serializers
from django.utils import timezone
from .models import RunLog
from app.common.utils import miles_to_km, get_current_week_start, week_range

class RunLogCreateSerializer(serializers.ModelSerializer):
    distance = serializers.FloatField(write_only=True)
    unit = serializers.ChoiceField(choices=[("km","km"),("mi","mi")], default="km", write_only=True)

    class Meta:
        model = RunLog
        fields = ["id", "distance", "unit", "duration_minutes", "timestamp", "distance_km"]
        read_only_fields = ["id", "distance_km"]
        extra_kwargs = {
            'timestamp': {'required': False}
        }

    def create(self, validated_data):
        user = self.context["request"].user
        distance = validated_data.pop("distance")
        unit = validated_data.pop("unit")
        distance_km = distance if unit == "km" else miles_to_km(distance)
        ts = validated_data.get("timestamp", timezone.now())

        return RunLog.objects.create(
            user=user,
            distance_km=distance_km,
            duration_minutes=validated_data["duration_minutes"],
            timestamp=ts,
        )

class RunLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RunLog
        fields = ["id","distance_km","duration_minutes","timestamp"]

class WeeklyRunsSerializer(serializers.Serializer):
    runs = RunLogSerializer(many=True)
    total_distance_km = serializers.FloatField()
    week_start = serializers.DateField()
    week_end = serializers.DateField()
