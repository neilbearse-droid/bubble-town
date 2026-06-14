// Split an open jacket/coat illustration into BACK (the inner lining/cavity that
// sits behind the body) and FRONT (the puffy panels, sleeves and outer collar
// that wrap in front of it). The body is painted between the two, so the torso
// shows through the open front instead of the jacket's interior covering it.
//
// The cavity is found by flood-filling inward from the vertical centre through
// the darker lining/zipper pixels; the bright puffy panels act as walls, so the
// fill can't leak out onto them. Keeps the same frame as the source, so both
// pieces reuse the source's geometry (w/cx/cy) in charLayers.js.
//
// Usage: node scripts/split-open-jacket.mjs <name>
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dir, '../src/assets/char');
const name = process.argv[2];
if (!name) { console.error('usage: split-open-jacket.mjs <name>'); process.exit(1); }

const src = `${DIR}/${name}.webp`;
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: ch } = info;
const lum = (i) => 0.299 * data[i * ch] + 0.587 * data[i * ch + 1] + 0.114 * data[i * ch + 2];
const alpha = (i) => data[i * ch + 3];

// Seed the fill down the vertical centre, then spread through non-bright pixels.
const inside = new Uint8Array(W * H); const stack = [];
for (let y = Math.round(H * 0.18); y < Math.round(H * 0.95); y++) {
  const i = y * W + Math.round(W * 0.5);
  if (alpha(i) > 40 && lum(i) < 160) { inside[i] = 1; stack.push(i); }
}
while (stack.length) {
  const p = stack.pop(); const px = p % W, py = (p / W) | 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = px + dx, ny = py + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const np = ny * W + nx;
    if (!inside[np] && alpha(np) > 40 && lum(np) < 175) { inside[np] = 1; stack.push(np); }
  }
}
// Dilate a touch so the front opening edge reads clean.
const cavity = new Uint8Array(inside);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!inside[y * W + x]) continue;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < W && ny < H) cavity[ny * W + nx] = 1;
  }
}
const back = Buffer.alloc(W * H * 4), front = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  if (alpha(i) <= 40) continue;
  const dst = cavity[i] ? back : front;
  dst[i * 4] = data[i * ch]; dst[i * 4 + 1] = data[i * ch + 1];
  dst[i * 4 + 2] = data[i * ch + 2]; dst[i * 4 + 3] = data[i * ch + 3];
}
await sharp(back, { raw: { width: W, height: H, channels: 4 } }).webp({ alphaQuality: 100 }).toFile(`${DIR}/${name}_back.webp`);
await sharp(front, { raw: { width: W, height: H, channels: 4 } }).webp({ alphaQuality: 100 }).toFile(`${DIR}/${name}_front.webp`);
console.log(`${name}: ${W}x${H} -> ${name}_back.webp (lining) + ${name}_front.webp (panels). Reuse the source w/cx/cy for both.`);
