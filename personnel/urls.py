from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import PersonnelViewSet, SectionViewSet

router = DefaultRouter()
router.register(r'personnel', PersonnelViewSet)
router.register(r'sections', SectionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

