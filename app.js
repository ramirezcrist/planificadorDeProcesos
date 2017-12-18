var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');//Para agregar FileSystem
var exec = require('child_process').exec,child, child1, childPrincipal;;

var contadorActivos = 0;//R
var contadorSleep = 0;//S
var contadorsTopped = 0;//T
var contadorZombies = 0;//Z

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
    var salida = "Total procesos = " + lineas + " Total sleeping: "+ contadorSleep;
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

function funcionProcesos(){//devuelve numero de lineas: osea numero de procesos
  var contents = fs.readFileSync('/home/ubuntu/proyecto/lista.txt');
  var lines = contents.toString().split('\n').length - 1;
  var cont = 0;

  while (cont<lines) {
    var direccion = "cp /proc/" + lines[cont] + "/stat "+ "/home/ubuntu/proyecto/descripcionProceso.txt");
    childPrincipal = exec(direccion);
    numeroProcesosActivos();

    cont++;
  }
  console.log(lines);
  return lines;
}

function numeroProcesosActivos(){//muestra el numero de procesos activos
  var contents = fs.readFileSync('/home/ubuntu/proyecto/descripcionProceso.txt');

  var lines = contents.toString().split('\n');
    if(lines[2].indexOf("R") != -1){//esta en runnable
        contadorActivos= contadorActivos +1;
    }
    if(lines[2].indexOf("S") != -1){//esta en sleep
        contadorSleep= contadorSleep + 1;
    }
    if(lines[2].indexOf("T") != -1){//esta en sTopped
        contadorsTopped= contadorsTopped + 1;
    }
    if(lines[2].indexOf("Z") != -1){//esta en zombie
        contadorsTopped= contadorsTopped + 1;
    }
  //ejectuar ps "num proceso"
}

server.listen(4000);

/*
Status del proceso, estos pueden ser los siguientes
R runnable, en ejecución, corriendo o ejecutándose
S sleeping, proceso en ejecución pero sin actividad por el momento, o esperando por algún evento para continuar
T sTopped, proceso detenido totalmente, pero puede ser reiniciado
Z zombie, difunto, proceso que por alguna razón no terminó de manera correcta, no debe haber procesos zombies
D uninterruptible sleep, son procesos generalmente asociados a acciones de IO del sistema
X dead, muerto, proceso terminado pero que sigue apareciendo, igual que los Z no deberían verse nunca
*/
