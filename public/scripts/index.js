var socket = io();
var map;
var markers = [];
var user = {};

if (navigator.geolocation)
{
    var input = prompt('Tell me your name to enter the service ...');

    while(!input){
        input = prompt('Please give me a name to identify...');
    }

    user.user = input;

    //config Google Maps
    var initialize = function() {
        var mapOptions = {
            center: { lat: 0, lng: 0},
            zoom: 2
        };

        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    };

    google.maps.event.addDomListener(window, 'load', initialize);

    runService();
}
else
{
    alert('No support for geolocation: we can withdraw or use an alternative method');
}


function runService(){

    console.log('Init service notification...');

    var cronPositionNotify = function () {
        navigator.geolocation.getCurrentPosition(funcSuccess, funcError);
    };
    setInterval(cronPositionNotify,1000*5);

    socket.on('notifiedPosition',function(data){
        console.log('Notice his position: '+ data.user);
        placeMarker(data);
    });

    socket.on('userLogOff',function(data){
        console.log('Notice disconnected user: '+ data.user);
        rmUserMark(data);
    });

    window.onbeforeunload = function () {
        socket.emit('logOff', user);
    };

}

function fitMarkers(){
    var bounds = new google.maps.LatLngBounds();

    markers.forEach(function(obj){
        bounds.extend(obj.position);
    });

    map.fitBounds(bounds);
    map.panToBounds(bounds);
}

function funcSuccess(position){
    user.cords = position.coords;
    makersController(user);
    socket.emit('myPosition', user);
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
    console.log('Update posicion: '+ obj.cords.latitude + ' ' +obj.cords.longitude + ' .Usuario: ' + obj.user );
    makersController(obj);
}

function rmUserMark(data){
    markers = markers.filter(function( obj ) {
        if(data.user !== obj.title){
            return true;
        }else{
            obj.setMap(null);
            alertify.error('Notice user logoff: '+data.user+'');
            return false;
        }
    });
}

function makersController(obj) {

    var marker;
    var image;
    var exists = false;
    var latLng = new google.maps.LatLng(obj.cords.latitude, obj.cords.longitude);
    var infoWindow = new google.maps.InfoWindow({
        content: 'User: ' + obj.user + ' - Lat: ' + obj.cords.latitude + ' - Lng: ' + obj.cords.longitude
    });

    markers.forEach(function (data) {

        if (data.title === obj.user) {

            if(!data.position.equals(latLng)){
                data.setPosition(latLng);
                //map.panTo(data.position);
                alertify.log( 'User: ' + obj.user + ' change his position');
            }
            exists = true;
            marker = data;
        }
    });

    if (!exists) {

        if(user.user === obj.user){
            image = {
                url: './src/imgs/marker3.png'
            };
        } else {
            image = {
                url: './src/imgs/marker2.png'
            };
        }

        marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: obj.user,
            draggable: false,
            icon: image,
            animation: google.maps.Animation.DROP
        });

        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open(marker.get('map'), marker);
        });

        markers.push(marker);
        //map.panTo(marker.position);
        alertify.success( 'User: ' + obj.user + ' conected');
    }

}