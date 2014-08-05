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
			$('#boosterpackPinDiv').html(''); 			// empty existing pins
			$('#extraPinDiv').html(''); 			// empty existing pins
			initPinDiv(board);			//initialize pin layout
			initGraph();

			$connectBtn.hide().removeAttr("disabled"); //once connected, hide the connect button
			$disconnectBtn.show();				   //show disconnect button
		});
	});

	$disconnectBtn.click(function(){
		$disconnectBtn.attr("disabled", "disabled");     // disable disconnect button after clicked
		launchpad.disconnect(function(){
			$disconnectBtn.hide().removeAttr("disabled"); //once disconnected, hide the disconnect button
			$connectBtn.show();				   //show connect button

			$('#boosterpackPinDiv').html(''); 			// empty existing pins
			$('#extraPinDiv').html(''); 			// empty existing pins
		});
	});

	var cnt = 0;
	var curDataset = [];

	launchpad.analogRead(function(data){
		//console.log('analogReadRes: pin' + data.pin + ' - ' + data.value);
		$('#pin'+data.pin+' .pin-analog').html(data.value);

		if (data.pin == 26){
			curDataset[0] = data.value;
		}
		if (data.pin == 2){
			curDataset[1] = data.value;
		}
		if (curDataset[0] & curDataset[1]) {
			window.myLine.addData(curDataset,'');
			cnt++;
			curDataset = [];

			if (cnt > 40){ // number of points to display on chart
				window.myLine.removeData();
				cnt--;
			}
		}
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

	var initPinDiv = function(board){

		var boosterpackPinDiv = $('#boosterpackPinDiv');
		boosterpackPinDiv.append('<div id="pin1to10" class="col-sm-1 pin-col"></div>');
		boosterpackPinDiv.append('<div id="pin21to30" class="col-sm-1 pin-col"></div>');
		boosterpackPinDiv.append('<div id="pin31to40" class="col-sm-offset-8 col-sm-1 pin-col"></div>');
		boosterpackPinDiv.append('<div id="pin11to20" class="col-sm-1 pin-col"></div>');

		var extraPinDiv = $('#extraPinDiv');

		var boardPinCount = board.pins.length;
		// if (boardPinCount>=20 && boardPinCount<=40){
		// 	// 20-pin board
		// } else if (boardPinCount>=40 && boardPinCount<=60){
		// 	// 40-pin board
		// } else {
		// 	// 80-pin board
		// }
		$.each(board.pins, function(index, pin){
			var pinButton = $('<button></button>').html(index).attr(
				{'id':'pinBtn'+index, 'value':index, 'class':'btn btn-default btn-block',
				'tooltip-title':'pin'+index}); //btn-block
			
			if (((index>=1) && (index<=10)) || ((index>=31) && (index<=40))) {
				pinButton.attr('popover-placement','left');
			}

			if (((index>=11) && (index<=20)) || ((index>=21) && (index<=30))) {
				pinButton.attr('popover-placement','right');
			}

			if ((index>=41) && (index<=boardPinCount)) {
				pinButton.attr('popover-placement','top');
			}

			// pinButton.tooltip({
			// 	title : pinButton.attr("tooltip-title"),
			// 	//placement : pinButton.attr("tooltip-placement"),
			//     trigger: 'hover',
			//     container:'body'
			// });

			var pinContainer = $('<div></div>').attr({'id':'pin'+index,'value':index,'class':'form-inline'});
			var selectDropdown = $('<select></select>').attr({'name':'select'+index,'class':'form-control'});

			// check whether the pin can be controlled
			if (pin.supportedModes.length) {
				pinContainer.append(selectDropdown);
				pinContainer.append($('<div class="pin-placeholder"></div>'));
				pinContainer.append($('<div class="pin-analog"></div>').hide());
				pinContainer.append($('<div class="pin-input"></div>').hide());
				pinContainer.append($('<div class="pin-output"></div>').hide());
				pinContainer.append($('<div class="pin-pwm"></div>').hide());
				pinContainer.append($('<div class="pin-servo"></div>').hide());	
			}

			pinButton.popover({
				html: true,
				content: pinContainer.prop('outerHTML'),
				placement : pinButton.attr("popover-placement"),
				trigger: 'manual',
				container:'#boosterpackPinDiv'
			});	

			pinButton.click(function(){
				var myPinNum = $(this).attr('value');
				$('#pin'+myPinNum).parent().parent().toggle();
			});

			if ((index>=1) && (index<=10)) {
				$('#pin1to10').append(pinButton);
				pinButton.popover('show');
			}

			if ((index>=11) && (index<=20)) {
				$('#pin11to20').prepend(pinButton);
			}

			if ((index>=21) && (index<=30)) {
				$('#pin21to30').append(pinButton);
				pinButton.popover('show');
			}

			if ((index>=31) && (index<=40)) {
				$('#pin31to40').prepend(pinButton);
			}

			if ((index>=41) && (index<=boardPinCount)) {
				extraPinDiv.append(pinButton.removeClass('btn-block'));
			}
		});

		// display popover for right 20pins
		for (var i = 20; i >= 11; i--) {
			$('#pinBtn'+i).popover('show');
		};
		for (var i = 40; i >= 31; i--) {
			$('#pinBtn'+i).popover('show');
		};
		for (var i = boardPinCount; i >= 41; i--) {
			$('#pinBtn'+i).popover('show');
		};

		$('.popover').hide();
		$('.pin-placeholder').hide();

		$.each(board.pins, function(index, pin){
			selectDropdown = $('select[name="select' +index + '"]');
			// populate select box
			if (pin.supportedModes.length==0){
				$('#pinBtn'+index).attr('disabled','disabled');
				$('#pinBtn'+index).attr('style','background:grey'); //default btn color
			}

			$.each(pin.supportedModes, function(modeIndex,modeValue){
				$optionText = $('<option></option>');
				if (modeValue==board.MODES.INPUT){
					$('#pin'+index+' .pin-input').html(pin.value?'HIGH':'LOW');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-input').show();
					}
					$('#pinBtn'+index).addClass('btnInput'); 
					selectDropdown.append( $optionText.html('Input').val(board.MODES.INPUT) );
				}
				if (modeValue==board.MODES.OUTPUT){
					$('#pin'+index+' .pin-output').html('<button class="btn btn-default">LOW</button>');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-output').show();
					}
					$('#pinBtn'+index).addClass('btnOutput');
					selectDropdown.append( $optionText.html('Output').val(board.MODES.OUTPUT) );
				}
				if (modeValue==board.MODES.ANALOG){
					$('#pin'+index+' .pin-analog').html(pin.value);
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-analog').show();
					}
					$('#pinBtn'+index).addClass('btnAnalog');
					selectDropdown.append( $optionText.html('Analog').val(board.MODES.ANALOG) );
				}
				if (modeValue==board.MODES.PWM){
					$('#pin'+index+' .pin-pwm').html('<input name="pwm" type="number" name="points" min="0" max="255">');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-pwm').show();
					}
					$('#pinBtn'+index).addClass('btnPWM');
					selectDropdown.append( $optionText.html('PWM').val(board.MODES.PWM) );
				}
				if (modeValue==board.MODES.SERVO){
					$('#pin'+index+' .pin-servo').html('<input name="servo" type="number" name="points" min="0" max="180">');
					if (modeValue == pin.mode) {
						$optionText.attr('selected',true);
						$('#pin'+index+' .pin-servo').show();
					}
					$('#pinBtn'+index).addClass('btnServo');
					selectDropdown.append( $optionText.html('Servo').val(board.MODES.SERVO) );
				}	
			});

			// after new mode is selected from the dropdown
			selectDropdown.change(function(){
				var selectedMode = $(this).find('option:selected').html();
				var selectedName = $(this).attr('name');
				console.log(selectedName + ': ' + selectedMode + ', index:'+index);
				if (selectedMode == 'Input'){
					$('#pin'+index+' .pin-input').show().siblings("div").hide(); 
					launchpad.setPinMode(index,board.MODES.INPUT);
				} else if (selectedMode == 'Output'){
					$('#pin'+index+' .pin-output button').html('LOW');
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
		
	}

	var initGraph = function(){
		var lineChartData = {
			labels : [''],
			datasets : [
				{
					label: "My First dataset",
					fillColor : "rgba(220,220,220,0.2)",
					strokeColor : "rgba(220,220,220,1)",
					pointColor : "rgba(220,220,220,1)",
					pointStrokeColor : "#fff",
					pointHighlightFill : "#fff",
					pointHighlightStroke : "rgba(220,220,220,1)",
					data : [0] //,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
				},
				{
					label: "My Second dataset",
					fillColor : "rgba(151,187,205,0.2)",
					strokeColor : "rgba(151,187,205,1)",
					pointColor : "rgba(151,187,205,1)",
					pointStrokeColor : "#fff",
					pointHighlightFill : "#fff",
					pointHighlightStroke : "rgba(151,187,205,1)",
					data : [0]
				}
			]

		};

		Chart.defaults.global.scaleFontColor = "#FFF";

			
		// $('#GraphModal').on('shown.bs.modal',function(){
			var width = $('canvas').parent().width();
			$('canvas').attr('width',width)
			// console.log('clicked :' + width); 

			var ctx = $("#myChart").get(0).getContext("2d");
			window.myLine = new Chart(ctx).Line(lineChartData, {
				responsive: true,
				scaleBeginAtZero: true,
				scaleOverride: true,
				scaleSteps: 10,
				scaleStepWidth: 410,
				animationSteps: 5
			});
			
		// });
	}
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