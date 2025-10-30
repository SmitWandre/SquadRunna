from django.db import models
from django.conf import settings


class Badge(models.Model):
    """Badges that can be purchased in the shop"""
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10, help_text="Emoji icon")
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')
    price = models.IntegerField(help_text="Price in squad points")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['price', 'name']

    def __str__(self):
        return f"{self.icon} {self.name} ({self.rarity})"


class UserBadge(models.Model):
    """Badges owned by users"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    purchased_at = models.DateTimeField(auto_now_add=True)
    is_equipped = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'badge')
        ordering = ['-purchased_at']

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
