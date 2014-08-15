NodeJS Firmata GUI for Launchpad
==========

**Description**

This is a Node JS application that replicates ["firmata_test.exe"](http://firmata.org/) It allows users control the LaunchPad through a Graphical User Interface (GUI). This enables testing the launchpad's functionality and rapid-prototyping your own application. Here is a [demonstration video](http://youtu.be/t-D9XZS2DeQ).

* Supported LaunchPads
	* MSP-EXP430F5529LP (LaunchPad)
	* MSP-EXP430FR5969 (FraunchPad)
	* EK-TM4C123GXL (Tiva C)
	* EK-LM4F120XL (Tiva C)
	* EK-LM4F1294XL (Connected)

**How to setup Firmata on LaunchPad (Windows)**

* Target Device Side (LaunchPad)
	* Install [Energia](http://energia.nu/download/)
	* Download the [Firmata folder] (https://github.com/energia/Energia/tree/master/libraries/Firmata) 
	* Put the Firmata folder under "<Energia>\libraries\". For example, "C:\Users\<username>\Documents\Energia\libraries\Firmata"
	* Run Energia.exe. Go to File->Examples->Firmata->StandardFirmata.
	* Then, go to Tools->Board->(your device, ex: F5529)
	* Click the Upload button (right arrow) to flash your device
	* Once complete, one of your LEDs will flash for a few times. This confirms that Firmata is running properly on the target device.

* Node JS Side (PC)
	* Install Node JS
	* Download [Firmata GUI](https://github.com/shengzhao91/FirmataGUI)
	* Open Command Prompt. Go to <your_dir>/FirmataGUI.
	* Run "npm install" to install node modules
	* Run "npm start" to start the node server
	* Go to your browser at "http://localhost:3000/"
	* Select the COM port your LaunchPad is on and click "Connect"
	* You should see all the pins populated in your browser and you can control the pins!
	* (If you don't see any COM ports, refresh the page. If still doesn't work, stop the Node JS server, reconnect USB, restart the server again with npm start)
