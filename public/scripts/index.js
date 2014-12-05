var socket = io();
var map;
var markers = [];
var user = {};

if (navigator.geolocation)
{
    user.user = prompt('Dime tu nombre para entrar en el servicio...');

    while(user.user === '' || user.user === undefined){
        user.user = prompt('Por favor dame un nombre para identificarte...');
    }

    //config Google Maps
    var initialize = function() {
        var mapOptions = {
            center: { lat: -34.397, lng: 150.644},
            zoom: 8
        };

        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    }

    google.maps.event.addDomListener(window, 'load', initialize);

    runService();
}
else
{
    alert('No hay soporte para la geolocalización: podemos desistir o utilizar algún método alternativo');
}


function runService(){
    console.log('Init service notification...');

    console.log('Cron notify position...');
    var cronPositionNotify = function () {
        navigator.geolocation.getCurrentPosition(funcExito, funcError);
    }
    setInterval(cronPositionNotify,1000*5);

    socket.on('notifiedPosition',function(data){
        console.log('Notificando nueva posicion: '+ data.user);
        placeMarker(data);
    })

    socket.on('userLogOff',function(data){
        console.log('Notificando Desconexion: '+ data.user);
        rmUserMark(data);
    })

    window.onbeforeunload = function () {
        socket.emit('logOff', user);
    }

    //fit zoom to markers
    var bounds = new google.maps.LatLngBounds();

    markers.forEach(function(obj){
        bounds.extend(obj.position);
    })

    map.fitBounds(bounds);
}

function funcExito(position){

    user.cords = position.coords;

    socket.emit('myPosition', user);
    makersController(user);
}

function funcError(err){
   if(err.code === 0){
       alertify.error( 'Unknown error');
   } else if (err.code === 1){
       alertify.error( 'Without permission, the service doesnt work');
   } else if (err.code === 2){
       alertify.error( 'Position unavailable');
   } else if (err.code === 3){
       alertify.error( 'TimeOut!');
   }
}

function placeMarker(obj) {
    console.log('Update position: '+obj);
    makersController(obj);
}

function rmUserMark(data){
    markers = markers.filter(function( obj ) {
        return obj.user !== data.user;
    });

    alertify.error( 'User: ' + obj.user + ' disconected');
}

var makersController = function (obj) {

    var marker;
    var exists = false;
    var latLng = new google.maps.LatLng(obj.cords.latitude, obj.cords.longitude);
    var infoWindow = new google.maps.InfoWindow({
        content: 'User: ' + obj.user + '.Lat: ' + obj.cords.latitude + '.Lng: ' + obj.cords.longitude
    });

    markers.forEach(function (data) {

        if (data.title === obj.user) {

            console.log(data.position.lat() + '  ' +  obj.cords.latitude +'  ' + data.position.lng() + '  '+ obj.cords.longitude)

            if(data.position.lat() !== obj.cords.latitude || data.position.lng() !== obj.cords.longitude){

                data.position = latLng
                map.panTo(data.position);
                alertify.log( 'User: ' + obj.user + ' change his position');

            }
            exists = true
            marker = data
        }
    })

    if (!exists) {

        marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: obj.user,
            draggable: false,
            animation: google.maps.Animation.DROP
        });

        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(marker.get('map'), marker);
        });

        markers.push(marker);

        map.panTo(marker.position);
        alertify.success( 'User: ' + obj.user + ' conected');
    }

}







