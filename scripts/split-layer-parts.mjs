// Split a single trimmed wearable .webp into BACK and FRONT pieces so the
// character body can be painted *between* them (e.g. hair: length behind the
// head, bangs in front of the forehead). A flat overlay can't do that.
//
// Usage: node scripts/split-layer-parts.mjs <name> <frontFraction>
//   <name>          base filename in src/assets/char (without .webp)
//   <frontFraction> top fraction of the image kept as the FRONT piece (0..1)
//
// Emits <name>_back.webp (full silhouette) and <name>_front.webp (top crop),
// and prints the normalised geometry to paste into charLayers.js.
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dir, '../src/assets/char');
const [name, fracArg] = process.argv.slice(2);
const frac = Number(fracArg);
if (!name || !(frac > 0 && frac < 1)) {
  console.error('usage: split-layer-parts.mjs <name> <frontFraction 0..1>');
  process.exit(1);
}
const src = `${DIR}/${name}.webp`;
const m = await sharp(src).metadata();
const cut = Math.round(m.height * frac);
await sharp(src).toFile(`${DIR}/${name}_back.webp`);
await sharp(src).extract({ left: 0, top: 0, width: m.width, height: cut }).toFile(`${DIR}/${name}_front.webp`);
console.log(`${name}: ${m.width}x${m.height} -> back(full) + front(top ${cut}px = ${(frac*100)|0}%)`);
console.log(`front piece is the top ${frac} of the image; anchor it with the same top edge as back.`);
