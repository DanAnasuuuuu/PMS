from .models import Personnel, GuardDutyRoster
from django.db.models import Max
from django.utils import timezone
from datetime import timedelta

def get_eligible_guards():
    """
    Finds personnel not currently on leave/sick/deployed and sorts them 
    by the date of their most recent guard duty (Least Recently Tasked).
    """
    # Filter active personnel
    active_personnel = Personnel.objects.filter(status='ACTIVE')
    
    # Annotate with last guard duty date
    # We use 'guard_duties' related name from the model
    personnel_with_last_duty = active_personnel.annotate(
        last_duty_date=Max('guard_duties__date')
    )
    
    # Sort: 
    # 1. Those who verify never done duty (last_duty_date is None) should come first.
    # 2. Then those with oldest duty dates.
    # Order by last_duty_date ascending. None values are treated as lowest/first in some DBs, 
    # but strictly in Python we might want to handle it. 
    # Django 'order_by' handles nulls: usually nulls first or last.
    # We want nulls (never did duty) to be first (most eligible).
    # In Postgres, NULLS FIRST is default for ASC, but let's be explicit if needed.
    # checking Django docs: default is database dependent.
    # We can use F expression with nulls_first=True if needed, but simple order_by usually works.
    
    return personnel_with_last_duty.order_by('last_duty_date')

def generate_roster_pdf(start_date, end_date):
    """
    Placeholder function for generating a PDF weekly roster.
    In a real implementation, this would use reportlab or weasyprint.
    """
    # Logic to fetch roster
    roster = GuardDutyRoster.objects.filter(date__range=[start_date, end_date])
    
    # Placeholder response
    return f"PDF Generated for {start_date} to {end_date}. Roster count: {roster.count()}"
