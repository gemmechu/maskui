from django.shortcuts import render, redirect
from .forms import ImageUploadForm
from .models import UploadedImage

def upload_image(request):
    if request.method == 'POST':
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('display_image')
    else:
        form = ImageUploadForm()
    return render(request, 'upload.html', {'form': form})

def display_image(request):
    image = UploadedImage.objects.latest('uploaded_at')
    return render(request, 'display.html', {'image': image})
