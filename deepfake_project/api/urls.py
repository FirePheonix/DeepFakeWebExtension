from django.urls import path
from .views import DeepfakeDetection

urlpatterns = [
    path('detect/', DeepfakeDetection.as_view()),
]
