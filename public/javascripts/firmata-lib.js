$(document).ready(function() {
	var socket = io();

	window.LaunchPad = function() {
	    console.log('LaunchPad Object Created');
	}

	LaunchPad.prototype.getPortList = function(callback){
		socket.emit('listPortReq');
		socket.on('listPortRes',callback);
	}

	LaunchPad.prototype.connect = function(port,callback){
		socket.emit('connectPort',port);
		socket.on('boardReady',callback);
	}

	LaunchPad.prototype.setPinMode = function (pin,mode){
		socket.emit('pinMode', {pin: pin, mode: mode});
	}

	LaunchPad.prototype.digitalRead = function(callback){
		socket.on('digitalRead', callback); //passively listen for any digital pin change
	}

	LaunchPad.prototype.digitalWrite = function(pin, value){
		socket.emit('digitalWrite', {pin: pin, value: value});
	}

	LaunchPad.prototype.analogRead = function(callback){
		socket.on('analogRead', callback); //passively listen for any analog pin change
	}

	LaunchPad.prototype.analogWrite = function(pin, value){
		socket.emit('analogWrite',{pin:pin, value:value});
	}

	LaunchPad.prototype.i2cInit = function(address){
		socket.emit('I2CInitRequest', {addr:address});
	}

	LaunchPad.prototype.i2cRead = function(address, byteCount, callback){
		socket.emit('I2CReadRequest', {addr: address, bytecnt:byteCount});
		socket.once('I2CReadRequestRes', callback);
	}

	LaunchPad.prototype.i2cWrite = function(address, data){
		socket.emit('I2CWriteRequest', {addr: address, value:data});
	}

	LaunchPad.prototype.setAnalogUpdateFreq = function(mode){
		socket.emit('analogUpdateFreqReq', mode)
	}
});
