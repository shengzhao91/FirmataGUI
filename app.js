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

var temperatureReading = 0;
//var firmata = require('./lib/firmata');
var launchpad = require('./lib/launchpad');
// Enabled socket.io. Disabled server creation in www/bin

var io = require('socket.io').listen(server);

var serialPort = require("serialport");
//var five = require("johnny-five"), board = new five.Board();

var availablePorts = {};
serialPort.list(function (err, ports) {
    availablePorts = ports;
  // ports.forEach(function(port) {
  //   console.log(port.comName);
  //   console.log(port.pnpId);
  //   console.log(port.manufacturer);
  // });
});

io.on('connection',function(socket){
    console.log('a user0 connected');
    socket.emit('listPort', availablePorts);
    socket.on('connectPort',function(selectedPort){
        launchpad.reinitialize(socket,selectedPort); //add reinitialize capability. MUST be called first
        launchpad.initialize(socket, selectedPort);


        //launchpad.analogRead(socket);
    });
    launchpad.sendI2CConfig(socket);
    launchpad.sendI2CWriteRequest(socket);
    launchpad.sendI2CReadRequest(socket);

    //launchpad.readTemperature(socket);
    launchpad.toggleLED(socket);
    //launchpad.populatePins(socket);
    launchpad.togglePin(socket);
    //launchpad.digitalRead(socket);
    
    launchpad.analogWrite(socket);
    launchpad.pinMode(socket);
});


/*var launchpad = {
    initialize: function(){
        console.log('initializing');
        var board = new firmata.Board('COM9', function(err) {
            console.log(new Date());
            if (err) {
                console.log(err);
                return;
            }
            console.log('connected');

            console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);

        io.on('connection', function(socket){
            console.log('a user connected');
            var ledOn = 0;
            board.pinMode(43, board.MODES.OUTPUT);

            socket.on('toggleLED', function(){
                console.log('toggleLED:'+ledOn);

                if (ledOn) {
                    console.log('+');
                    board.digitalWrite(43, board.HIGH);
                }
                else {
                    console.log('-');
                    board.digitalWrite(43, board.LOW);
                }

                ledOn = !ledOn;
                    
            });
        });

        });
    },

};*/


module.exports = app;