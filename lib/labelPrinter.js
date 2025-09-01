const util = require('util'); // Utility module for promisifying functions
const pngparse = require('pngparse'); // Module for parsing PNG files
var usb = require('usb'); // Module for interacting with USB devices
const { convert } = require('./imageProcessing'); // Custom module for image processing
const fs = require('fs');

// Function to print a label
function printLabel(data, vendorId, productId) {

    var printer = usb.findByIds(vendorId, productId);

    if (!printer) {
        console.log('Printer not found');
        return;
    }

    printer.open();

    var outputEndpoint = null;
    var interfaceIndex = 0;
    var interfaceClaimed = false;

    try {
        for (var iface of printer.interfaces) {
            iface.claim();
            interfaceClaimed = true;
            for (var endpoint of iface.endpoints) {
                if (endpoint.direction === 'out') {
                    outputEndpoint = endpoint;
                    break;
                }
            }
            if (outputEndpoint) {
                interfaceIndex = iface.interfaceNumber; // store the index for release
                break; // Break out if endpoint found
            }
            iface.release(true); // Release if no endpoint found in this interface
            interfaceClaimed = false;
        }

        if (outputEndpoint) {
            outputEndpoint.transfer(data, function (err) {
                if (err) {
                    console.log('Error sending data:', err);
                } else {
                    console.log('Data sent');
                }
                // Printer connection remains open for further operations
            });
        } else {
            console.log('No valid output endpoint found');
            if (interfaceClaimed) {
                printer.interfaces[interfaceIndex].release(true); // Release interface, but keep printer open
            }
        }
    } catch (error) {
        console.error('An error occurred:', error);
        if (interfaceClaimed) {
            printer.interfaces[interfaceIndex].release(true); // Release interface, but keep printer open
        }
    }
}

// Asynchronous function to print a PNG file
async function printPngFile({ vendorId, productId, filename, options, compression }) {

        let parseFile = util.promisify(pngparse.parseFile); // Promisify the pngparse.parseFile method
        let img = await parseFile(filename); // Parse the PNG file to get the image data
        let printData = await convert(img, options, compression); // Convert the image data
        return printLabel(printData, vendorId, productId); // Print the label using the converted data

}

module.exports = {
    printPngFile
};
