from django.contrib import admin
from .models import Personnel, Section, Assignment, CareerProgression, Qualification, GuardDutyRoster
from .services import generate_roster_pdf
from django.http import HttpResponse
from django.urls import path
from django.utils.html import format_html

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'principal_officer')

@admin.register(Personnel)
class PersonnelAdmin(admin.ModelAdmin):
    list_display = ('service_number', 'rank', 'last_name', 'first_name', 'gender', 'state_of_origin')
    list_filter = ('rank', 'gender', 'state_of_origin')
    search_fields = ('service_number', 'last_name', 'first_name')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('personnel', 'disposition', 'section', 'sub_unit', 'date_of_posting', 'status')
    list_filter = ('status', 'section', 'date_of_posting')
    search_fields = ('personnel__service_number', 'personnel__last_name', 'disposition')

@admin.register(CareerProgression)
class CareerProgressionAdmin(admin.ModelAdmin):
    list_display = ('personnel', 'current_rank', 'command_last_served', 'years_in_service')
    search_fields = ('personnel__service_number', 'personnel__last_name')

@admin.register(Qualification)
class QualificationAdmin(admin.ModelAdmin):
    list_display = ('personnel', 'educational_qualification')
    search_fields = ('personnel__service_number', 'educational_qualification')

@admin.register(GuardDutyRoster)
class GuardDutyRosterAdmin(admin.ModelAdmin):
    list_display = ('date', 'shift_type', 'personnel')
    list_filter = ('date', 'shift_type')
    date_hierarchy = 'date'
    change_list_template = "admin/guard_duty_changelist.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('generate-report/', self.admin_site.admin_view(self.generate_report_view), name='generate-report'),
        ]
        return custom_urls + urls

    def generate_report_view(self, request):
        # Placeholder for report generation
        # For now, just return a simple text response
        # In real app, calculate dates based on request or default to this week
        from django.utils import timezone
        today = timezone.now().date()
        result = generate_roster_pdf(today, today + timezone.timedelta(days=7))
        return HttpResponse(result, content_type="text/plain")

