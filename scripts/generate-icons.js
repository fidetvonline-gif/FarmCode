import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const svgBuffer = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function generate() {
  // 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 180x180 Apple Touch Icon PNG
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 512x512 Maskable Icon with 12% safe padding
  await sharp(svgBuffer)
    .resize(400, 400)
    .extend({
      top: 56,
      bottom: 56,
      left: 56,
      right: 56,
      background: { r: 6, g: 78, b: 59, alpha: 1 } // #064e3b
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 64x64 favicon.ico (as PNG favicon)
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');
}

generate().catch(console.error);
