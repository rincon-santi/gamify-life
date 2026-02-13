const fs = require('fs');
const pngToIcoModule = require('png-to-ico');
const { Jimp } = require('jimp');

const pngToIco = pngToIcoModule.default || pngToIcoModule;

async function convert() {
    try {
        console.log('Processing image with Jimp...');
        const image = await Jimp.read('build/icon.png');
        await image.resize({ w: 256, h: 256 });
        const tempBuffer = await image.getBuffer("image/png");

        console.log('Converting to ICO...');
        const icoBuffer = await pngToIco(tempBuffer);
        fs.writeFileSync('build/icon.ico', icoBuffer);
        console.log('Successfully created build/icon.ico');
    } catch (err) {
        console.error('Error converting icon:', err);
        process.exit(1);
    }
}

convert();
