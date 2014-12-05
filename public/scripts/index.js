var socket = io();
var map;
var markers = [];

if (navigator.geolocation)
{
    var myName = prompt('Dime tu nombre para entrar en el servicio...');

    while(myName === '' || myName === undefined){
        myName = prompt('Por favor dame un nombre para identificarte...');
    }

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
    var cronPositionNotify = navigator.geolocation.getCurrentPosition(funcExito, funcError);
    setInterval(cronPositionNotify,1000);

    socket.on('notifiedPosition',function(data){
        placeMarker(data);
    })

    socket.on('userLogOff',function(data){
        rmUserMark(data);
    })
}

function funcExito(position){

    var exists = false;
    var count = 0;
    var user = {
            user: myName,
            cords: position.coords
        };

    socket.emit('myPosition', user);

    markers.forEach(function(obj){
        if(obj.title === myName){
            obj.position = new google.maps.LatLng(position.cords.latitude, position.cords.longitude)
            exists = true
        }
    })

    if(!exists){

        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var marker = new google.maps.Marker({
            position: latLng,
            title: myName
        });

        var infowindow = new google.maps.InfoWindow({
            content:  'ME'
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(marker.get('map'), marker);
        });

        markers.push(marker);
    }

    if(count === 0 ){
        map.panTo(latLng);
    }

}

function funcError(err){

}

function rmUserMark(data){
    markers = markers.filter(function( obj ) {
        return obj.user !== data.user;
    });

    alert('Disconected User: '+ data.user);
}

function placeMarker(obj) {

    var exists = false;

    console.log('Update position: '+obj);

    makersController();
}

var makersController = function (obj) {

    var latLng = new google.maps.LatLng(obj.cords.latitude, obj.cords.longitude);

    markers.forEach(function (data) {
        if (data.title === obj.user) {
            data.position = latLng
            exists = true
        }
    })

    if (!exists) {


        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: obj.user,
            id:

        });

        var infowindow = new google.maps.InfoWindow({
            content: 'User: ' + obj.user + 'Lat: ' + obj.cords.latitude + '. Lng: ' + obj.cords.longitude
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(marker.get('map'), marker);
        });

        alert('New User: ' + obj.user);

        map.panTo(latLng);
    }

}

//user constructor
function user(data){
    user.name = data.name;
    usar.position = data.position;
}


