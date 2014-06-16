var firmata = require('firmata');

var launchpadObj = function(){console.log('launchpadObj')};
var board;

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

        socket.emit('boardObjectResponse',board);
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
        if (!ledOn) {
            console.log('+');
            board.digitalWrite(pinNum, board.HIGH);
        }
        else {
            console.log('-');
            board.digitalWrite(pinNum, board.LOW);
        }

        ledOn = !ledOn;

        board.analogRead(2,function(value){console.log(value)});
            
    });
}

launchpadObj.populatePins = function(socket) {
    socket.on('populatePinsRequest',function(){
        socket.emit('populatePinsRespond',board.pins);
        socket.emit('boardObjectResponse',board);
    });
}

launchpadObj.togglePin = function(socket) {
    socket.on('togglePin', function(data){
        console.log('Set Pin'+data.pinNum+', '+data.value);
        board.pinMode(data.pinNum, board.MODES.OUTPUT);
        board.digitalWrite(data.pinNum, data.value);
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