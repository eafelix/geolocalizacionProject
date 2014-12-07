var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function(){
    console.log('listening on *:3000');
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile('index.html');
});

io.on('connection', function(socket){

    socket.on('myPosition', function(data){
        console.log('User: ' + data.user +' position: '+ data.cords.latitude + ' ' +data.cords.longitude);
        socket.broadcast.emit('notifiedPosition', data);
    });

    socket.on('logOff', function(data){
        console.log('User: ' + data.user + ' disconected');
        socket.broadcast.emit('userLogOff', data);
    });

});


