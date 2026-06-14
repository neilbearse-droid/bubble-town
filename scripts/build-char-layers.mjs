// Slice a combined character sprite sheet (transparent bg, several isolated
// pieces) into individual trimmed .webp layers for the paper-doll compositor.
//
// Usage:
//   node scripts/build-char-layers.mjs <input.png> <name1> <name2> ...
//
// Pieces are detected via connected-component labelling on the alpha channel
// and assigned to the given names in left-to-right order. Output -> src/assets/char/.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../src/assets/char');

const [input, ...names] = process.argv.slice(2);
if (!input || !names.length) {
  console.error('usage: build-char-layers.mjs <input> <name1> [name2 ...]');
  process.exit(1);
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, ch = info.channels;
const mask = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) mask[i] = data[i * ch + 3] > 40 ? 1 : 0;

// 8-connected components
const label = new Int32Array(W * H);
let cur = 0; const boxes = []; const stack = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const idx = y * W + x;
  if (!mask[idx] || label[idx]) continue;
  cur++; let minx = x, maxx = x, miny = y, maxy = y, area = 0;
  stack.push(idx); label[idx] = cur;
  while (stack.length) {
    const p = stack.pop(); const px = p % W, py = (p / W) | 0; area++;
    if (px < minx) minx = px; if (px > maxx) maxx = px;
    if (py < miny) miny = py; if (py > maxy) maxy = py;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const np = ny * W + nx;
      if (mask[np] && !label[np]) { label[np] = cur; stack.push(np); }
    }
  }
  boxes.push({ id: cur, minx, miny, maxx, maxy, area });
}

const big = boxes.filter((b) => b.area > 3000).sort((a, b) => a.minx - b.minx);
if (big.length !== names.length) {
  console.warn(`! found ${big.length} pieces but got ${names.length} names`);
}

mkdirSync(OUT, { recursive: true });
for (let i = 0; i < big.length && i < names.length; i++) {
  const b = big[i];
  const bw = b.maxx - b.minx + 1, bh = b.maxy - b.miny + 1;
  const out = Buffer.alloc(bw * bh * 4);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const sp = (b.miny + y) * W + (b.minx + x), dp = (y * bw + x) * 4;
    if (label[sp] === b.id) {
      const si = sp * ch;
      out[dp] = data[si]; out[dp + 1] = data[si + 1]; out[dp + 2] = data[si + 2]; out[dp + 3] = data[si + 3];
    }
  }
  const file = `${OUT}/${names[i]}.webp`;
  await sharp(out, { raw: { width: bw, height: bh, channels: 4 } })
    .webp({ quality: 92, alphaQuality: 100 }).toFile(file);
  console.log(`${names[i]}: ${bw}x${bh} (aspect ${(bh / bw).toFixed(3)}) -> ${file}`);
}
