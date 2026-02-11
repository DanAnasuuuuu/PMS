from rest_framework import viewsets
from .models import Personnel, Assignment
from .serializers import PersonnelSerializer

class PersonnelViewSet(viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
