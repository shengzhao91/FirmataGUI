var firmata = require('firmata');

var launchpadObj = function(){console.log('launchpadObj')};
var board;

var analogUpdateCnt = 10; // Update analog to browser every X

var initBoard = function(socket,port){
    board = new firmata.Board(port, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('connected - ' + port);
        console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);

        initPinMode(board,socket); // setup the mode for each pin
        socket.emit('boardReady',board);
    });
}

var initPinMode = function(board,socket){
    var i;
    // set every DIGITAL pin to OUTPUT
    for (i=0;i<board.pins.length;i++){
        if (board.pins[i].supportedModes.length) { //supported mode is defined
            // set any non-analog supported modes as OUTPUT, and value LOW
            board.pinMode(i, board.MODES.OUTPUT);
            board.digitalWrite(i, board.LOW);
        }
    }

    // set every ANALOG pin to ANALOG
    for (i=0;i<board.analogPins.length;i++){
        board.pinMode(board.analogPins[i], board.MODES.ANALOG);
    }

    var analogChannelArr = [];
    var j = 0;
    for (j=0;j<board.pins.length;j++) {
        analogChannelArr.push(board.pins[j].analogChannel);
    }

    var count = 0; 
    board.on('analog-read',function(msg){
        if (count >= analogUpdateCnt) { // update analog every X samples
            var pin = analogChannelArr.indexOf(msg.pin);
            //console.log('Analog Pin' + pin + ', value:' + msg.value);
            socket.emit('analogRead',{pin: pin, value:msg.value});
            count = 0;
        } else {
            count++;
        }
    });

    board.on('digital-read',function(msg){
        console.log('Digital Pin' + msg.pin + ': ' + msg.value);
        socket.emit('digitalRead', {pin:msg.pin, value:msg.value});
    });
}

launchpadObj.initialize =  function(socket, port) {
    //if (!board) { // undefined board means first time
        console.log('initializing board - ' + port);
        initBoard(socket,port);
    //} 
    // else { // if board is created, close all ports, and reinitialize
    //     board.sp.close(function(err){
    //         console.log('serial port closed');
    //         console.log('re-initializing board - ' + port);
    //         initBoard(socket,port);
    //     });
    // }
}

launchpadObj.closeSerialPort = function(socket) {
    if (board) {
        board.sp.close(function(){
            console.log('Serial Port ' + board.sp.path + ' closed');
            socket.emit('portClosed');
        });
    } else {
        console.log('Board not initialized. No serial port to close.')
    }
}

launchpadObj.pinMode = function(socket) {
    socket.on('pinMode',function(data){
        board.pinMode(data.pin, data.mode);
        console.log(data.pin + ', mode:'+data.mode);
        if (data.mode == board.MODES.OUTPUT){
            board.digitalWrite(data.pin, board.LOW); // OUTPUT default to low
        }
    });
}

launchpadObj.digitalWrite = function(socket) {
    socket.on('digitalWrite', function(data){
        console.log('Set Pin'+data.pin+', '+data.value);
        //board.pinMode(data.pin, board.MODES.OUTPUT);
        board.digitalWrite(data.pin, data.value);
    });
}

launchpadObj.analogWrite = function(socket) {
    socket.on('analogWrite',function(data){
        console.log('AnalogWrite Pin'+data.pin+', '+data.value);
        board.analogWrite(data.pin,data.value);
    });
}

launchpadObj.sendI2CConfig = function(socket){
    socket.on('I2CInitRequest', function(data){
        console.log('i2c initialize ' + data.addr);
        board.sendI2CConfig(0);
    });
}

launchpadObj.sendI2CReadRequest = function(socket){
    socket.on('I2CReadRequest',function(data){
        console.log('i2c read ' + data.bytecnt + 'bytes');
        board.sendI2CReadRequest(data.addr, data.bytecnt, function(ret){
            console.log('i2c read return' + ret);
            socket.emit('I2CReadRequestRes',ret);
        });
    });
}

launchpadObj.sendI2CWriteRequest = function(socket){
    socket.on('I2CWriteRequest',function(data){
        console.log('i2c write ' + data.value);
        board.sendI2CWriteRequest(data.addr, data.value);
    });
}

launchpadObj.analogFreqUpdate = function(socket){
     socket.on('analogUpdateFreqReq', function(data){
        console.log('analogUpdateFreqReq: ' + data);
        if (data == 'Slow'){
            analogUpdateCnt = 50;
        } else if (data == 'Standard'){
            analogUpdateCnt = 10;
        } else { // Fast
            analogUpdateCnt = 2;
        }
    });
}

launchpadObj.readTemperature = function(socket) {
    console.log('Read Temperature');
    setInterval(function(){
       board.sendI2CConfig(0);
       board.sendI2CWriteRequest(0x48,[0x0]);

       board.sendI2CReadRequest(0x48,2,function(data)
       {
         //console.log('i2c data: ' + data);
         //http://www.analog.com/static/imported-files/data_sheets/ADT7410.pdf
         var analogData = (data[0]*256 + data[1])/8;
         // 13-bit data
         temperatureReading = analogData/16;
         console.log('temperature reading: ' + temperatureReading + 'C');
         socket.emit('tempRead', temperatureReading);
     });
   },1000);
}

module.exports = launchpadObj;
