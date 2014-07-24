$(document).ready(function() {

	window.LaunchPad = function(socket) {
	    console.log('LaunchPad Object Created');
	    this.socket = socket;
	}

	LaunchPad.prototype.getPortList = function(callback){
		this.socket.emit('listPortReq');
		this.socket.on('listPortRes',callback);
	}

	LaunchPad.prototype.connect = function(port,callback){
		this.socket.emit('connectPort',port);
		this.socket.on('boardReady',callback);
	}

	LaunchPad.prototype.disconnect = function(callback){
		this.socket.emit('disconnectPort');
		this.socket.on('portClosed',callback);
	}

	LaunchPad.prototype.setPinMode = function (pin,mode){
		this.socket.emit('pinMode', {pin: pin, mode: mode});
	}

	LaunchPad.prototype.digitalRead = function(callback){
		this.socket.on('digitalRead', callback); //passively listen for any digital pin change
	}

	LaunchPad.prototype.digitalWrite = function(pin, value){
		this.socket.emit('digitalWrite', {pin: pin, value: value});
	}

	LaunchPad.prototype.analogRead = function(callback){
		this.socket.on('analogRead', callback); //passively listen for any analog pin change
	}

	LaunchPad.prototype.analogWrite = function(pin, value){
		if(value>255){value = 255;}
		if(value<0){value = 0;}
		this.socket.emit('analogWrite',{pin:pin, value:value});
	}

	LaunchPad.prototype.i2cInit = function(address){
		this.socket.emit('I2CInitRequest', {addr:address});
	}

	LaunchPad.prototype.i2cRead = function(address, byteCount, callback){
		this.socket.emit('I2CReadRequest', {addr: address, bytecnt:byteCount});
		this.socket.once('I2CReadRequestRes', callback);
	}

	LaunchPad.prototype.i2cWrite = function(address, data){
		this.socket.emit('I2CWriteRequest', {addr: address, value:data});
	}

	LaunchPad.prototype.setAnalogUpdateFreq = function(mode){
		this.socket.emit('analogUpdateFreqReq', mode)
	}
});
