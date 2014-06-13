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

	socket.on('boardObjectResponse',function(boardObject){
		board = boardObject; // bring board object to client side
	});

	socket.on('populatePinsRespond',function(pinsList){
		console.log(pinsList.length);
		debug = pinsList;
		// populate the pins based on what target returns
		$.each(pinsList, function(index, pins){
			$('#pinDiv').append(
				$('<div></div>').html('pin'+index).attr({'id':'pin'+index,'value':index,'style':'display: -webkit-box'})
			);
			$('#pin'+index).append($('<select name="select' +index+'"></select>').attr('id','pin'+index+'select'))
				.change(function() {
					var selectedMode = $( '#pin' + index + 'select option:selected').html();
					var selectedID = $(this).attr('id');
					console.log(selectedID + ': ' + selectedMode);
					if (selectedMode == 'Input'){
						$('#pin'+index+'util').html('LOW');
					} else if (selectedMode == 'Output'){
						$('#pin'+index+'util').html('<button>LOW</button>');
					}
				});
			$('#pin'+index).append($('<div></div>').attr('id','pin'+index+'util'));

			$.each(pins.supportedModes, function(modeIndex,modeValue){
				if (modeValue==0){
					$('#pin'+index+'select').append('<option>Input</option>');
					$('#pin'+index+'util').html('LOW');
				}
				if (modeValue==1){
					$('#pin'+index+'select').append('<option>Output</option>');
					$('#pin'+index+'util').html('<button>LOW</button>');
				}
				if (modeValue==2){
					$('#pin'+index+'select').append('<option>Analog</option>');
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