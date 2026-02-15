from rest_framework import serializers
from .models import Personnel, Assignment, Section, Leave, Department, Designation
from django.utils import timezone

class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model - used in dropdowns"""
    class Meta:
        model = Department
        fields = ['id', 'name', 'description']

class SectionSerializer(serializers.ModelSerializer):
    """Serializer for Section model - used in dropdowns"""
    department = serializers.PrimaryKeyRelatedField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'name', 'department', 'department_name']

class DesignationSerializer(serializers.ModelSerializer):
    """Serializer for Designation model - used in dropdowns"""
    section_name = serializers.CharField(source='section.name', read_only=True)
    department_name = serializers.CharField(source='section.department.name', read_only=True)
    
    class Meta:
        model = Designation
        fields = ['id', 'name', 'section', 'section_name', 'department_name', 'description']

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

class LeaveSerializer(serializers.ModelSerializer):
    """Read-only serializer for Leave - returns formatted data for frontend"""
    id = serializers.IntegerField(read_only=True)
    personnelId = serializers.CharField(source='personnel.service_number', read_only=True)
    personnelName = serializers.SerializerMethodField()
    leaveType = serializers.CharField(source='get_leave_type_display', read_only=True)
    startDate = serializers.DateField(source='start_date', read_only=True)
    endDate = serializers.DateField(source='end_date', read_only=True)
    resumptionDate = serializers.DateField(source='resumption_date', read_only=True)
    daysCount = serializers.IntegerField(source='days_count', read_only=True)
    requestedDate = serializers.DateTimeField(source='requested_date', read_only=True)
    approvedBy = serializers.SerializerMethodField()
    approvedDate = serializers.DateTimeField(source='approved_date', read_only=True)
    rejectionReason = serializers.CharField(source='rejection_reason', read_only=True)
    
    class Meta:
        model = Leave
        fields = [
            'id', 'personnelId', 'personnelName', 'leaveType', 'startDate', 
            'endDate', 'resumptionDate', 'reason', 'status', 'daysCount',
            'requestedDate', 'approvedBy', 'approvedDate', 'rejectionReason'
        ]
    
    def get_personnelName(self, obj):
        return f"{obj.personnel.first_name} {obj.personnel.last_name}"
    
    def get_approvedBy(self, obj):
        if obj.approved_by:
            return obj.approved_by.username
        return None

class LeaveCreateUpdateSerializer(serializers.ModelSerializer):
    """Write serializer for Leave - handles create/update with validation"""
    personnelId = serializers.CharField(source='personnel_id', write_only=True)
    leaveType = serializers.ChoiceField(source='leave_type', choices=Leave.LEAVE_TYPE_CHOICES)
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date')
    resumptionDate = serializers.DateField(source='resumption_date', required=False, allow_null=True)
    
    class Meta:
        model = Leave
        fields = [
            'personnelId', 'leaveType', 'startDate', 'endDate', 
            'resumptionDate', 'reason'
        ]
    
    def validate(self, data):
        """Validate leave dates and check for overlaps"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        personnel_id = data.get('personnel_id')
        
        # Validate date range
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date must be after start date")
        
        # Check for overlapping leaves
        if personnel_id:
            try:
                personnel = Personnel.objects.get(service_number=personnel_id)
                overlapping = Leave.objects.filter(
                    personnel=personnel,
                    status__in=['PENDING', 'APPROVED']
                ).filter(
                    start_date__lte=end_date,
                    end_date__gte=start_date
                )
                
                # Exclude current instance if updating
                if self.instance:
                    overlapping = overlapping.exclude(id=self.instance.id)
                
                if overlapping.exists():
                    raise serializers.ValidationError(
                        "Personnel already has an overlapping leave request"
                    )
            except Personnel.DoesNotExist:
                raise serializers.ValidationError(f"Personnel with service number {personnel_id} not found")
        
        return data
    
    def create(self, validated_data):
        """Create new leave request"""
        personnel_id = validated_data.pop('personnel_id')
        
        try:
            personnel = Personnel.objects.get(service_number=personnel_id)
        except Personnel.DoesNotExist:
            raise serializers.ValidationError(f"Personnel with service number {personnel_id} not found")
        
        leave = Leave.objects.create(
            personnel=personnel,
            **validated_data
        )
        
        return leave
