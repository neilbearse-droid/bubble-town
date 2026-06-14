// Rig the flat character base into depth-ordered body parts so garments can be
// interleaved *between* them instead of pasted flat on top. Right now this
// lifts the HANDS into their own full-frame cutout: the compositor paints them
// in front of a jacket's sleeves, so the arms read as going into the sleeves
// and the hands emerging at the cuffs (true wrap-around depth).
//
// Each part keeps the base's frame/position (full-frame, inset 0), so parts
// re-stack pixel-perfect; only their depth slot in CHAR_Z differs. The body
// part stays the untouched base, and the hand part redraws the hands on top.
//
// Usage: node scripts/rig-base-parts.mjs <baseName>   (e.g. base_tan)
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dir, '../src/assets/char');
const name = process.argv[2] || 'base_tan';

const { data, info } = await sharp(`${DIR}/${name}.webp`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: ch } = info;

// Hand regions on the shared base art (far left & far right, lower-arm band).
const HAND_BOXES = [
  { x0: 0.00, x1: 0.18, y0: 0.55, y1: 0.69 },
  { x0: 0.82, x1: 1.00, y0: 0.55, y1: 0.69 },
];
const inHandBox = (x, y) =>
  HAND_BOXES.some((b) => x >= b.x0 * W && x < b.x1 * W && y >= b.y0 * H && y < b.y1 * H);

// Inside the boxes, keep skin + outlines but drop the white onesie sleeve.
const hands = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x;
  const a = data[i * ch + 3];
  if (a <= 40 || !inHandBox(x, y)) continue;
  const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
  const isOnesie = r > 210 && g > 210 && b > 205;
  if (isOnesie) continue;
  hands[i * 4] = r; hands[i * 4 + 1] = g; hands[i * 4 + 2] = b; hands[i * 4 + 3] = a;
}
await sharp(hands, { raw: { width: W, height: H, channels: 4 } })
  .webp({ alphaQuality: 100 }).toFile(`${DIR}/${name}_hands.webp`);
console.log(`${name}: rigged -> ${name}_hands.webp (front-of-sleeve hand part). Body part stays ${name}.webp.`);
