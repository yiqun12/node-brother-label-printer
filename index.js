const { printPngFile } = require('./lib/labelPrinter');

printPngFile({
    vendorId: 0x04f9,
    productId: 0x209D,
    filename: './sample.png',
    options: { landscape: false },
    compression: { enable: true }
});
