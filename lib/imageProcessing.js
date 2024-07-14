const pngparse = require('pngparse');

// Convert image to black and white pixel matrix
function convertToBlackAndWhiteMatrixImage(image, options) {
    let rows = [];

    for (let y = 0; y < image.height; y++) {
        let cols = [];
        for (let x = 0; x < image.width; x++) {
            let pos = x + image.width * y;
            pos = pos * image.channels;
            let pixel = 0; // white = 0, black = 1
            let threshold = options.blackwhiteThreshold;
            let gray;

            // Determine pixel value based on image channels
            switch (image.channels) {
                case 1: // Grayscale
                    if (image.data[pos] < threshold) pixel = 1;
                    break;
                case 2: // Grayscale + Alpha
                    gray = image.data[pos] * image.data[pos + 1] / 255;
                    if (gray < threshold) pixel = 1;
                    break;
                case 3: // RGB
                    gray = 0.21 * image.data[pos] + 0.72 * image.data[pos + 1] + 0.07 * image.data[pos + 2];
                    if (gray < threshold) pixel = 1;
                    break;
                case 4: // RGBA
                    gray = (0.21 * image.data[pos] + 0.72 * image.data[pos + 1] + 0.07 * image.data[pos + 2]) * image.data[pos + 3] / 255;
                    if (gray < threshold) pixel = 1;
                    break;
            }

            cols.push(pixel); // Add pixel to the column
        }
        rows.push(cols); // Add column to the row
    }

    return {
        height: image.height,
        width: image.width,
        data: rows
    };
}

// Rotate the black and white matrix image
function rotateMatrixImage(bwMatrixImage) {
    let rows = [];
    for (let x = 0; x < bwMatrixImage.width; x++) {
        let cols = [];
        for (let y = bwMatrixImage.height - 1; y >= 0; y--) {
            cols.push(bwMatrixImage.data[y][x]);
        }
        rows.push(cols);
    }

    return {
        height: bwMatrixImage.width,
        width: bwMatrixImage.height,
        data: rows
    };
}

// Compress buffer
function compressBuffer(buffer) {
    let buffers = [];
    let i = 0;

    while (i < buffer.length) {
        let start = i;
        while (i + 1 < buffer.length && buffer[i] === buffer[i + 1]) {
            i++;
        }

        let count = i - start + 1;
        if (count > 1) {
            buffers.push(Buffer.from([count & 0xFF, buffer[start]])); // Add compressed sequence
        } else {
            let unrepeatedBytes = [];
            while (i < buffer.length && (i + 1 >= buffer.length || buffer[i] !== buffer[i + 1])) {
                unrepeatedBytes.push(buffer[i]);
                i++;
            }
            if (i < buffer.length && buffer[i] === buffer[i + 1]) {
                i--;
            }
            if (unrepeatedBytes.length > 0) {
                buffers.push(Buffer.from([unrepeatedBytes.length - 1, ...unrepeatedBytes])); // Add uncompressed sequence
            }
        }
        i++;
    }

    return Buffer.concat(buffers); // Concatenate all parts of the buffer and return
}

// Convert image to dot label
function convertImageToDotlabel(bwMatrixImage, compression) {
    let data = [
        Buffer.alloc(400), // Invalidate
        Buffer.from([0x1b, 0x40]), // Initialize
        Buffer.from([0x1b, 0x69, 0x61, 0x01]), // Switch to raster mode
        Buffer.from([0x1b, 0x69, 0x21, 0x00]), // Status notification
        Buffer.from([0x1b, 0x69, 0x7a, 0x86, 0x0a, 0x3e, 0x00, 0xe0, 0x03, 0x00, 0x00, 0x00, 0x00]), // 62mm continuous
        Buffer.from([0x1b, 0x69, 0x4d, 0x40]), // Select auto cut
        Buffer.from([0x1b, 0x69, 0x41, 0x01]), // Auto cut for each sheet
        Buffer.from([0x1b, 0x69, 0x4b, 0x08]), // Select cut at end
        Buffer.from([0x1b, 0x69, 0x64, 0x23, 0x00]), // 35 dots margin
        compression.enable ? Buffer.from([0x4d, 0x02]) : Buffer.from([0x4d, 0x00]) // Enable or disable compression
    ];

    for (let y = 0; y < bwMatrixImage.height; y++) {
        let rowBuffer = compression.enable ? Buffer.alloc(90) : Buffer.alloc(93);
        if (!compression.enable) {
            rowBuffer[0] = 0x67;
            rowBuffer[2] = 0x5A;
        }

        for (let x = 0; x < bwMatrixImage.width; x++) {
            if (bwMatrixImage.data[y][x] == 1) {
                let byteNum = 93 - Math.floor(x / 8 + 3);
                let bitOffset = x % 8;
                rowBuffer[byteNum] |= (1 << bitOffset); // Set the bit in the buffer
            }
        }

        if (compression.enable) {
            let compressedRow = compressBuffer(rowBuffer);
            let commandBuffer = Buffer.from([0x67, 0x00, compressedRow.length]);
            let finalBuffer = Buffer.concat([commandBuffer, compressedRow]);
            if (finalBuffer.equals(Buffer.from([0x67, 0x00, 0x02, 0xa7, 0x00]))) {
                finalBuffer = Buffer.from([0x5A]);
            }
            data.push(finalBuffer); // Push the final buffer to the data array
        } else {
            data.push(rowBuffer); // Push the row buffer to the data array when compression is disabled
        }
    }

    data.push(Buffer.from([0x1A])); // End label with <ESC> Z

    return Buffer.concat(data); // Concatenate all buffers
}

// Convert PNG to printable data
async function convert(img, options, compression) {
    let defaultOptions = {
        landscape: false,
        blackwhiteThreshold: 128
    };
    options = { ...defaultOptions, ...options };

    // Validate image dimensions
    if ((!options.landscape && img.width > 720) || (options.landscape && img.height > 720)) {
        throw new Error('Width or height cannot be more than 720 pixels');
    }

    // Convert to black and white pixel matrix image
    let bwMatrixImage = convertToBlackAndWhiteMatrixImage(img, options);

    // Rotate image if landscape mode is requested
    if (options.landscape) {
        bwMatrixImage = rotateMatrixImage(bwMatrixImage);
    }

    // Convert to dot-label format
    return convertImageToDotlabel(bwMatrixImage, compression);
}

module.exports = {
    convert
};