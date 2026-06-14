#!/usr/bin/env node
// Add one wardrobe garment from a magenta/green-screen render.
//
//   node scripts/add-garment.mjs <image> <hair|top|bottom|shoes> <key> [flags]
//
// Flags:
//   --region y0:y1   override the keep-band (fractions of image height)
//   --wide           bottom drapes OVER shoes (adds key to CHAR_BOTTOM_WIDE)
//   --oversized      top hangs OVER pants (adds key to CHAR_TOP_OVERSIZED)
//   --fit            grow the piece to the base leg/arm silhouette (for tight
//                    pants that key out narrower than the body)
//   --preview p.png  also write a composite preview onto the base
//
// It keys the magenta (or green) screen, respects any baked-in transparency,
// drops specks, fills enclosed holes, seals hair gaps, de-spills edges, crops to
// the shared 875x1241 frame, writes src/assets/char/<prefix><key>.webp, and
// registers <key> in src/data/charKeys.js. See src/assets/char/SPEC.md.
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHARDIR = resolve(ROOT, 'src/assets/char');
const KEYS_FILE = resolve(ROOT, 'src/data/charKeys.js');

// shared frame: garments are cropped from the 1024x1536 render to this window
const FRAME = { minX: 64, minY: 138, w: 875, h: 1241 };

const CAT = {
  hair: { prefix: 'hair_', region: [0.0, 0.46], list: 'CHAR_HAIR_KEYS', seal: true, minBlob: 0.0012 },
  top: { prefix: 'top_', region: [0.27, 0.72], list: 'CHAR_TOP_KEYS', minBlob: 0.0018 },
  bottom: { prefix: 'bottom_', region: [0.49, 0.93], list: 'CHAR_BOTTOM_KEYS', minBlob: 0.0018 },
  shoes: { prefix: 'shoes_', region: [0.72, 1.0], list: 'CHAR_SHOE_KEYS', minBlob: 0.0015 },
};

// ---- args -----------------------------------------------------------------
const [img, category, key, ...rest] = process.argv.slice(2);
if (!img || !CAT[category] || !key) {
  console.error('usage: node scripts/add-garment.mjs <image> <hair|top|bottom|shoes> <key> [--wide --oversized --fit --region y0:y1 --preview p.png]');
  process.exit(1);
}
const flags = new Set(rest.filter((a) => a.startsWith('--')));
const opt = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : null; };
const cfg = CAT[category];
const region = (opt('--region') ? opt('--region').split(':').map(Number) : cfg.region);

// ---- key + clean ----------------------------------------------------------
// A pixel is screen (drop it) if it's already transparent, OR magenta
// (R>110,B>90,G<min(R,B)*.72), OR green (#00FF00-ish: G dominant). Everything
// else is the garment.
const isScreen = (r, g, b, a) =>
  a < 40 ||
  (r > 110 && b > 90 && g < Math.min(r, b) * 0.72) || // magenta
  (g > 110 && g - r > 40 && g - b > 40); // green

const { data, info } = await sharp(img).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
const out = Buffer.alloc(N * 4);
const al = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
  if (isScreen(r, g, b, a)) { al[i] = 0; } else { out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; al[i] = 1; }
}
// keep-band
const y0 = Math.round(region[0] * H), y1 = Math.round(region[1] * H);
for (let y = 0; y < H; y++) if (y < y0 || y >= y1) for (let x = 0; x < W; x++) al[y * W + x] = 0;

// drop specks: connected components, keep blobs >= minBlob of the frame
const keep = new Uint8Array(N);
{
  const seen = new Uint8Array(N); const st = []; const minA = N * cfg.minBlob;
  for (let s = 0; s < N; s++) {
    if (!al[s] || seen[s]) continue;
    seen[s] = 1; st.length = 0; st.push(s); const comp = [s];
    while (st.length) { const p = st.pop(); const x = p % W; for (const q of [p - 1, p + 1, p - W, p + W]) { if (q < 0 || q >= N) continue; if (Math.abs((q % W) - x) > 1) continue; if (al[q] && !seen[q]) { seen[q] = 1; st.push(q); comp.push(q); } } }
    if (comp.length >= minA) for (const q of comp) keep[q] = 1;
  }
}
for (let i = 0; i < N; i++) al[i] = keep[i];

// fill enclosed holes (so colorful graphics don't get punched through)
{
  const outside = new Uint8Array(N); const q = [];
  const seed = (i) => { if (!al[i] && !outside[i]) { outside[i] = 1; q.push(i); } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (q.length) { const p = q.pop(); const x = p % W; for (const nb of [p - 1, p + 1, p - W, p + W]) { if (nb < 0 || nb >= N) continue; if (Math.abs((nb % W) - x) > 1) continue; if (!al[nb] && !outside[nb]) { outside[nb] = 1; q.push(nb); } } }
  let holes = []; for (let i = 0; i < N; i++) if (!al[i] && !outside[i]) holes.push(i);
  let guard = 0;
  while (holes.length && guard++ < 90) {
    const next = [];
    for (const i of holes) { let rr = 0, gg = 0, bb = 0, c = 0; for (const nb of [i - 1, i + 1, i - W, i + W, i - W - 1, i - W + 1, i + W - 1, i + W + 1]) { if (nb < 0 || nb >= N) continue; if (al[nb]) { rr += out[nb * 4]; gg += out[nb * 4 + 1]; bb += out[nb * 4 + 2]; c++; } } if (c >= 2) { out[i * 4] = rr / c; out[i * 4 + 1] = gg / c; out[i * 4 + 2] = bb / c; al[i] = 1; } else next.push(i); }
    if (next.length === holes.length) break; holes = next;
  }
}

// seal hair gaps (background poking through spiky tufts)
if (cfg.seal) {
  const a2 = new Uint8Array(al); const r = 7;
  for (let y = 0; y < y1; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (a2[i]) continue;
    let op = 0, tot = 0, rr = 0, gg = 0, bb = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; if (dx * dx + dy * dy > r * r) continue; const j = ny * W + nx; tot++; if (a2[j]) { op++; rr += out[j * 4]; gg += out[j * 4 + 1]; bb += out[j * 4 + 2]; } }
    if (op / tot >= 0.55) { out[i * 4] = rr / op; out[i * 4 + 1] = gg / op; out[i * 4 + 2] = bb / op; al[i] = 1; }
  }
}

