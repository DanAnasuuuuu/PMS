from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import PersonnelViewSet, SectionViewSet, LeaveViewSet

router = DefaultRouter()
router.register(r'personnel', PersonnelViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'leaves', LeaveViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

