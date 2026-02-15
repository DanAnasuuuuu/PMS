from django.contrib import admin
from .models import Personnel, Section, Assignment, CareerProgression, Qualification, GuardDutyRoster, Leave, Department, Designation
from .services import generate_roster_pdf
from django.http import HttpResponse
from django.urls import path
from django.utils.html import format_html

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'section_count')
    search_fields = ('name',)

    def section_count(self, obj):
        return obj.sections.count()
    section_count.short_description = 'Number of Sections'

class DesignationInline(admin.TabularInline):
    model = Designation
    extra = 1
    fields = ('name', 'description')

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'principal_officer', 'designation_count')
    list_filter = ('department',)
    search_fields = ('name',)
    inlines = [DesignationInline]

    def designation_count(self, obj):
        return obj.designations.count()
    designation_count.short_description = 'Number of Designations'

@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'get_department')
    list_filter = ('section__department', 'section')
    search_fields = ('name', 'section__name')

    def get_department(self, obj):
        return obj.section.department.name if obj.section.department else 'N/A'
    get_department.short_description = 'Department'

@admin.register(Personnel)
class PersonnelAdmin(admin.ModelAdmin):
    list_display = ('service_number', 'rank', 'last_name', 'first_name', 'gender', 'state_of_origin')
    list_filter = ('rank', 'gender', 'state_of_origin')
    search_fields = ('service_number', 'last_name', 'first_name')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('personnel', 'disposition', 'section', 'designation', 'sub_unit', 'date_of_posting', 'status')
    list_filter = ('status', 'section', 'designation', 'date_of_posting')
    search_fields = ('personnel__service_number', 'personnel__last_name', 'disposition')

@admin.register(CareerProgression)
class CareerProgressionAdmin(admin.ModelAdmin):
    list_display = ('personnel', 'current_rank', 'command_last_served', 'years_in_service')
    search_fields = ('personnel__service_number', 'personnel__last_name')

@admin.register(Qualification)
class QualificationAdmin(admin.ModelAdmin):
    list_display = ('personnel', 'educational_qualification')
    search_fields = ('personnel__service_number', 'educational_qualification')

@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ('personnel', 'leave_type', 'start_date', 'end_date', 'status', 'days_count')
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('personnel__service_number', 'personnel__first_name', 'personnel__last_name')
    readonly_fields = ('requested_date', 'approved_date', 'days_count')

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

