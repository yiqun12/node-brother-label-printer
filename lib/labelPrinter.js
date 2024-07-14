const util = require('util');
const pngparse = require('pngparse');
var usb = require('usb');
const { convert } = require('./imageProcessing');

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
                interfaceIndex = iface.interfaceNumber;
                break;
            }
            iface.release(true);
            interfaceClaimed = false;
        }

        if (outputEndpoint) {
            outputEndpoint.transfer(data, function (err) {
                if (err) {
                    console.log('Error sending data:', err);
                } else {
                    console.log('Data sent');
                }
            });
        } else {
            console.log('No valid output endpoint found');
            if (interfaceClaimed) {
                printer.interfaces[interfaceIndex].release(true);
            }
        }
    } catch (error) {
        console.error('An error occurred:', error);
        if (interfaceClaimed) {
            printer.interfaces[interfaceIndex].release(true);
        }
    }
}

// Asynchronous function to print a PNG file
async function printPngFile({ vendorId, productId, filename, options, compression }) {
    let parseFile = util.promisify(pngparse.parseFile);
    let img = await parseFile(filename);
    let printData = await convert(img, options, compression);
    return printLabel(printData, vendorId, productId);
}

module.exports = {
    printPngFile
};
