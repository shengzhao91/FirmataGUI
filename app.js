var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(3000, function(){
    console.log('   app listening on http://localhost:3000');
});
//var server2 = app.listen(3001);

var LaunchpadServer = require('./lib/launchpad');

// Enabled socket.io. Disabled server creation in www/bin
var io = require('socket.io').listen(server);

var serialPort = require("serialport");

var availablePorts = {};

io.on('connection',function(socket){
    console.log('user0 connected');
    var launchpad = new LaunchpadServer();

    serialPort.list(function (err, ports) {
        availablePorts = ports;
        // ports.forEach(function(port) {
        //   console.log(port.comName);
        //   console.log(port.pnpId);
        //   console.log(port.manufacturer);
        // });
    });
    
    socket.on('listPortReq',function(){
        socket.emit('listPortRes', availablePorts);
    })
    socket.on('connectPort',function(selectedPort){
        launchpad.initialize(socket, selectedPort);
        launchpad.digitalWrite(socket);
        launchpad.analogWrite(socket);
        launchpad.pinMode(socket);
        launchpad.analogFreqUpdate(socket);
        launchpad.sendI2CConfig(socket);
        launchpad.sendI2CWriteRequest(socket);
        launchpad.sendI2CReadRequest(socket);
    });

    socket.on('disconnectPort',function(){
        launchpad.closeSerialPort(socket);
    });

    socket.on('disconnect', function(){
        console.log('user0 disconnected');
        launchpad.closeSerialPort(socket);
    });
});

module.exports = app;