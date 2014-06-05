$(document).ready(function() { 
	console.log('Firmata MSP430F5529');

	var socket = io();
	socket.on('tempRead',function(msg){
		$(".TemperatureReading").html(msg);
	});

	$("#ledButton").click(function(e){
		console.log('LED toggled');
		socket.emit('toggleLED',function(){

			console.log('LED toggled');
		});
	});

});