var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));
app.set("view engine", "jade");

app.get('/', function (req, res) {
  res.sendFile(__dirname+'/views/indexsocket.html');
});

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });

    client.on('messages', function(data) {
      funcion();
           client.emit('broad', data);
           client.broadcast.emit('broad',data);
    });
    });

    /*
funcion(){

var resultado =  exec("egrep ... menfino");
resultado = 1111 ;

}


    */


server.listen(3000);
