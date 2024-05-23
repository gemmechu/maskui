from django.urls import path
from .views import upload_image, display_image, segment_view

urlpatterns = [
    path('', upload_image, name='upload_image'),
    path('segment/', segment_view, name='segment'),
    path('display/', display_image, name='display_image'),
]
