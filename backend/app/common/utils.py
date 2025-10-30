from datetime import datetime, timedelta, timezone, date

def get_current_week_start() -> date:
    # Monday 00:00 UTC for current ISO week
    now = datetime.now(timezone.utc)
    monday = now - timedelta(days=now.weekday())
    monday_midnight = datetime(monday.year, monday.month, monday.day, tzinfo=timezone.utc)
    return monday_midnight.date()

def get_previous_week_start() -> date:
    current = get_current_week_start()
    prev = current - timedelta(days=7)
    return prev

def week_range(week_start_date: date):
    start_dt = datetime.combine(week_start_date, datetime.min.time(), tzinfo=timezone.utc)
    end_dt = start_dt + timedelta(days=7)
    return start_dt, end_dt

def miles_to_km(miles: float) -> float:
    return miles * 1.60934
