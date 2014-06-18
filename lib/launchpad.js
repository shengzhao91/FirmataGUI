var firmata = require('firmata');

var launchpadObj = function(){console.log('launchpadObj')};
var board;

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

    var count = 10; // update analog every 10 samples
    board.on('analog-read',function(msg){
        // TO-DO: convert msg.pin to physical pin!!!

        if (count == 0) {
            var pinNum = analogChannelArr.indexOf(msg.pin);
            //console.log('Analog Pin' + pinNum + ', value:' + msg.value);
            socket.emit('analogReadRes',{pinNum: pinNum, value:msg.value});
            count = 10; // update analog every 10 samples
        } else {
            count--;
        }
        
    });
};

launchpadObj.initialize =  function(socket, port) {
    //console.log(new Date());
    console.log('initializing board - ' + port);
    board = new firmata.Board(port, function(err) {
        console.log('time' + new Date());
        if (err) {
            console.log(err);
            return;
        }
        console.log('connected - ' + port);

        //console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);

        //socket.emit('boardObjectResponse',board);

        initPinMode(board,socket); // setup the mode for each pin
    });
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

launchpadObj.toggleLED = function(socket) {
    var ledOn = 0;

    socket.on('toggleLED', function(pinNum){
        console.log('Toggle LED' + pinNum + ': ' + ledOn);
        board.pinMode(pinNum, board.MODES.OUTPUT);
        if (!ledOn) {
            console.log('+');
            board.digitalWrite(pinNum, board.HIGH);
        }
        else {
            console.log('-');
            board.digitalWrite(pinNum, board.LOW);
        }

        ledOn = !ledOn;

        //board.analogRead(2,function(value){console.log(value)});
        console.log(board.pins);
    });
}

launchpadObj.populatePins = function(socket) {
    socket.on('populatePinsRequest',function(){
        socket.emit('populatePinsRespond',board);
        //socket.emit('populatePinsRespond',board.pins);
        //socket.emit('boardObjectResponse',board);
    });
}

launchpadObj.togglePin = function(socket) {
    socket.on('togglePin', function(data){
        console.log('Set Pin'+data.pinNum+', '+data.value);
        board.pinMode(data.pinNum, board.MODES.OUTPUT);
        board.digitalWrite(data.pinNum, data.value);
    });
}

launchpadObj.digitalRead = function(socket) {
    socket.on('digitalReadReq', function(pinNum){
        console.log('Read Digital Pin' + pinNum);
        board.pinMode(pinNum, board.MODES.INPUT);
        board.digitalRead(pinNum,function(value){
            console.log('Pin' + pinNum + ': ' + value);
            socket.emit('digitalReadRes', {pinNum:pinNum, value:value});
        });
    })
}

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

launchpadObj.pinMode = function(socket) {
    socket.on('pinModeReq',function(data){
        board.pinMode(data.pinNum, data.mode);
        console.log(data.pinNum + ', mode:'+data.mode);
        if (data.mode == board.MODES.OUTPUT){
            board.digitalWrite(data.pinNum, board.LOW); // OUTPUT default to low
        }

    });
}

module.exports = launchpadObj;

// var board = new firmata.Board('COM9', function(err) {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log('connected');

//     console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);

//     io.on('connection', function(socket){
//         console.log('a user connected');
//         var ledOn = 0;
//         board.pinMode(43, board.MODES.OUTPUT);

//         socket.on('toggleLED', function(){
//             console.log('toggleLED:'+ledOn);

//             if (ledOn) {
//                 console.log('+');
//                 board.digitalWrite(43, board.HIGH);
//             }
//             else {
//                 console.log('-');
//                 board.digitalWrite(43, board.LOW);
//             }

//             ledOn = !ledOn;
                
//         });
//     });


//     setInterval(function(){
//        board.sendI2CConfig(0);
//        board.sendI2CWriteRequest(0x48,[0x0]);

//        board.sendI2CReadRequest(0x48,2,function(data)
//        {
//          //console.log('i2c data: ' + data);
//          //http://www.analog.com/static/imported-files/data_sheets/ADT7410.pdf
//          var analogData = (data[0]*256 + data[1])/8;
//          // 13-bit data
//          temperatureReading = analogData/16;
//          io.emit('tempRead', temperatureReading);
//          console.log('temperature reading: ' + temperatureReading + 'C');
//      });
//    },1000);
// });