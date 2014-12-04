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
    console.log('User connected');
    //Espero las posiones del resto
    socket.on('position', function(){
        console.log('position');
        //Notifico la posicion que me llego a los otros clientes
        io.emit('notifiedPosition', { for: 'everyone' });
    });

    socket.on('disconnect', function(){
        console.log('User disconnected');
    });

});