// edge de-spill (kill the screen-color fringe on the outline)
for (let i = 0; i < N; i++) {
  if (!al[i]) continue; const x = i % W; let edge = false;
  for (const nb of [i - 1, i + 1, i - W, i + W]) { if (nb < 0 || nb >= N) { edge = true; break; } if (Math.abs((nb % W) - x) > 1) continue; if (!al[nb]) { edge = true; break; } }
  if (edge) { const r = out[i * 4], b = out[i * 4 + 2], g = out[i * 4 + 1]; const m = Math.min(r, b); if (m > g) { out[i * 4] = r - (m - g); out[i * 4 + 2] = b - (m - g); } }
}

// --fit: grow to the base silhouette (tight pants that key out too narrow)
if (flags.has('--fit')) {
  const body = await sharp(resolve(CHARDIR, 'base_tan.webp')).ensureAlpha().raw().toBuffer();
  const feet = await sharp(resolve(CHARDIR, 'base_tan_feet.webp')).ensureAlpha().raw().toBuffer();
  // the base assets are already the cropped 875x1241 frame; the render is 1024x1536.
  // sample the clip mask at the corresponding render pixel.
  const bw = FRAME.w, bh = FRAME.h;
  const clipAt = (x, y) => { const bx = x - FRAME.minX, by = y - FRAME.minY; if (bx < 0 || by < 0 || bx >= bw || by >= bh) return false; const j = (by * bw + bx) * 4; return body[j + 3] > 40 || feet[j + 3] > 40; };
  const a3 = new Uint8Array(al); const R = 34;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (a3[i] || !clipAt(x, y)) continue;
    let best = 1e9, bi = -1;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (a3[j]) { const d = dx * dx + dy * dy; if (d < best) { best = d; bi = j; } } }
    if (bi >= 0) { out[i * 4] = out[bi * 4]; out[i * 4 + 1] = out[bi * 4 + 1]; out[i * 4 + 2] = out[bi * 4 + 2]; al[i] = 1; }
  }
}

for (let i = 0; i < N; i++) out[i * 4 + 3] = al[i] ? 255 : 0;

// crop to the shared frame + write
const outFile = resolve(CHARDIR, cfg.prefix + key + '.webp');
const png = await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
await sharp(png).extract({ left: FRAME.minX, top: FRAME.minY, width: FRAME.w, height: FRAME.h }).webp({ alphaQuality: 100 }).toFile(outFile);
console.log('wrote', outFile.replace(ROOT + '/', ''));

// optional preview composite
if (opt('--preview')) {
  const layer = (f) => ({ input: resolve(CHARDIR, f) });
  const base = category === 'shoes' ? ['bottom_shorts.webp'] : (category === 'bottom' ? [] : ['bottom_flares.webp']);
  const comps = [...base.map(layer), layer(cfg.prefix + key + '.webp')].filter((c) => existsSync(c.input));
  const full = await sharp(resolve(CHARDIR, 'base_tan.webp')).composite([{ input: resolve(CHARDIR, 'base_tan_feet.webp') }, ...comps]).flatten({ background: '#bfa9e0' }).png().toBuffer();
  await sharp(full).resize(260).png().toFile(resolve(ROOT, opt('--preview')));
  console.log('preview', opt('--preview'));
}

// ---- register in charKeys.js ----------------------------------------------
function addToList(src, listName, val) {
  const re = new RegExp(`(export const ${listName} = \\[)([^\\]]*)(\\])`);
  const m = src.match(re);
  if (!m) { console.warn('  (could not find', listName, '- add', `'${val}'`, 'manually)'); return src; }
  const items = m[2].split(',').map((s) => s.trim()).filter(Boolean);
  if (items.includes(`'${val}'`)) { console.log('  already registered in', listName); return src; }
  items.push(`'${val}'`);
  return src.replace(re, `$1${items.join(', ')}$3`);
}
let keys = readFileSync(KEYS_FILE, 'utf8');
keys = addToList(keys, cfg.list, key);
if (flags.has('--wide')) keys = addToList(keys, 'CHAR_BOTTOM_WIDE', key);
if (flags.has('--oversized')) keys = addToList(keys, 'CHAR_TOP_OVERSIZED', key);
writeFileSync(KEYS_FILE, keys);
console.log('registered', key, 'in', cfg.list + (flags.has('--wide') ? ' + CHAR_BOTTOM_WIDE' : '') + (flags.has('--oversized') ? ' + CHAR_TOP_OVERSIZED' : ''));
console.log('done. review the preview, then commit.');
