from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json


class Command(BaseCommand):
    help = 'Set up periodic tasks for weekly closeout'

    def handle(self, *args, **options):
        # Create schedule: Every Monday at 00:00 UTC (Sunday 11:59:59 PM + 1 second)
        schedule, created = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='0',
            day_of_week='1',  # Monday (0=Sunday, 1=Monday, etc.)
            day_of_month='*',
            month_of_year='*',
        )

        # Create or update the periodic task
        task, task_created = PeriodicTask.objects.get_or_create(
            name='Weekly Squad Goal Closeout',
            defaults={
                'task': 'app.tasks.tasks.run_weekly_closeout',
                'crontab': schedule,
                'enabled': True,
            }
        )

        if not task_created:
            task.task = 'app.tasks.tasks.run_weekly_closeout'
            task.crontab = schedule
            task.enabled = True
            task.save()
            self.stdout.write(self.style.SUCCESS('✓ Updated existing periodic task'))
        else:
            self.stdout.write(self.style.SUCCESS('✓ Created new periodic task'))

        self.stdout.write(self.style.SUCCESS(
            f'Periodic task scheduled: Every Monday at 00:00 UTC'
        ))
