from django.urls import path
from .views import upload_image, display_image

urlpatterns = [
    path('', upload_image, name='upload_image'),
    path('display/', display_image, name='display_image'),
]
