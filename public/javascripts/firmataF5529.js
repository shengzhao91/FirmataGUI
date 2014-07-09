$(document).ready(function() { 
	console.log('Firmata MSP430F5529');

	var socket = io();
	var launchpad = new LaunchPad(socket);

	launchpad.getPortList(function(msg){
		$.each(msg, function(index, serialInfo) {
			$('#portListSelect').append(
				$('<option></option>').val(index).html(serialInfo.comName)
			);
		});
	});

	$connectBtn = $('#connectBtn');
	$disconnectBtn = $('#disconnectBtn');

	$connectBtn.click(function(){
		$connectBtn.attr("disabled", "disabled");     // disable connect button after clicked

		var selectedPort = $('#portListSelect :selected').text();
		console.log('Connect Port - ' + selectedPort);
		launchpad.connect(selectedPort, function(board){
			myboard = board;			// debug purpose
			$('#pinDiv').html(''); 			// empty existing pinDiv
			initPinDiv(board);			//initialize #pinDiv structure on client

			$connectBtn.hide().removeAttr("disabled"); //once connected, hide the connect button
			$disconnectBtn.show();				   //show disconnect button
			$('#pinDiv').show();
			$('#rightPanel').show();
		});
	});

	$disconnectBtn.click(function(){
		$disconnectBtn.attr("disabled", "disabled");     // disable disconnect button after clicked
		launchpad.disconnect(function(){
			$disconnectBtn.hide().removeAttr("disabled"); //once disconnected, hide the disconnect button
			$connectBtn.show();				   //show connect button

			$('#pinDiv').hide();
			$('#rightPanel').hide();
		});
	});

	launchpad.analogRead(function(data){
		//console.log('analogReadRes: pin' + data.pin + ' - ' + data.value);
		$('#pin'+data.pin+' .pin-analog').html(data.value);
	});

	launchpad.digitalRead(function(data){
		//console.log('digitalReadRes: pin' + data.pin + ' - ' + data.value);
		$('#pin'+data.pin+' .pin-input').html(data.value?'HIGH':'LOW');
	});

	$('#analogUpdateFreqSelect').change(function(){
		var updateMode = $(this).find('option:selected').html();
		console.log('analog update frequency mode: ' + updateMode);
		launchpad.setAnalogUpdateFreq(updateMode);
	});

	$('#i2cInitBtn').click(function(){
		var slaveAddrText = $('#i2cSlaveAddrTextbox').val();
		if (slaveAddrText) {
			var slaveAddress = [slaveAddrText].map(Number);
			if (slaveAddress){
				console.log('I2C Initialize: ' + slaveAddress);
				launchpad.i2cInit(slaveAddress);
			}
		}
	});

	$('#i2cReadBtn').click(function(){
		var slaveAddrText = $('#i2cSlaveAddrTextbox').val();
		if (slaveAddrText) {
			var slaveAddress = [slaveAddrText].map(Number);
		}
		var readCount = $('#i2cByteCntTextbox').val();
		if (slaveAddress && readCount){
			console.log('I2C Read'+ slaveAddress + ": " + readCount + " bytes");
			launchpad.i2cRead(slaveAddress,readCount, function(msg){
				console.log(msg);
				$('#i2cResultTextbox').val(msg);
				i2cResult = msg;
			});
		} else {
			console.log("I2C Invalid Data " + slaveAddress + ": " + readCount);
		}
	});

	$('#i2cWriteBtn').click(function(){
		var slaveAddrText = $('#i2cSlaveAddrTextbox').val();
		if (slaveAddrText) {
			var slaveAddress = [slaveAddrText].map(Number);
		}

		var text = $('#i2cSendTextbox').val();
		if (text){
			var textArr = text.split(",");		// raw text to text array
			var dataArr = textArr.map(Number);	//text array to number array
		}

		if (slaveAddress && dataArr){
			console.log("I2C Send " + slaveAddress + ": " + dataArr);
			launchpad.i2cWrite(slaveAddress,dataArr);
		} else {
			console.log("I2C Invalid Data " + slaveAddress + ": " + dataArr);
		}
	});

	// Initialize #pinDiv on client
	var initPinDiv = function(board){
		$pinDiv = $('#pinDiv');
		$.each(board.pins, function(index, pin){
			// create div structure for each pin
			$pinContainer = $('<div></div>').attr({'id':'pin'+index,'value':index,'class':'form-inline'});
			var pinNumLabel = index>9?index:"0"+index;
			$pinContainer.append($('<label class="control-label">pin'+pinNumLabel+'</label>'));
			
			// check whether the pin can be controlled
			if (pin.supportedModes.length) {
				$pinContainer.append($('<select name="select' +index+'" class="form-control"></select>'));
				$pinContainer.append($('<div class="pin-analog"></div>').hide());
				$pinContainer.append($('<div class="pin-input"></div>').hide());
				$pinContainer.append($('<div class="pin-output"></div>').hide());
				$pinContainer.append($('<div class="pin-pwm"></div>').hide());
				$pinContainer.append($('<div class="pin-servo"></div>').hide());	
			}
			
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
					$('#pin'+index+' .pin-output').html('<button class="btn btn-default">LOW</button>');
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

			// after new mode is selected from the dropdown
			$selectDropdown.change(function() {
				var selectedMode = $(this).find('option:selected').html();
				var selectedName = $(this).attr('name');
				console.log(selectedName + ': ' + selectedMode + ', index:'+index);
				if (selectedMode == 'Input'){
					$('#pin'+index+' .pin-input').show().siblings("div").hide(); 
					launchpad.setPinMode(index,board.MODES.INPUT);
				} else if (selectedMode == 'Output'){
					$('#pin'+index+' .pin-output').show().siblings("div").hide();
					launchpad.setPinMode(index,board.MODES.OUTPUT);
				} else if (selectedMode == 'Analog'){
					$('#pin'+index+' .pin-analog').show().siblings("div").hide();
					launchpad.setPinMode(index,board.MODES.ANALOG);
				} else if (selectedMode == 'PWM'){
					$('#pin'+index+' .pin-pwm').show().siblings("div").hide();
					launchpad.setPinMode(index,board.MODES.PWM);
				} else {
					$('#pin'+index+' .pin-servo').show().siblings("div").hide();
					launchpad.setPinMode(index,board.MODES.SERVO);
				}
			});

			// OUTPUT button logic
			$('#pin'+index).on('click',  'button', function(event){
				if($(this).html() == 'HIGH') {
					$(this).html('LOW');
					launchpad.digitalWrite($(this).parent().parent().attr('value'), 0);
				} else {
					$(this).html('HIGH');
					launchpad.digitalWrite($(this).parent().parent().attr('value'), 1);
				}
			});

			// pwm slider
			$('#pin'+index+' .pin-pwm input[name=pwm]').on('input',function(event){
				debug = this;
				var pinNum = Number( $(debug).parent().parent().attr('value') ); //changed slider's pin #
				var value = $(this).val();
				console.log('pwm pin' + pinNum + ', value: ' + value);
				launchpad.analogWrite(pinNum,value);
			});

			// servo slider
			$('#pin'+index+' .pin-servo input[name=servo]').on('input',function(event){
				debug = this;
				var pinNum = Number( $(debug).parent().parent().attr('value') ); //changed slider's pin #
				var degree = $(this).val();
				console.log('servo pin' + pinNum + ', degree: ' + degree);
				launchpad.analogWrite(pinNum,degree);
			});
		});
	};
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