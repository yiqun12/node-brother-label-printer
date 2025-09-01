# node-brother-label-printer

[![NPM](https://nodei.co/npm/node-brother-label-printer.png)](https://nodei.co/npm/node-brother-label-printer/)
[![npm version](https://badge.fury.io/js/node-brother-label-printer.svg)](https://www.npmjs.com/package/node-brother-label-printer)


If you enjoy my work and would like to support me, you can buy me a coffee via Zelle using the email admin@eatifydash.com (Name: Yiqun Xu), or visit my Buy Me a Coffee page.(https://buymeacoffee.com/yeequn12)
Should you encounter any issues with this library, please feel free to submit an issue on the repository and also email me directly at admin@eatifydash.com.

⚠️ Note: Our team’s current priority is on other projects.  
If you need an urgent solution, you can **buy us a $100 coffee** ☕,  
and we’ll fast-track your request to deliver a fix or workaround within 1–2 days.


A node.js library built to print png images with Brother Label Printers (QL-710W, QL-720NW, QL-810W, QL-820NWB, QL-1110NWB, QL-1115NWB) connected via USB.

# Installation

```npm
$ npm install node-brother-label-printer
```

If you use usb as an adapter :

- On Linux, you'll need `libudev` to build libusb.
- On Ubuntu/Debian: `sudo apt-get install build-essential libudev-dev`.
- On Windows, Use [Zadig](http://sourceforge.net/projects/libwdi/files/zadig/) to install the WinUSB driver for your USB device.

Otherwise you will get `LIBUSB_ERROR_NOT_SUPPORTED` when attempting to open devices.

## How to print a PNG file

First, you will need the **VendorID (VID)** and **ProductID (PID)** of your printer. You can download and use the [Zadig](http://sourceforge.net/projects/libwdi/files/zadig/) tool to identify the PID and VID of your connected usb brother label printer if you don't know it. Next you will need a PNG file to print. Currently PNG is the only file format this library supports.

You can download a sample PNG file [here](https://github.com/yiqun12/node-brother-label-printer/blob/main/sample.png).

`Note: pngs should have a width of 720 pixels for optimal results`

```javascript
const { printPngFile } = require("node-brother-label-printer");

printPngFile({
  vendorId: 0x04f9,
  productId: 0x209d,
  filename: "./sample.png",
  options: { landscape: false, labelWidth: "62-mm-wide continuous" }, //"102-mm-wide continuous"
  compression: { enable: true },
});
```

## Example
<!-- Images placed side by side -->
<p>
  <img src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/3704e62e-efab-44df-a7fb-7be9627ae000/public" alt="Image 1" width="300" height="500" style="float: left; margin-right: 10%;"/>
  <img src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/e1b38183-61a8-4026-7893-d11ae8280e00/public" alt="Image 2" width="300" height="500" style="float: left;"/>
</p>

[Youtube Demo Video](https://youtu.be/1JQClq5ZUD4)

[![Watch the video](https://img.youtube.com/vi/1JQClq5ZUD4/0.jpg)](https://www.youtube.com/watch?v=1JQClq5ZUD4)  



---

## Contributing

- Fork this repo
- Clone your repo
- Install dependencies
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Open a pull request, and enjoy <3

## Contributors

Thanks to our contributors! 🎉👏

- [Yiqun Xu](https://github.com/yiqun12)
- [Yutao Li](https://github.com/Yutao-Li-306)
