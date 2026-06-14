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
import { CHAR_SKIN_KEYS, CHAR_HAIR_KEYS, CHAR_TOP_KEYS, CHAR_TOP_OVERSIZED, CHAR_BOTTOM_KEYS, CHAR_BOTTOM_WIDE, CHAR_SHOE_KEYS } from '../data/charKeys.js';

const urls = import.meta.glob('./char/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['./char/' + name + '.webp'];

// height / width of the figure frame (widened so floppy hats/ears fit)
export const CHAR_BASE_ASPECT = 1.418;

// Logical depth, back -> front. NOTE: CharSprite reorders the {bottom, top, shoes}
// trio per the top's `oversized` flag and the bottom's `wide` flag, so flared
// pants drape over shoes, tight pants tuck under them, oversized shirts hang over
// the pants, and fitted shirts tuck in. base / feet / hair are fixed; the `feet`
// layer is skipped whenever shoes are worn (no bare foot peeking around a shoe).
export const CHAR_Z = [
  { base: 'body' },
  { base: 'feet' },
  { bottom: 'full' },
  { top: 'full' },
  { shoes: 'full' },
  { hair: 'full' },
];

// Built from the canonical key lists by naming convention: base_<skin>.webp (+
// base_<skin>_feet.webp), hair_<k>.webp, top_<k>.webp, bottom_<k>.webp,
// shoes_<k>.webp. Add a key in charKeys.js + drop the matching asset and it
// lights up everywhere.
const cat = (keys, prefix) => Object.fromEntries(keys.map((k) => [k, { full: { url: u(prefix + k) } }]));
export const CHAR_LAYERS = {
  base: Object.fromEntries(CHAR_SKIN_KEYS.map((k) => [k, { body: { url: u('base_' + k) }, feet: { url: u('base_' + k + '_feet') } }])),
  hair: cat(CHAR_HAIR_KEYS, 'hair_'),
  top: Object.fromEntries(CHAR_TOP_KEYS.map((k) => [k, { full: { url: u('top_' + k) }, oversized: CHAR_TOP_OVERSIZED.includes(k) }])),
  bottom: Object.fromEntries(CHAR_BOTTOM_KEYS.map((k) => [k, { full: { url: u('bottom_' + k) }, wide: CHAR_BOTTOM_WIDE.includes(k) }])),
  shoes: cat(CHAR_SHOE_KEYS, 'shoes_'),
};

// keys present for each category (handy for the wardrobe UI)
export const CHAR_KEYS = Object.fromEntries(
  Object.entries(CHAR_LAYERS).map(([c, m]) => [c, Object.keys(m)]),
);
