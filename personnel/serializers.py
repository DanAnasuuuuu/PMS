from rest_framework import serializers
from .models import Personnel, Assignment, Section
from django.utils import timezone

class SectionSerializer(serializers.ModelSerializer):
    """Serializer for Section model - used in dropdowns"""
    class Meta:
        model = Section
        fields = ['id', 'name']

class PersonnelSerializer(serializers.ModelSerializer):
    """Read-only serializer for listing personnel"""
    # Map backend fields to frontend expected fields
    id = serializers.CharField(source='service_number', read_only=True)
    serviceId = serializers.CharField(source='service_number', read_only=True)
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    rank = serializers.CharField(source='get_rank_display', read_only=True)
    section = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    joinedDate = serializers.DateField(source='date_of_enlistment', read_only=True)

    class Meta:
        model = Personnel
        fields = ['id', 'serviceId', 'firstName', 'lastName', 'rank', 'section', 'status', 'joinedDate']

    def get_section(self, obj):
        """Get section from latest active assignment"""
        latest_assignment = obj.assignments.filter(status='ACTIVE').order_by('-date_of_posting').first()
        if latest_assignment and latest_assignment.section:
            return latest_assignment.section.name
        return "Unassigned"

    def get_status(self, obj):
        """Get status from latest assignment"""
        status_map = {
            'ACTIVE': 'Active',
            'TRANSFERRED': 'Active',
            'ON_LEAVE': 'On Leave',
            'SUSPENDED': 'Suspended',
        }
        latest_assignment = obj.assignments.order_by('-date_of_posting').first()
        if latest_assignment:
            return status_map.get(latest_assignment.status, 'Active')
        return 'Active'

class PersonnelCreateUpdateSerializer(serializers.ModelSerializer):
    """Write serializer for creating/updating personnel"""
    # Map frontend field names to backend
    serviceNumber = serializers.CharField(source='service_number', max_length=20)
    firstName = serializers.CharField(source='first_name', max_length=50)
    lastName = serializers.CharField(source='last_name', max_length=50)
    dateOfBirth = serializers.DateField(source='dob')
    maritalStatus = serializers.ChoiceField(
        source='marital_status',
        choices=Personnel.MARITAL_STATUS_CHOICES,
        default='SINGLE'
    )
    stateOfOrigin = serializers.CharField(source='state_of_origin', max_length=50)
    lgaOfOrigin = serializers.CharField(source='lga_of_origin', max_length=50)
    dateOfEnlistment = serializers.DateField(source='date_of_enlistment')
    
    # Section is optional - will create assignment if provided
    sectionId = serializers.IntegerField(required=False, allow_null=True, write_only=True)
    disposition = serializers.CharField(required=False, allow_blank=True, write_only=True, default='General Duty')

    class Meta:
        model = Personnel
        fields = [
            'serviceNumber', 'firstName', 'lastName', 'rank', 'gender',
            'dateOfBirth', 'maritalStatus', 'stateOfOrigin', 'lgaOfOrigin',
            'dateOfEnlistment', 'sectionId', 'disposition'
        ]

    def validate_rank(self, value):
        """Convert rank display name to code if needed"""
        # Check if value is already a valid code
        valid_codes = [code for code, _ in Personnel.RANK_CHOICES]
        if value in valid_codes:
            return value
        
        # Try to find matching display name
        for code, display in Personnel.RANK_CHOICES:
            if display.lower() == value.lower():
                return code
        
        raise serializers.ValidationError(f"Invalid rank: {value}")

    def validate_serviceNumber(self, value):
        """Validate service number format and uniqueness"""
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Service number is required")
        
        # Check uniqueness on create
        if not self.instance and Personnel.objects.filter(service_number=value).exists():
            raise serializers.ValidationError("Personnel with this service number already exists")
        
        return value.strip()

    def validate_dateOfBirth(self, value):
        """Validate date of birth is in the past"""
        if value >= timezone.now().date():
            raise serializers.ValidationError("Date of birth must be in the past")
        return value

    def validate_dateOfEnlistment(self, value):
        """Validate enlistment date"""
        if value > timezone.now().date():
            raise serializers.ValidationError("Date of enlistment cannot be in the future")
        return value

    def create(self, validated_data):
        """Create personnel and initial assignment"""
        # Extract assignment-related fields
        section_id = validated_data.pop('sectionId', None)
        disposition = validated_data.pop('disposition', 'General Duty')
        
        # Create personnel
        personnel = Personnel.objects.create(**validated_data)
        
        # Create initial assignment if section provided
        if section_id:
            try:
                section = Section.objects.get(id=section_id)
                Assignment.objects.create(
                    personnel=personnel,
                    section=section,
                    disposition=disposition,
                    status='ACTIVE',
                    date_of_posting=timezone.now().date()
                )
            except Section.DoesNotExist:
                pass  # Skip assignment creation if section not found
        
        return personnel

    def update(self, instance, validated_data):
        """Update personnel record"""
        # Remove assignment fields from personnel update
        validated_data.pop('sectionId', None)
        validated_data.pop('disposition', None)
        
        # Update personnel fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
