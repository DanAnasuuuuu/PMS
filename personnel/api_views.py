from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import Personnel, Assignment, Section, Leave
from .serializers import (
    PersonnelSerializer, PersonnelCreateUpdateSerializer, 
    SectionSerializer, LeaveSerializer, LeaveCreateUpdateSerializer
)

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

class LeaveViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Leave management with approve/reject actions
    """
    queryset = Leave.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['personnel__service_number', 'personnel__first_name', 'personnel__last_name']
    ordering_fields = ['requested_date', 'start_date', 'status']
    ordering = ['-requested_date']  # Default ordering (newest first)
    
    def get_serializer_class(self):
        """Use different serializers for read vs write operations"""
        if self.action in ['create', 'update', 'partial_update']:
            return LeaveCreateUpdateSerializer
        return LeaveSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = Leave.objects.all()
        
        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param.upper())
        
        # Filter by personnel
        personnel_param = self.request.query_params.get('personnel', None)
        if personnel_param:
            queryset = queryset.filter(personnel__service_number=personnel_param)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create new leave request"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            # Return using read serializer
            read_serializer = LeaveSerializer(serializer.instance)
            headers = self.get_success_headers(read_serializer.data)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leaves can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use request.user for approval (requires authentication)
        # For now, we'll use a simple approach
        leave.approve(request.user if request.user.is_authenticated else None)
        
        serializer = LeaveSerializer(leave)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leaves can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', 'No reason provided')
        leave.reject(request.user if request.user.is_authenticated else None, reason)
        
        serializer = LeaveSerializer(leave)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a leave request"""
        leave = self.get_object()
        
        if leave.status not in ['PENDING', 'APPROVED']:
            return Response(
                {'error': 'Only pending or approved leaves can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.cancel()
        
        serializer = LeaveSerializer(leave)
        return Response(serializer.data)
