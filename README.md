NodeJS Firmata GUI for Launchpad
==========

**Description**

This is a Node JS application that replicates ["firmata_test.exe"](http://firmata.org/) It allows users control the LaunchPad through a Graphical User Interface (GUI). This enables testing the launchpad's functionality and rapid-prototyping your own application.

* Supported LaunchPads
	* MSP-EXP430F5529LP (LaunchPad) -- Recommend to use this board first
	* MSP-EXP430FR5969 (FraunchPad)
	* EK-TM4C123GXL (Tiva C)
	* EK-LM4F120XL (Tiva C)
	* EK-LM4F1294XL (Connected)

**How to setup Firmata on LaunchPad (Windows)**

* Target Device Side (LaunchPad)
	* Install [Energia](http://energia.nu/download/)
	* Download the [Firmata folder] (https://github.com/shengzhao91/Energia/tree/master/libraries/Firmata) from my GitHub fork of Firmata. 
	* Put the Firmata folder under "energia-0101E0012\hardware\msp430\libraries"
	* Run Energia.exe. Go to File->Examples->Firmata->StandardFirmata.
	* Then, go to Tools->Board->(your device, ex: F5529)
	* Click the right arrow to upload to your device
	* After uploading is done, one of your LEDs to flash for a few times. This confirms that Firmata is running properly on the target device.

* Node JS Side (PC)
	* Install Node JS
	* Download [Firmata GUI](https://github.com/shengzhao91/FirmataGUI)
	* Go to <your_dir>/FirmataGUI.
	* Run "npm install" and "npm install serialport"
	* Type "npm start"
	* Go to your browser at "http://localhost:3000/"
	* Select your UART port LaunchPad is on and click "Connect"
	* You should see all the ports populated in your browser and you can control the pins!
	* (If you don't see any ports, refresh the page. If still doesn't work, stop the Node JS server, reconnect USB, restart the server again with npm start)
