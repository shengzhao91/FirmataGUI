$(document).ready(function() { 
	console.log('Firmata MSP430F5529');

	var socket = io();

	$('#populatePinsButton').click(function(e){
		console.log('Populate Pins');
		socket.emit('populatePinsRequest');
	});

	// socket.on('boardObjectResponse',function(boardObject){
	// 	board = boardObject; // bring board object to client side
	// });

	socket.on('analogReadRes', function(data){
		console.log('analogReadRes: pin' + data.pinNum + ' - ' + data.value);
		$('#pin'+data.pinNum+' .pin-analog').html(data.value);
	});

	socket.on('digitalReadRes',function(data){
		console.log('digitalReadRes: pin' + data.pinNum + ' - ' + data.value);
		$('#pin'+data.pinNum+' .pin-input').html(data.value?'HIGH':'LOW');
	});

	// Initialize #pinDiv on client
	var initPinDiv = function(board){
		$.each(board.pins, function(index, pin){
			// create div structure for each pin
			$pinContainer = $('<div></div>').html('pin'+index).attr({'id':'pin'+index,'value':index,'style':'display: -webkit-box'});
			$pinContainer.append($('<select name="select' +index+'"></select>'));
			$pinContainer.append($('<div class="pin-analog"></div>').hide());
			$pinContainer.append($('<div class="pin-input"></div>').hide());
			$pinContainer.append($('<div class="pin-output"></div>').hide());
			$pinContainer.append($('<div class="pin-pwm"></div>').hide());
			$pinContainer.append($('<div class="pin-servo"></div>').hide());
			$pinDiv.append($pinContainer);


			// dropdown selector
			$selectDropdown = $('select[name="select' +index + '"]');

			// populate select box
			$.each(pin.supportedModes, function(modeIndex,modeValue){
				$optionText = $('<option></option>');

				if (modeValue==board.MODES.INPUT){
					$('#pin'+index+' .pin-input').html(pin.value?'HIGH':'LOW');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-input').show();
					}
					$selectDropdown.append( $optionText.html('Input').val(board.MODES.INPUT) );
				}
				if (modeValue==board.MODES.OUTPUT){
					$('#pin'+index+' .pin-output').html('<button>LOW</button>');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-output').show();
					}
					$selectDropdown.append( $optionText.html('Output').val(board.MODES.OUTPUT) );
				}
				if (modeValue==board.MODES.ANALOG){
					$('#pin'+index+' .pin-analog').html(pin.value);
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-analog').show();
					}
					$selectDropdown.append( $optionText.html('Analog').val(board.MODES.ANALOG) );
				}
				if (modeValue==board.MODES.PWM){
					$('#pin'+index+' .pin-pwm').html('0<input name="pwm" type="range" name="points" min="0" max="255">255');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-pwm').show();
					}
					$selectDropdown.append( $optionText.html('PWM').val(board.MODES.PWM) );
				}
				if (modeValue==board.MODES.SERVO){
					$('#pin'+index+' .pin-servo').html('0<input name="servo" type="range" name="points" min="0" max="180">180');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-servo').show();
					}
					$selectDropdown.append( $optionText.html('Servo').val(board.MODES.SERVO) );
				}
					
			});

			$selectDropdown.change(function() {
				var selectedMode = $(this).find('option:selected').html();
				var selectedName = $(this).attr('name');
				console.log(selectedName + ': ' + selectedMode + ', index:'+index);
				if (selectedMode == 'Input'){
					// TO-DO: pin.value only updates after clicking populate pins.
					$('#pin'+index+' .pin-input').show().siblings("div").hide(); 
					console.log('DigitalRead pin'+index);
					socket.emit('pinModeReq', {pinNum: index,mode: board.MODES.INPUT}); 
					//socket.emit('digitalReadReq',index);
				} else if (selectedMode == 'Output'){
					$('#pin'+index+' .pin-output').show().siblings("div").hide();
					socket.emit('pinModeReq', {pinNum: index,mode: board.MODES.OUTPUT}); 

				} else if (selectedMode == 'Analog'){
					$('#pin'+index+' .pin-analog').show().siblings("div").hide();
					socket.emit('pinModeReq', {pinNum: index,mode: board.MODES.ANALOG});
					//socket.emit('analogReadReq',{pinNum:index, analogPinNum:pin.analogChannel}); //pin.analogChannel
				} else if (selectedMode == 'PWM'){
					$('#pin'+index+' .pin-pwm').show().siblings("div").hide();
					socket.emit('pinModeReq', {pinNum: index,mode: board.MODES.PWM});
				} else {
					$('#pin'+index+' .pin-servo').show().siblings("div").hide();
					socket.emit('pinModeReq', {pinNum: index,mode: board.MODES.SERVO});
				}
			});

			// OUTPUT button logic
			$('#pin'+index).on('click',  'button', function(event){
				console.log('clicked');
				if($(this).html() == 'HIGH') {
					$(this).html('LOW');
					socket.emit('togglePin',
						{ pinNum:$(this).parent().parent().attr('value'), value: 0} );
				} else {
					$(this).html('HIGH');
					socket.emit('togglePin',
						{ pinNum:$(this).parent().parent().attr('value'), value: 1} );
				}
			});

			$('#pin'+index+' .pin-pwm input[name=pwm]').change(function(event){
				debug = this;
				var pinNum = Number( $(debug).parent().parent().attr('value') );
				var value = $(this).val();
				console.log('pwm pin' + pinNum + ', value: ' + value);
				socket.emit('analogWriteReq',{pin:pinNum, value:value});
			});

			$('#pin'+index+' .pin-servo input[name=servo]').change(function(event){
				debug = this;
				var pinNum = Number( $(debug).parent().parent().attr('value') );
				var degree = $(this).val();
				console.log('servo pin' + pinNum + ', degree: ' + degree);
				socket.emit('analogWriteReq',{pin:pinNum, value:degree});
			});



		});
	};

	

	// var initTargetPinMode = function(board){
	// 	var analogPinNums = board.analogPins;
	// 	$.each(analogPinNums, function(index,analogPinNum){
	// 		board.pins[analogPinNum]
	// 	});
	// };

	socket.on('populatePinsRespond',function(board){
		$pinDiv = $('#pinDiv');
		$pinDiv.html(''); // empty existing pinDiv
		myboard = board;
		initPinDiv(board);			//initialize #pinDiv structure on client
		//initTargetPinMode(board);	//initialize pin mode on target
		
	});

	$('#initButton').click(function(e){
		
		var selectedPort = $('#portListSelect :selected').text();
		console.log('Connect Port - ' + selectedPort);
		socket.emit('connectPort',selectedPort);
	});

	socket.on('tempRead',function(msg){
		$(".TemperatureReading").html(msg);
	});

	socket.on('listPort',function(msg){
		$.each(msg, function(index, serialInfo) {
			$('#portListSelect').append(
				$('<option></option>').val(index).html(serialInfo.comName)
			);
		});
	});

	$("#ledButton").click(function(e){
		console.log('LED toggled');
		socket.emit('toggleLED',43);
	});

});

// Pin structure
// <div id="pin2" value="2" style="display: -webkit-box">
// pin2
// <select name="select2">
// 	<option value="0">INPUT</option>
// </select>
// <div class=".pin-analog"></div>
// <div class=".pin-input"></div>
// <div class=".pin-output"></div>
// <div class=".pin-pwm"></div>
// <div class=".pin-servo"></div>
// </div>