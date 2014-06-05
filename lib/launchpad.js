var firmata = require('firmata');
var myCallback = function(err) {
            console.log('time' + new Date());
            if (err) {
                console.log(err);
                return;
            }
            console.log('connected');

            console.log('Firmware: ' + board.firmware.name + '-' + board.firmware.version.major + '.' + board.firmware.version.minor);
        };

var launchpadObj = {
    initialize: function() {
        //console.log(new Date());
        console.log('initializing board.');
        var board = new firmata.Board('COM9', myCallback);

    }
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