const util = require('util');
const pngparse = require('pngparse');
var usb = require('usb');
const { convert } = require('./imageProcessing');

// Function to print a label
function printLabel(data, vendorId, productId) {
    var printer = usb.findByIds(vendorId, productId); // Find the printer by vendor and product ID

    if (!printer) {
        console.log('Printer not found'); // If the printer is not found, log an error and return
        return;
    }

    printer.open(); // Open a connection to the printer

    var outputEndpoint = null;
    var interfaceIndex = 0;
    var interfaceClaimed = false;

    try {
        // Loop through the printer interfaces
        for (var iface of printer.interfaces) {
            iface.claim(); // Claim the interface
            interfaceClaimed = true;
            // Loop through the endpoints of the interface
            for (var endpoint of iface.endpoints) {
                if (endpoint.direction === 'out') {
                    outputEndpoint = endpoint; // Find the output endpoint
                    break;
                }
            }
            if (outputEndpoint) {
                interfaceIndex = iface.interfaceNumber; // Store the index for release
                break; // Break out if endpoint found
            }
            iface.release(true); // Release if no endpoint found in this interface
            interfaceClaimed = false;
        }

        if (outputEndpoint) {
            // Transfer data to the output endpoint
            outputEndpoint.transfer(data, function (err) {
                if (err) {
                    console.log('Error sending data:', err); // Log any errors during transfer
                } else {
                    console.log('Data sent'); // Log successful data transfer
                }
            });
        } else {
            console.log('No valid output endpoint found'); // Log if no valid output endpoint found
            if (interfaceClaimed) {
                printer.interfaces[interfaceIndex].release(true); // Release interface, but keep printer open
            }
        }
    } catch (error) {
        console.error('An error occurred:', error); // Catch and log any errors
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