from celery import shared_task
from .closeout import closeout_week

@shared_task
def run_weekly_closeout():
    closeout_week()
