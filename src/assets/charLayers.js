// Layered paper-doll sprite registry.
//
// Pipeline (see SPEC.md): the character is drawn by an image model in a fixed
// pose. The BASE is that figure with normal skin + face on a #FF00FF magenta
// background; each GARMENT is the *same* figure with magenta skin and a blank
// magenta head, wearing just that one item. We key out all the magenta — so only
// the garment survives, already conformed to the body — and stack it over the
// base. Bare skin (neck, hands, midriff, bare legs) keys to transparent, so the
// base shows through automatically = correct occlusion for free. Every layer is
// a full-canvas, pre-aligned cutout: no per-piece geometry, no slot fitting.
// Layers just paint at inset 0 in CHAR_Z order, so garments mix & match freely.
import { CHAR_SKIN_KEYS, CHAR_HAIR_KEYS, CHAR_TOP_KEYS, CHAR_BOTTOM_KEYS, CHAR_SHOE_KEYS } from '../data/charKeys.js';

const urls = import.meta.glob('./char/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['./char/' + name + '.webp'];

// height / width of the trimmed figure frame (headroom at top for tall hair)
export const CHAR_BASE_ASPECT = 2.047;

// Depth stack, back -> front. Each layer is one full-canvas image; a missing
// (None) slot is skipped, so you can go bald / shirtless / barefoot.
export const CHAR_Z = [
  { base: 'body' }, // the skin: bald figure with face, in underwear
  { bottom: 'full' }, // pants over the legs
  { top: 'full' }, // shirt/jacket over the torso (hem over the waistband)
  { shoes: 'full' }, // over the trouser cuffs
  { hair: 'full' }, // over the head
];

// Built from the canonical key lists by naming convention: base_<skin>.webp,
// hair_<k>.webp, top_<k>.webp, bottom_<k>.webp, shoes_<k>.webp. Add a key in
// charKeys.js + drop the matching asset in char/ and it lights up everywhere.
const cat = (keys, prefix) => Object.fromEntries(keys.map((k) => [k, { full: { url: u(prefix + k) } }]));
export const CHAR_LAYERS = {
  base: Object.fromEntries(CHAR_SKIN_KEYS.map((k) => [k, { body: { url: u('base_' + k) } }])),
  hair: cat(CHAR_HAIR_KEYS, 'hair_'),
  top: cat(CHAR_TOP_KEYS, 'top_'),
  bottom: cat(CHAR_BOTTOM_KEYS, 'bottom_'),
  shoes: cat(CHAR_SHOE_KEYS, 'shoes_'),
};

// keys present for each category (handy for the wardrobe UI)
export const CHAR_KEYS = Object.fromEntries(
  Object.entries(CHAR_LAYERS).map(([c, m]) => [c, Object.keys(m)]),
);
