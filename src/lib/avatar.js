// Generate a circular-ready profile avatar from a player's own character —
// just the head, drawn from the same pre-aligned layer images CharSprite uses.
// Returns a square PNG Blob (with a soft background); display it round in CSS.
import { CHAR_LAYERS } from '../assets/charLayers.js';

// Head crop within the 875×1331 character frame (tuned so the face sits centred
// with the hair/hat visible — see scripts validation).
const CROP = { left: 201, top: 100, side: 473 };
const BG = '#cfeaff';

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('avatar image failed: ' + src));
    im.src = src;
  });
}

// `c` is the character keys object: { skinKey, topKey, hairKey, hatKey, ... }.
export async function generateAvatarBlob(c = {}, outSize = 256) {
  const base = CHAR_LAYERS.base[c.skinKey] || Object.values(CHAR_LAYERS.base)[0];
  const topG = CHAR_LAYERS.top[c.topKey];
  const hairG = CHAR_LAYERS.hair[c.hairKey];
  const hatG = CHAR_LAYERS.hat[c.hatKey];

  // Only layers that appear in the head/shoulder crop: base, the shirt collar,
  // and hair or hat (a hat is worn on a bald head, so it hides the hair).
  const srcs = [base.body.url];
  if (topG) srcs.push(topG.full.url);
  if (hairG && !hatG) srcs.push(hairG.full.url);
  if (hatG) srcs.push(hatG.full.url);

  const imgs = await Promise.all(srcs.map(loadImg));
  const canvas = document.createElement('canvas');
  canvas.width = outSize; canvas.height = outSize;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, outSize, outSize);
  for (const im of imgs) {
    ctx.drawImage(im, CROP.left, CROP.top, CROP.side, CROP.side, 0, 0, outSize, outSize);
  }
  return await new Promise((res) => canvas.toBlob(res, 'image/png', 0.92));
}

// Convenience for previewing without uploading (returns an object URL).
export async function generateAvatarUrl(c, outSize = 256) {
  const blob = await generateAvatarBlob(c, outSize);
  return URL.createObjectURL(blob);
}
