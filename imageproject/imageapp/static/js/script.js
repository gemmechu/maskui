document.addEventListener("DOMContentLoaded", function() {
    var img = document.getElementById("image");
    var previousImages = []; // Track previous images
    var dotList = [];
    var coordinatesList = document.getElementById("coordinates-list");
    var objectList = {};
    var currentObject = "Object1";
    var objectColors = ["red", "green", "blue", "yellow", "orange", "purple"];
    var colorIndex = 0;
    
    document.getElementById("segment-button").addEventListener("click", function() {
        // Gather all coordinates for the current object
        var coordinates = objectList[currentObject].dots.map(function(dot) {
            return {
                x: parseInt(dot.dataset.x),
                y: parseInt(dot.dataset.y)
            };
        });
    
        // Send the coordinates to the Django server
        fetch("/segment/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie('csrftoken')  // Ensure you send the CSRF token
            },
            body: JSON.stringify({
                object: currentObject,
                coordinates: coordinates
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Update the image source with the new image path
                var mask = document.getElementById("mask");
                mask.src = data.image_path;
            } else {
                console.error("Error:", data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
    
    // Function to get the CSRF token from the cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    function updateObjectList() {
        var objectSelect = document.getElementById("object-select");
        objectSelect.innerHTML = "";
        for (var objectName in objectList) {
            var option = document.createElement("option");
            option.value = objectName;
            option.textContent = objectName;
            objectSelect.appendChild(option);
        }
        objectSelect.value = currentObject;
    }

    function updateCoordinatesList() {
        coordinatesList.innerHTML = "";
        if (objectList[currentObject]) {
            objectList[currentObject].dots.forEach(function(dot, index) {
                if (dot) {
                    var li = document.createElement("li");
                    li.textContent = currentObject + " - X: " + dot.dataset.x + ", Y: " + dot.dataset.y;
                    li.dataset.index = index;
                    var deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete";
                    deleteButton.className = "delete-button";
                    deleteButton.addEventListener("click", function() {
                        var index = parseInt(li.dataset.index);
                        document.querySelector(".image-container").removeChild(dot);
                        coordinatesList.removeChild(li);
                        objectList[currentObject].dots[index] = null;
                    });
                    li.appendChild(deleteButton);
                    coordinatesList.appendChild(li);

                    // Add hover event listeners
                    li.addEventListener("mouseenter", function() {
                        highlightDot(dot);
                    });
                    li.addEventListener("mouseleave", function() {
                        removeHighlight(dot);
                    });
                }
            });
        }
    }
    function highlightDot(dot) {
        dot.style.transform = "scale(1.5)";
        dot.style.border = "2px solid black";
    }

    function removeHighlight(dot) {
        dot.style.transform = "";
        dot.style.border = "";
    }
    function addNewObject(objectName) {
        if (!objectList[objectName]) {
            objectList[objectName] = {
                dots: [],
                color: objectColors[colorIndex % objectColors.length]
            };
            colorIndex++;
            currentObject = objectName;
            updateObjectList();
            updateCoordinatesList();
        } else {
            alert("Object name already exists!");
        }
    }

    function removeObject(objectName) {
        if (objectList[objectName]) {
            objectList[objectName].dots.forEach(function(dot) {
                if (dot) {
                    document.querySelector(".image-container").removeChild(dot);
                }
            });
            delete objectList[objectName];
            updateObjectList();
            updateCoordinatesList();
        }
    }

    function editObjectName(oldName, newName) {
        if (oldName !== newName) {
            if (!objectList[newName]) {
                objectList[newName] = objectList[oldName];
                delete objectList[oldName];
                updateObjectList();
                updateCoordinatesList();
            } else {
                alert("Object name already exists!");
            }
        }
    }

    document.getElementById("add-object-button").addEventListener("click", function() {
        var newObjectName = prompt("Enter new object name:");
        if (newObjectName) {
            addNewObject(newObjectName);
        }
    });

    document.getElementById("remove-object-button").addEventListener("click", function() {
        var objectName = prompt("Enter object name to remove:");
        if (objectName) {
            removeObject(objectName);
        }
    });

    document.getElementById("edit-object-button").addEventListener("click", function() {
        var oldName = prompt("Enter object name to edit:");
        if (oldName && objectList[oldName]) {
            var newName = prompt("Enter new object name:");
            if (newName) {
                editObjectName(oldName, newName);
            }
        } else {
            alert("Object name not found!");
        }
    });

    document.getElementById("object-select").addEventListener("change", function(event) {
        currentObject = event.target.value;
        updateCoordinatesList();
    });

    img.addEventListener("click", function(event) {
        var rect = img.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Calculate the image's pixel coordinates
        var imgWidth = img.naturalWidth;
        var imgHeight = img.naturalHeight;
        var displayWidth = rect.width;
        var displayHeight = rect.height;
        var imgX = Math.round(x * (imgWidth / displayWidth));
        var imgY = Math.round(y * (imgHeight / displayHeight));

        // Create a dot at the clicked position
        var dot = document.createElement("div");
        dot.className = "dot";
        dot.style.left = x + "px";
        dot.style.top = y + "px";
        dot.style.backgroundColor = objectList[currentObject].color;
        dot.dataset.index = dotList.length;
        dot.dataset.object = currentObject;
        dot.dataset.x = imgX;
        dot.dataset.y = imgY;
        document.querySelector(".image-container").appendChild(dot);
        dotList.push(dot);
        objectList[currentObject].dots.push(dot);

        // Update the coordinates list
        updateCoordinatesList();
    });

    document.getElementById("undo-button").addEventListener("click", function() {
        if (dotList.length > 0) {
            var lastDot = dotList.pop();
            if (lastDot) {
                document.querySelector(".image-container").removeChild(lastDot);
                var lastLi = coordinatesList.querySelector('li[data-index="' + (dotList.length) + '"]');
                coordinatesList.removeChild(lastLi);
                var objectName = lastDot.dataset.object;
                var objectDots = objectList[objectName].dots;
                objectList[objectName].dots = objectDots.filter(function(d) { return d !== lastDot; });
                updateCoordinatesList();
            }
        }
    });

    document.getElementById("clear-button").addEventListener("click", function() {
        for (var objectName in objectList) {
            objectList[objectName].dots.forEach(function(dot) {
                if (dot) {
                    document.querySelector(".image-container").removeChild(dot);
                }
            });
            objectList[objectName].dots = [];
        }
        dotList = [];
        updateCoordinatesList();
    });

    document.getElementById("export-button").addEventListener("click", function() {
        var annotations = {};

        for (var objectName in objectList) {
            var objectDots = objectList[objectName].dots.filter(function(dot) {
                return dot !== null;
            }).map(function(dot) {
                return [parseInt(dot.dataset.x), parseInt(dot.dataset.y)];
            });

            annotations[img.src.split("/").pop()] = annotations[img.src.split("/").pop()] || {};
            annotations[img.src.split("/").pop()][objectName] = objectDots;
        }

        var jsonString = JSON.stringify(annotations, null, 2);
        var blob = new Blob([jsonString], {type: "application/json"});
        var url = URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "annotations.json";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    });

    // Initialize the first object
    objectList[currentObject] = {
        dots: [],
        color: objectColors[colorIndex % objectColors.length]
    };
    colorIndex++;
    updateObjectList();
});

