/**
 * Gera assets placeholder (icon, adaptive-icon, splash, favicon)
 * como PNGs validos com as cores do Rachae.
 *
 * Uso: node scripts/generate-assets.js
 *
 * Para producao, substitua por assets desenhados profissionalmente.
 */

const fs = require('fs');
const path = require('path');

function createPngBuffer(width, height, r, g, b) {
  // minimal valid PNG: 1-color image
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk - raw image data
  const rowSize = 1 + width * 3; // filter byte + RGB per pixel
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Brand green: #00A676 → RGB(0, 166, 118)
const icon = createPngBuffer(1024, 1024, 0, 166, 118);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
console.log('✓ icon.png (1024x1024)');

const adaptiveIcon = createPngBuffer(1024, 1024, 0, 166, 118);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveIcon);
console.log('✓ adaptive-icon.png (1024x1024)');

// Background: #F6F8F7 → RGB(246, 248, 247)
const splash = createPngBuffer(1284, 2778, 246, 248, 247);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splash);
console.log('✓ splash.png (1284x2778)');

const favicon = createPngBuffer(48, 48, 0, 166, 118);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favicon);
console.log('✓ favicon.png (48x48)');

console.log('\nAssets placeholder gerados em assets/');
console.log('Para producao, substitua com designs profissionais.');
