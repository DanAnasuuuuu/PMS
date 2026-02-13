from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework import status
from .models import Personnel, Assignment, Section
from .serializers import PersonnelSerializer, PersonnelCreateUpdateSerializer, SectionSerializer

class PersonnelViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Personnel with search and filter capabilities
    """
    queryset = Personnel.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['service_number', 'first_name', 'last_name', 'rank']
    ordering_fields = ['service_number', 'last_name', 'date_of_enlistment']
    ordering = ['last_name']  # Default ordering

    def get_serializer_class(self):
        """Use different serializers for read vs write operations"""
        if self.action in ['create', 'update', 'partial_update']:
            return PersonnelCreateUpdateSerializer
        return PersonnelSerializer

    def create(self, request, *args, **kwargs):
        """Create new personnel with proper error handling"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            # Return the created object using the read serializer
            read_serializer = PersonnelSerializer(serializer.instance)
            headers = self.get_success_headers(read_serializer.data)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for Sections - used for dropdowns
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

