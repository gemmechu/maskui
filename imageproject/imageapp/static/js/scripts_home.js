
    function allowDrop(event) {
        event.preventDefault();
        var dropZone = document.getElementById('drop_zone');
        dropZone.classList.add('dragover');
    }

    function drop(event) {
        event.preventDefault();
        var file = event.dataTransfer.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            var imgPath = event.target.result;
            document.getElementById('image_path').value = imgPath;
            document.getElementById('upload_form').submit();
        };
        reader.readAsDataURL(file);
    }

    function handleFileSelect(event) {
        var files = event.target.files;
        var reader = new FileReader();
        reader.onload = function(event) {
            var imgPath = event.target.result;
            document.getElementById('image_path').value = imgPath;
            document.getElementById('upload_form').submit();
        };
        reader.readAsDataURL(files[0]);
    }

    document.getElementById('drop_zone').addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });

    document.getElementById('drop_zone').addEventListener('click', function() {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = handleFileSelect;
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
