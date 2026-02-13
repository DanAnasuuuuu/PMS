from django.db import models
from django.utils import timezone

class Section(models.Model):
    name = models.CharField(max_length=100)
    principal_officer = models.OneToOneField(
        'Personnel', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='headed_section'
    )

    def __str__(self):
        return self.name

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
