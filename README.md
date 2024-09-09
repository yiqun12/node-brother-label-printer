# node-brother-label-printer

[![NPM](https://nodei.co/npm/node-brother-label-printer.png)](https://nodei.co/npm/node-brother-label-printer/)
[![npm version](https://badge.fury.io/js/node-brother-label-printer.svg)](https://www.npmjs.com/package/node-brother-label-printer)

If you encounter any problems with this library, please submit an issue and also email me directly at admin@eatifydash.com.

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

![img_1031](https://cdn.discordapp.com/attachments/759102082849833000/1261584970229485588/Weixin_Image_20240713002806.jpg?ex=66937e10&is=66922c90&hm=aa7086987a6561e1201ebfc070f569e9b0aa35b23d5c7759ebc6378ca81bf6e3&)

[Youtube Demo Video](https://youtu.be/1JQClq5ZUD4)

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
