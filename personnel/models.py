from django.db import models
from django.utils import timezone

class Department(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Section(models.Model):
    name = models.CharField(max_length=100)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='sections',
        null=True,
        blank=True
    )
    principal_officer = models.OneToOneField(
        'Personnel', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='headed_section'
    )

    def __str__(self):
        if self.department:
            return f"{self.name} ({self.department.name})"
        return self.name

    class Meta:
        ordering = ['department__name', 'name']

class Designation(models.Model):
    name = models.CharField(max_length=200)
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='designations'
    )
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.section.name}"

    class Meta:
        ordering = ['section__department__name', 'section__name', 'name']
        unique_together = ('name', 'section')

class Personnel(models.Model):
    RANK_CHOICES = [
        ('DII', 'DII'),
        ('DI', 'DI'),
        ('CD', 'CD'),
        ('ASO', 'ASO'),
        ('SO', 'SO'),
        ('SIOII', 'SIOII'),
        ('SIOI', 'SIOI'),
        ('SSIO', 'SSIO'),
        ('PSIO', 'PSIO'),
        ('CSIO', 'CSIO'),
        ('ADIS', 'ADIS'),
        ('DDIS', 'DDIS'),
        ('DIS', 'DIS'),
        ('ADG', 'ADG'),
    ]

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    MARITAL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced'),
        ('WIDOWED', 'Widowed'),
    ]

    service_number = models.CharField(max_length=20, unique=True, primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, verbose_name="Surname")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    dob = models.DateField(verbose_name="Date of Birth")
    marital_status = models.CharField(max_length=10, choices=MARITAL_STATUS_CHOICES, default='SINGLE')
    
    state_of_origin = models.CharField(max_length=50)
    lga_of_origin = models.CharField(max_length=50, verbose_name="LGA")
    date_of_enlistment = models.DateField()
    
    # Kept for backward compatibility/ease of access, though history is in CareerProgression
    rank = models.CharField(max_length=10, choices=RANK_CHOICES)
    
    def __str__(self):
        return f"{self.rank} {self.last_name} {self.first_name} ({self.service_number})"

class Assignment(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ON_LEAVE', 'On Leave'),
        ('TRANSFERRED', 'Transferred'),
        ('SUSPENDED', 'Suspended'),
    ]

    personnel = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name='assignments')
    disposition = models.CharField(max_length=100, help_text="e.g., SDS, Escort Commander")
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True)
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')
    sub_unit = models.CharField(max_length=100, blank=True, help_text="e.g., Transport, Govt House Unit")
    date_of_posting = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    def __str__(self):
        return f"{self.personnel} - {self.disposition} ({self.status})"

class CareerProgression(models.Model):
    personnel = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name='career_history')
    current_rank = models.CharField(max_length=10, choices=Personnel.RANK_CHOICES)
    date_of_last_promotion = models.DateField(null=True, blank=True)
    date_of_last_transfer = models.DateField(null=True, blank=True)
    command_last_served = models.CharField(max_length=100, help_text="Previous Command")
    years_in_service = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.personnel} - {self.current_rank}"

class Qualification(models.Model):
    personnel = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name='qualifications')
    educational_qualification = models.CharField(max_length=100, help_text="e.g. B.Sc, MSc, SSCE")

    def __str__(self):
        return f"{self.personnel} - {self.educational_qualification}"

class GuardDutyRoster(models.Model):
    SHIFT_CHOICES = [
        ('DAY', 'Day Shift'),
        ('NIGHT', 'Night Shift'),
    ]
    
    personnel = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name='guard_duties')
    date = models.DateField()
    shift_type = models.CharField(max_length=5, choices=SHIFT_CHOICES)
    
    class Meta:
        unique_together = ('personnel', 'date', 'shift_type')
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} - {self.get_shift_type_display()}: {self.personnel}"

class Leave(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('ANNUAL', 'Annual Leave'),
        ('CASUAL', 'Casual Leave'),
        ('SICK', 'Sick Leave'),
        ('MATERNITY', 'Maternity Leave'),
        ('PATERNITY', 'Paternity Leave'),
        ('COMPASSIONATE', 'Compassionate Leave'),
        ('STUDY', 'Study Leave'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    
    personnel = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    resumption_date = models.DateField(null=True, blank=True)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    requested_date = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        'auth.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_leaves'
    )
    approved_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    days_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-requested_date']
    
    def __str__(self):
        return f"{self.personnel} - {self.get_leave_type_display()} ({self.start_date} to {self.end_date})"
    
    def calculate_days(self):
        """Calculate the number of days for the leave"""
        if self.start_date and self.end_date:
            delta = self.end_date - self.start_date
            return delta.days + 1  # Include both start and end dates
        return 0
    
    def save(self, *args, **kwargs):
        # Auto-calculate days if not set
        if not self.days_count:
            self.days_count = self.calculate_days()
        
        # Auto-set resumption date if not set (day after end_date)
        if not self.resumption_date and self.end_date:
            from datetime import timedelta
            self.resumption_date = self.end_date + timedelta(days=1)
        
        super().save(*args, **kwargs)
    
    def approve(self, user):
        """Approve the leave request"""
        self.status = 'APPROVED'
        self.approved_by = user
        self.approved_date = timezone.now()
        self.save()
        
        # Update personnel assignment status to ON_LEAVE
        active_assignment = self.personnel.assignments.filter(status='ACTIVE').first()
        if active_assignment:
            active_assignment.status = 'ON_LEAVE'
            active_assignment.save()
    
    def reject(self, user, reason):
        """Reject the leave request"""
        self.status = 'REJECTED'
        self.approved_by = user
        self.approved_date = timezone.now()
        self.rejection_reason = reason
        self.save()
    
    def cancel(self):
        """Cancel the leave request"""
        self.status = 'CANCELLED'
        self.save()
        
        # If leave was approved, revert personnel status
        if self.status == 'APPROVED':
            active_assignment = self.personnel.assignments.filter(status='ON_LEAVE').first()
            if active_assignment:
                active_assignment.status = 'ACTIVE'
                active_assignment.save()
