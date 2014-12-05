var socket = io();
var map;
var users = [];

if (navigator.geolocation)
{
    var myName = prompt('Dime tu nombre para entrar en el servicio...');

    var initialize = function() {
        var mapOptions = {
            center: { lat: -34.397, lng: 150.644},
            zoom: 8
        };

        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    }

    google.maps.event.addDomListener(window, 'load', initialize);

    function runService(){
        console.log('Init service notification');

        navigator.geolocation.getCurrentPosition(funcExito, funcError);

        socket.on('notifiedPosition',function(user){
            placeMarker(user);
        })

        socket.on('userLogOff',function(user){
            rmUserMark(user);
        })
    }

}
else
{
    alert('No hay soporte para la geolocalización: podemos desistir o utilizar algún método alternativo');
}



function funcExito(position){
    socket.emit('myPosition', {name:'pepe', cords:position.cords});
}

function funcError(err){

}

function placeMarker(user) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(user.position.cords.lat,user.position.cords.lng),
        map: map,
        name:user.name
    });
    var infowindow = new google.maps.InfoWindow({
        content: 'Latitude: ' + location.lat() + '<br>Longitude: ' + location.lng()
    });
    infowindow.open(map,marker);
}

//user constructor
function user(data){
    user.name = data.name;
    usar.position = data.position;
}


