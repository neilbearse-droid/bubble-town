// Regenerates the PWA/app icons from public/favicon.svg.
// One-off tool — install sharp first:  npm i -D sharp && node scripts/gen-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pub = resolve(dirname(fileURLToPath(import.meta.url)), '../public');
const svg = readFileSync(resolve(pub, 'favicon.svg'));

for (const [name, size] of [['pwa-192.png', 192], ['pwa-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(resolve(pub, name));
  console.log('wrote', name);
}

// Maskable: keep the art inside the safe zone on a full-bleed background.
const inner = await sharp(svg, { density: 300 }).resize(410, 410).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#9FD8FF' } })
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(resolve(pub, 'maskable-512.png'));
console.log('wrote maskable-512.png');
