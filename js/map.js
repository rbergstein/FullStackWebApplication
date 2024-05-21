var marker2;
var infowindow2;
var source;
var directionsService;
var directionsRenderer;


function initMap() {
    var myLatLng = {lat: 44.9727, lng: -93.23540000000003};
    
    var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: myLatLng
        });
    var geocoder = new google.maps.Geocoder();

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    navigator.geolocation.getCurrentPosition(function(position) {
        source = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    });

    var events = document.querySelectorAll('tr.thumbnail');

    events.forEach(function(row) {
        var eventName = row.querySelector('td:nth-child(2)').textContent;
        var day = row.querySelector('td:nth-child(1)').textContent;
        var time = row.querySelector('td:nth-child(3)').textContent;
        var location = row.querySelector('td:nth-child(4)').textContent;
        

        geocodeAddress(geocoder, map, location, day, time, eventName);  
    });
}

// This function takes a geocode object, a map object, and an address, and 
// if successful in finding the address, it places a marker with a callback that shows an 
// info window when the marker is "clicked"
function geocodeAddress(geocoder, resultsMap, address, day, time, eventName) {

    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
                resultsMap.setCenter(results[0].geometry.location);
                marker2 = new google.maps.Marker({
                            map: resultsMap,
                            position: results[0].geometry.location,
                            title: address
                            });
                infowindow2 = new google.maps.InfoWindow({
                            content: eventName + '</br>' + day + ', ' + time + '</br>' + address
                            });

                google.maps.event.addListener(marker2, 'click', createWindow(resultsMap,infowindow2, marker2));
        } else {
                alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Function to return an anonymous function that will be called when the rmarker created in the 
// geocodeAddress function is clicked	
function createWindow(rmap, rinfowindow, rmarker){
        return function(){
            rinfowindow.open(rmap, rmarker);
        }
}

function calculateRoute() {
    var destination = document.getElementById('destination').value;
    var transportation = document.querySelector('input[name="travelMode"]:checked').value;

    var request = {
        origin: source,
        destination: destination,
        travelMode: transportation
    };
    console.log(request);
    console.log(destination);
    console.log(transportation);

    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            directionsRenderer.setPanel(document.getElementById('direction-panel'));
            // document.getElementById('directionsText').value = 'hi';
        }
    });    
}

