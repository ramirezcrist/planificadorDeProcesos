var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');//Para agregar FileSystem
var exec = require('child_process').exec,child, child1;;

app.use(express.static(__dirname + '/node_modules'));
app.set("view engine", "jade");

app.get('/', function (req, res) {
  res.sendFile(__dirname+'/views/index.html');
});

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(data) {
    console.log(data);
    client.emit('messages', 'Hello from server');
  });

  client.on('messages', function(data) {
    client.emit('broad', data);
    client.broadcast.emit('broad',data);
  });
  setInterval(function(){
    updateProcessInfo();
    var lineas = funcionProcesos();
    client.emit('broad', lineas);
  }, 2000);//fin interaval.. 2 milisegundo
}); //fin io

function updateProcessInfo(){
  child = exec("ls -l /proc | grep \"^d\" | awk -F\" \" '{print $9}' > /home/ubuntu/proyecto/lista.txt",
  function (error, stdout, stderr)
  {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      console.log(stdout);
    }
  });
}

function funcionProcesos(){
  var contents = fs.readFileSync('/home/ubuntu/proyecto/lista.txt');
  var lines = contents.toString().split('\n').length - 1;
  console.log(lines);
}

server.listen(3000);
