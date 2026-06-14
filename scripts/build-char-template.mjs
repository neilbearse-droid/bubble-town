// Build the registration template for the paper-doll art pipeline (see
// src/assets/char/SPEC.md). Emits, on the shared master canvas:
//   _template_base.png  — the current base art scaled to canvas (the pose to
//                         draw every part/garment against)
//   _template_guide.png — base + labelled part regions + a 16-cell grid, to use
//                         as the control/reference image for AI generation.
// Output -> src/assets/char/. Regenerate whenever the base pose changes.
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(__dir, '../src/assets/char');

// Master canvas (aspect must match CHAR_BASE_ASPECT = 1.757).
const W = 584, H = 1024;

// Part regions as fractions of the canvas {x0,y0,x1,y1} — drawing guides, not
// hard masks. Mirror left/right share a label.
const REGIONS = [
  ['head', 0.30, 0.00, 0.70, 0.34],
  ['ear', 0.22, 0.24, 0.30, 0.34], ['ear', 0.70, 0.24, 0.78, 0.34],
  ['torso', 0.30, 0.36, 0.70, 0.62],
  ['arm_upper', 0.18, 0.40, 0.30, 0.55], ['arm_upper', 0.70, 0.40, 0.82, 0.55],
  ['arm_fore', 0.04, 0.52, 0.20, 0.66], ['arm_fore', 0.80, 0.52, 0.96, 0.66],
  ['hand', 0.00, 0.55, 0.16, 0.69], ['hand', 0.84, 0.55, 1.00, 0.69],
  ['leg_thigh', 0.34, 0.62, 0.50, 0.78], ['leg_thigh', 0.50, 0.62, 0.66, 0.78],
  ['leg_shin', 0.34, 0.78, 0.50, 0.90], ['leg_shin', 0.50, 0.78, 0.66, 0.90],
  ['foot', 0.30, 0.90, 0.50, 1.00], ['foot', 0.50, 0.90, 0.70, 1.00],
];

const px = (fx, fy) => [Math.round(fx * W), Math.round(fy * H)];

const baseScaled = await sharp(`${DIR}/base_tan.webp`).resize(W, H, { fit: 'fill' }).png().toBuffer();
await sharp({ create: { width: W, height: H, channels: 4, background: '#ffffff' } })
  .composite([{ input: baseScaled }]).png().toFile(`${DIR}/_template_base.png`);

let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
for (let i = 0; i <= 4; i++) {
  const [x] = px(i / 4, 0), [, y] = px(0, i / 4);
  svg += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#888" stroke-width="1" opacity="0.35"/>`;
  svg += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#888" stroke-width="1" opacity="0.35"/>`;
}
for (const [label, x0, y0, x1, y1] of REGIONS) {
  const [ax, ay] = px(x0, y0), [bx, by] = px(x1, y1);
  svg += `<rect x="${ax}" y="${ay}" width="${bx - ax}" height="${by - ay}" fill="none" stroke="#e0327a" stroke-width="2" opacity="0.85"/>`;
  svg += `<text x="${ax + 3}" y="${ay + 13}" fill="#e0327a" font-size="12" font-family="sans-serif">${label}</text>`;
}
svg += '</svg>';

await sharp(`${DIR}/_template_base.png`)
  .composite([{ input: Buffer.from(svg) }]).png().toFile(`${DIR}/_template_guide.png`);

console.log(`template: ${W}x${H} -> _template_base.png + _template_guide.png (${REGIONS.length} region labels)`);
