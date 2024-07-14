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

            switch (image.channels) {
                case 1:
                    if (image.data[pos] < threshold) pixel = 1;
                    break;
                case 2:
                    gray = image.data[pos] * image.data[pos + 1] / 255;
                    if (gray < threshold) pixel = 1;
                    break;
                case 3:
                    gray = 0.21 * image.data[pos] + 0.72 * image.data[pos + 1] + 0.07 * image.data[pos + 2];
                    if (gray < threshold) pixel = 1;
                    break;
                case 4:
                    gray = (0.21 * image.data[pos] + 0.72 * image.data[pos + 1] + 0.07 * image.data[pos + 2]) * image.data[pos + 3] / 255;
                    if (gray < threshold) pixel = 1;
                    break;
            }

            cols.push(pixel);
        }
        rows.push(cols);
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
            buffers.push(Buffer.from([count & 0xFF, buffer[start]]));
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
                buffers.push(Buffer.from([unrepeatedBytes.length - 1, ...unrepeatedBytes]));
            }
        }
        i++;
    }

    return Buffer.concat(buffers);
}

// Convert image to dot label
function convertImageToDotlabel(bwMatrixImage, compression) {
    let data = [
        Buffer.alloc(400),
        Buffer.from([0x1b, 0x40]),
        Buffer.from([0x1b, 0x69, 0x61, 0x01]),
        Buffer.from([0x1b, 0x69, 0x21, 0x00]),
        Buffer.from([0x1b, 0x69, 0x7a, 0x86, 0x0a, 0x3e, 0x00, 0xe0, 0x03, 0x00, 0x00, 0x00, 0x00]),
        Buffer.from([0x1b, 0x69, 0x4d, 0x40]),
        Buffer.from([0x1b, 0x69, 0x41, 0x01]),
        Buffer.from([0x1b, 0x69, 0x4b, 0x08]),
        Buffer.from([0x1b, 0x69, 0x64, 0x23, 0x00]),
        compression.enable ? Buffer.from([0x4d, 0x02]) : Buffer.from([0x4d, 0x00])
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
                rowBuffer[byteNum] |= (1 << bitOffset);
            }
        }

        if (compression.enable) {
            let compressedRow = compressBuffer(rowBuffer);
            let commandBuffer = Buffer.from([0x67, 0x00, compressedRow.length]);
            let finalBuffer = Buffer.concat([commandBuffer, compressedRow]);
            if (finalBuffer.equals(Buffer.from([0x67, 0x00, 0x02, 0xa7, 0x00]))) {
                finalBuffer = Buffer.from([0x5A]);
            }
            data.push(finalBuffer);
        } else {
            data.push(rowBuffer);
        }
    }

    data.push(Buffer.from([0x1A]));

    return Buffer.concat(data);
}

// Convert PNG to printable data
async function convert(img, options, compression) {
    let defaultOptions = {
        landscape: false,
        blackwhiteThreshold: 128
    };
    options = { ...defaultOptions, ...options };

    if ((!options.landscape && img.width > 720) || (options.landscape && img.height > 720)) {
        throw new Error('Width or height cannot be more than 720 pixels');
    }

    let bwMatrixImage = convertToBlackAndWhiteMatrixImage(img, options);

    if (options.landscape) {
        bwMatrixImage = rotateMatrixImage(bwMatrixImage);
    }

    return convertImageToDotlabel(bwMatrixImage, compression);
}

module.exports = {
    convert
};
