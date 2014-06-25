var firmata = require('firmata');

var launchpadObj = function(){console.log('launchpadObj')};
var board;

var analogUpdateCnt = 10; // Update analog to browser every X

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
            var pinNum = analogChannelArr.indexOf(msg.pin);
            //console.log('Analog Pin' + pinNum + ', value:' + msg.value);
            socket.emit('analogReadRes',{pinNum: pinNum, value:msg.value});
            count = 0;
        } else {
            count++;
        }
        
    });

    board.on('digital-read',function(msg){
        console.log('Digital Pin' + msg.pin + ': ' + msg.value);
        socket.emit('digitalReadRes', {pinNum:msg.pin, value:msg.value});
    });
    
};

launchpadObj.reinitialize = function(socket,port) {
    // if board is conncted, close all ports, and reinitialize
    if (board){
        //console.log(board.sp);
        board.sp.close(function(err){
            console.log('closed all ports');
            console.log('re-initializing board - ' + port);
            board = new firmata.Board(port, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('connected - ' + port);
                console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);

                initPinMode(board,socket); // setup the mode for each pin
                socket.emit('populatePinsRespond',board);
            });
        });
    }
}

launchpadObj.initialize =  function(socket, port) {
    // undefined board means first time
    if (!board) {
        console.log('initializing board - ' + port);
        board = new firmata.Board(port, function(err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('connected - ' + port);
            console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);

            initPinMode(board,socket); // setup the mode for each pin
            socket.emit('populatePinsRespond',board);
        });
    }
};

launchpadObj.readTemperature = function(socket) {
    console.log('Read Temperature');
    //console.log(board);
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

launchpadObj.sendI2CConfig = function(socket){
    socket.on('I2CInitRequest', function(data){
        console.log('i2c initialize ' + data.addr);
        board.sendI2CConfig(0);
    });
}

launchpadObj.sendI2CWriteRequest = function(socket){
    socket.on('I2CWriteRequest',function(data){
        console.log('i2c write ' + data.value);
        board.sendI2CWriteRequest(data.addr, data.value);
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

launchpadObj.togglePin = function(socket) {
    socket.on('togglePin', function(data){
        console.log('Set Pin'+data.pinNum+', '+data.value);
        board.pinMode(data.pinNum, board.MODES.OUTPUT);
        board.digitalWrite(data.pinNum, data.value);
    });
}

launchpadObj.analogWrite = function(socket) {
    socket.on('analogWriteReq',function(data){
        console.log('AnalogWrite Pin'+data.pin+', '+data.value);
        board.analogWrite(data.pin,data.value);
    });
}

launchpadObj.pinMode = function(socket) {
    socket.on('pinModeReq',function(data){
        board.pinMode(data.pinNum, data.mode);
        console.log(data.pinNum + ', mode:'+data.mode);
        if (data.mode == board.MODES.OUTPUT){
            board.digitalWrite(data.pinNum, board.LOW); // OUTPUT default to low
        }

    });
}

// launchpadObj.digitalRead = function(socket) {
//     socket.on('digitalReadReq', function(pinNum){
//         console.log('Read Digital Pin' + pinNum);
//         board.pinMode(pinNum, board.MODES.INPUT);
//         board.digitalRead(pinNum,function(value){
//             console.log('Pin' + pinNum + ': ' + value);
//             socket.emit('digitalReadRes', {pinNum:pinNum, value:value});
//         });
//     })
// }

// launchpadObj.analogRead = function(socket) {
//     // socket.on('analogReadReq', function(data){
//     //     console.log('Read Analog Pin' + data.pinNum);
//     //     board.pinMode(data.pinNum, board.MODES.ANALOG);
//     //     board.on('analog-read',function(msg){
//     //         console.log('Analog Pin' + data.pinNum + ', value:' + msg.value);
//     //         socket.emit('analogReadRes',{pinNum:data.pinNum, value:msg.value});
//     //     })
//     // });

//         console.log('analog - connected');
//         var analogChannelArr = [];
//         var i = 0;
//         for (i=0;i<board.pins.length;i++) {
//             analogChannelArr.push(board.pins[i].analogChannel);
//         }

//         board.on('analog-read',function(msg){
//             // TO-DO: convert msg.pin to physical pin!!!

//             var pinNum = analogChannelArr.indexOf(msg.pin);
//             console.log(msg.pin);
//             console.log(analogChannelArr);
//             console.log(board.pins.length);
//             //console.log('Analog Pin' + pinNum + ', value:' + msg.value);
//             //socket.emit('analogReadRes',{pinNum: pinNum, value:msg.value});
//         });

// }

module.exports = launchpadObj;
