from django.db import models
from django.utils import timezone

class Section(models.Model):
    name = models.CharField(max_length=100)
    # Principal Officer will be linked via OneToOne in Personnel to avoid circular dependency issues at definition time,
    # or we can use a string reference 'personnel.Personnel'.
    # However, one section has one principal officer.
    # Let's define it here as a ForeignKey or OneToOneField. 
    # If we want to enforce that a personnel can only head one section, OneToOne is good.
    # Using string reference to handle forward declaration.
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
        ('PTE', 'Private'),
        ('LCPL', 'Lance Corporal'),
        ('CPL', 'Corporal'),
        ('SGT', 'Sergeant'),
        ('SSGT', 'Staff Sergeant'),
        ('WO', 'Warrant Officer'),
        ('MWO', 'Master Warrant Officer'),
        ('AWO', 'Army Warrant Officer'),
        ('2LT', 'Second Lieutenant'),
        ('LT', 'Lieutenant'),
        ('CAPT', 'Captain'),
        ('MAJ', 'Major'),
        ('LTCOL', 'Lieutenant Colonel'),
        ('COL', 'Colonel'),
        ('BRIG', 'Brigadier General'),
        ('MAJGEN', 'Major General'),
        ('LTGEN', 'Lieutenant General'),
        ('GEN', 'General'),
        # Add more as needed or make dynamic
    ]

    service_number = models.CharField(max_length=20, unique=True, primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    rank = models.CharField(max_length=10, choices=RANK_CHOICES)
    
    # Current section (mostly for convenience, though history is in Assignment)
    # We can use a property or keep a field for current status.
    # The requirements say "SectionAssignment (Temporal): Track history...".
    # But usually a current_section field is useful for simple queries.
    # I'll add it and keep it synced with the latest assignment.
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True, blank=True)
    
    dob = models.DateField(verbose_name="Date of Birth")
    date_of_enlistment = models.DateField()
    date_of_last_promotion = models.DateField(null=True, blank=True)
    
    state_of_origin = models.CharField(max_length=50)
    lga_of_origin = models.CharField(max_length=50, verbose_name="LGA of Origin")
    qualification = models.CharField(max_length=100)
    
    # Status for Guard Duty eligibility
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('LEAVE', 'On Leave'),
        ('SICK', 'Sick/Excused'),
        ('DEPLOYED', 'Deployed/Unavailable'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')

    def __str__(self):
        return f"{self.rank} {self.last_name} {self.first_name} ({self.service_number})"

class SectionAssignment(models.Model):
    personnel = models.ForeignKey(Personnel, on_delete=models.CASCADE, related_name='assignments')
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    
    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.personnel} -> {self.section} ({self.start_date})"

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
