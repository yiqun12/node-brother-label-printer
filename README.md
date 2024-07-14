# node-brother-label-printer

[![NPM](https://nodei.co/npm/node-brother-label-printer.png)](https://nodei.co/npm/node-brother-label-printer/)
[![npm version](https://badge.fury.io/js/node-brother-label-printer.svg)](https://www.npmjs.com/package/node-brother-label-printer)

A node.js library built to print png images with Brother QL-820NWBc Label Printers connected via USB.

# Installation

```bash
$ npm install node-brother-label-printer
```

## How to print a PNG file

First, you will need the **VendorID (VID)** and **ProductID (PID)** of your printer. You can download and use the [Zadig](http://sourceforge.net/projects/libwdi/files/zadig/) tool to identify the PID and VID of your connected usb brother label printer if you don't know it. Next you will need a PNG file to print. Currently PNG is the only file format this library supports.

```javascript
const brother = require("node-brother-label-printer");
const VID = 0x04f9;
const PID = 0x209d;

brother.printPngFile(VID, PID, "./sample-image.png", { landscape: false });
```

## Example

![img_1031](https://cdn.discordapp.com/attachments/759102082849833000/1261584970229485588/Weixin_Image_20240713002806.jpg?ex=66937e10&is=66922c90&hm=aa7086987a6561e1201ebfc070f569e9b0aa35b23d5c7759ebc6378ca81bf6e3&)

---

## Contributors

Thanks to our contributors! 🎉👏

- [Yiqun Xu](https://github.com/yiqun12)
- [Yutao Li](https://github.com/Yutao-Li-306)
