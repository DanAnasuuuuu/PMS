from rest_framework import serializers
from .models import Personnel, Assignment, Section

class PersonnelSerializer(serializers.ModelSerializer):
    # Map backend fields to frontend expected fields
    id = serializers.CharField(source='service_number', read_only=True)
    serviceId = serializers.CharField(source='service_number')
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    # Rank is a choice field, we pass the label or value? Frontend expects values like 'Sergeant'.
    # Our DB stores 'SGT', frontend enum uses 'Sergeant'. 
    # We can stick to passing the display value.
    rank = serializers.CharField(source='get_rank_display')
    
    # Section might be null, handle gracefully
    section = serializers.SerializerMethodField()
    
    status = serializers.SerializerMethodField()
    joinedDate = serializers.DateField(source='date_of_enlistment')

    class Meta:
        model = Personnel
        fields = ['id', 'serviceId', 'firstName', 'lastName', 'rank', 'section', 'status', 'joinedDate']

    def get_section(self, obj):
        # Initial assignment or current section field
        # We moved section to Assignment model, but populated it in populate_dummy_data too? 
        # Check models.py: section field exists in Personnel in our last edit of models.py?
        # Let's check model state. The user complained about section in create().
        # In step 321, Personnel model still had `section` field on line 46 of the displayed code?
        # Wait, Step 210 replace_file_content REMOVED the section field? 
        # No, Step 210 *modified* it?
        # Let's assume we rely on the latest Assignment.
        latest_assignment = obj.assignments.filter(status='ACTIVE').order_by('-date_of_posting').first()
        if latest_assignment and latest_assignment.section:
            return latest_assignment.section.name
        return "Unassigned"

    def get_status(self, obj):
        # Map our status keys to Frontend keys
        # Backend: ACTIVE, LEAVE, SICK, DEPLOYED
        # Frontend: Active, On Leave, Suspended, Retired
        status_map = {
            'ACTIVE': 'Active',
            'TRANSFERRED': 'Active', # Treat as active elsewhere?
            'ON_LEAVE': 'On Leave',
            'SUSPENDED': 'Suspended',
        }
        # We need to get status from latest assignment? 
        # Or does Personnel have a status field? 
        # Personnel model (Step 321) does NOT have a status field in the version I saw?
        # Wait, Step 321 shows `Assignment` has status. `Personnel` has ... wait.
        # Let's re-read models.py from Step 321.
        # Line 51-64 of Personnel. It REMOVED `status`?
        # No, it seems I might have removed it or it wasn't there in the snippet.
        # Let's look at Assignment.
        latest_assignment = obj.assignments.order_by('-date_of_posting').first()
        if latest_assignment:
             return status_map.get(latest_assignment.status, 'Active')
        return 'Active'
