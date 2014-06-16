$(document).ready(function() { 
	console.log('Firmata MSP430F5529');

	var socket = io();

	// var i;
	// var digitalReadWritePins = [1, 2, 3, 4, 5, 10];
	// var analogReadPins = [6,7,8];
	// var analogWritePins = [1,9];
	// var optionText = '';
	// for (i=1;i<=10;i++)
	// {
		
	// 	$('#pinDiv').append(
	// 		$('<div></div>').html('pin'+i).attr({'id':'pin'+i,'value':i})
	// 	);

	// 	$('#pin'+i).append($('<select></select>').attr('id','pin'+i+'select'));
	// 	if (-1 != $.inArray(i,digitalReadWritePins) )
	// 	{
	// 		$('#pin'+i+'select').append('<option>Input</option>');
	// 		$('#pin'+i+'select').append('<option>Output</option>');
	// 	}
	// 	if (-1 != $.inArray(i,analogReadPins) )
	// 	{
	// 		$('#pin'+i+'select').append('<option>analogRead</option>');
	// 	}
	// 	if (-1 != $.inArray(i,analogWritePins) )
	// 	{
	// 		$('#pin'+i+'select').append('<option>analogWrite</option>');
	// 	}
	// }

	// $.each($('#pinDiv').children(),function(index,value){
	// 	console.log(value);
	// 	//value.html('asdfh;');
	// });

	$('#populatePinsButton').click(function(e){
		console.log('Populate Pins');
		socket.emit('populatePinsRequest');
	});

	// socket.on('boardObjectResponse',function(boardObject){
	// 	board = boardObject; // bring board object to client side
	// });

	// Initialize #pinDiv on client
	var initPinDiv = function(board){
		$.each(board.pins, function(index, pin){
			// create div structure for each pin
			$pinContainer = $('<div></div>').html('pin'+index).attr({'id':'pin'+index,'value':index,'style':'display: -webkit-box'});
			$pinContainer.append($('<select name="select' +index+'"></select>'));
			$pinContainer.append($('<div class="pin-utility"></div>'));
			$pinDiv.append($pinContainer);


			// dropdown selector
			$selectDropdown = $('select[name="select' +index + '"]');

			// populate select box
			$.each(pin.supportedModes, function(modeIndex,modeValue){
				$optionText = $('<option></option>');

				if (modeValue==board.MODES.INPUT){
					$selectDropdown.append( $optionText.html('Input').val(board.MODES.INPUT) );
					$('#pin'+index+' .pin-utility').html('LOW');
				}
				if (modeValue==board.MODES.OUTPUT){

					if (modeValue == pin.mode) {$optionText.attr('selected',true);}
						
					$selectDropdown.append( $optionText.html('Output').val(board.MODES.OUTPUT) );
					$('#pin'+index+' .pin-utility').html('<button>LOW</button>');
				}
				if (modeValue==board.MODES.ANALOG){
					if (modeValue == pin.mode) {$optionText.attr('selected',true);}
					
					$selectDropdown.append( $optionText.html('Analog').val(board.MODES.ANALOG) );
					$('#pin'+index+' .pin-utility').html(pin.value);
				}
				if (modeValue==board.MODES.PWM){
					$selectDropdown.append( $optionText.html('PWM').val(board.MODES.PWM) );
				}
				if (modeValue==board.MODES.SERVO){
					$selectDropdown.append( $optionText.html('Servo').val(board.MODES.SERVO) );
				}
					
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

/*
	socket.on('populatePinsRespond',function(pinsList){
		console.log(pinsList.length);
		//debug = pinsList;
		$pinDiv = $('#pinDiv');
		$pinDiv.html('');
		// populate the pins based on what target returns
		$.each(pinsList, function(index, pins){
			$pinDiv.append(
				$('<div></div>').html('pin'+index).attr({'id':'pin'+index,'value':index,'style':'display: -webkit-box'})
			);


			// attach event to Output HIGH/LOW. Control pin's value
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


			$('#pin'+index).append($('<select name="select' +index+'"></select>').attr('id','pin'+index+'select'));

			// on select change
			$('#pin'+index+' select').change(function() {
					var selectedMode = $(this).find('option:selected').html();
					var selectedID = $(this).attr('id');
					console.log(selectedID + ': ' + selectedMode);
					if (selectedMode == 'Input'){
						$('#pin'+index+'util').html('LOW');
						console.log('Read pin'+index);
						socket.emit('digitalReadReq',index);
						socket.on('digitalReadRes',function(value){
							console.log('digitalReadRes: ' + value);
							if (value == 0)
								$('#pin'+index+'util').html('LOW');
							else
								$('#pin'+index+'util').html('HIGH');
						});
					} else if (selectedMode == 'Output'){
						$('#pin'+index+'util').html('<button>LOW</button>');
						socket.emit('pinModeReq', {pinNum: index,mode: board.MODES.OUTPUT}); 

					} else if (selectedMode == 'Analog'){
						$('#pin'+index+'util').html(pins.value);
					} else {
						$('#pin'+index+'util').html('0<input type="range" name="points" min="0" max="255" onChange="console.log(this.value)">255');
					}
				});

			// create pinXutil div
			$('#pin'+index).append($('<div></div>').attr('id','pin'+index+'util'));

			// populate select box
			$.each(pins.supportedModes, function(modeIndex,modeValue){
				if (modeValue==0){
					$('#pin'+index+'select').append('<option>Input</option>');
					$('#pin'+index+'util').html('LOW');
				}
				if (modeValue==1){
					$('#pin'+index+'select').append('<option selected>Output</option>');
					$('#pin'+index+'util').html('<button>LOW</button>');
				}
				if (modeValue==2){
					$('#pin'+index+'select').append('<option selected>Analog</option>');
					$('#pin'+index+'util').html(pins.value);
				}
				if (modeValue==3){
					$('#pin'+index+'select').append('<option>PWM</option>');
				}
				if (modeValue==4){
					$('#pin'+index+'select').append('<option>Servo</option>');
				}
					
			});
			

		});
	});
*/

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
// <div class=".pin-utility"></div>
// </div>