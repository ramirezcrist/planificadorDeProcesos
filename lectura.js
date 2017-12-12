var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var exec = require('child_process').exec,child, child1;;
