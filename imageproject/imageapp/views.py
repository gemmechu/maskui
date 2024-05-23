from django.shortcuts import render, redirect
from .forms import ImageUploadForm
from .models import UploadedImage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


def upload_image(request):
    if request.method == 'POST':
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('display_image')
    else:
        form = ImageUploadForm()
    return render(request, 'upload.html', {'form': form})


@csrf_exempt
def segment_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        object_name = data.get('object')
        coordinates = data.get('coordinates')
        
        print(f"Object: {object_name}")
        for coord in coordinates:
            print(f"X: {coord['x']}, Y: {coord['y']}")

        # Your logic to process coordinates and generate image path
        # For example:
        image_path = '/Users/gemmechu/Desktop/test/m_0013.png'
        
        return JsonResponse({'status': 'success', 'image_path': image_path})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)


def display_image(request):
    image = UploadedImage.objects.latest('uploaded_at')
    return render(request, 'display.html', {'image': image})
