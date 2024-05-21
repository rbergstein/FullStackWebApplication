var marker2;
var infowindow2;


function initMap() {
    var myLatLng = {lat: 44.9727, lng: -93.23540000000003};
    
    var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: myLatLng
        });
    var geocoder = new google.maps.Geocoder();

    map.addListener('click', function(event) {

        var selectedLocation = event.latLng;

        geocoder.geocode({'location': selectedLocation}, function(results) {
            if (results[0]) {
                document.getElementById('location').value = results[0].formatted_address;
            }
        });
    });

    

    geocodeAddress(geocoder, map, location);  

}

// This function takes a geocode object, a map object, and an address, and 
// if successful in finding the address, it places a marker with a callback that shows an 
// info window when the marker is "clicked"
function geocodeAddress(geocoder, resultsMap, address) {

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