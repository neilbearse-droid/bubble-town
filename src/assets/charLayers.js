// Layered paper-doll sprite registry.
//
// Pipeline (see SPEC.md): the character is drawn by an image model in a fixed
// pose. The BASE is that figure with normal skin + face on a #FF00FF magenta
// background; each OUTFIT is the *same* figure with magenta skin and a blank
// magenta head, dressed. We key out all the magenta — so for an outfit only the
// clothing/hair survives, already conformed to the body — and stack it over the
// base. Bare skin (neck, hands, forearms below a short sleeve) keys to
// transparent, so the base shows through automatically = correct occlusion for
// free. Every layer is a full-canvas, pre-aligned cutout: no per-piece geometry,
// no slot fitting. Layers just paint at inset 0 in CHAR_Z order.
import { CHAR_SKIN_KEYS, CHAR_OUTFIT_KEYS } from '../data/charKeys.js';

const urls = import.meta.glob('./char/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['./char/' + name + '.webp'];

// height / width of the trimmed base figure frame
export const CHAR_BASE_ASPECT = 1.866;

// Depth stack, back -> front. Each layer is one full-canvas image; missing keys
// are skipped, so the wardrobe lights up as art lands.
export const CHAR_Z = [
  { base: 'body' }, // the skin: bald figure with face, in underwear
  { outfit: 'full' }, // a complete look (hair + top + bottom + shoes), keyed in one pass
];

// Built from the canonical key lists: each skin is base_<skin>.webp, each outfit
// is outfit_<outfit>.webp. Add a key in charKeys.js + drop the matching asset in
// char/ and it lights up everywhere.
export const CHAR_LAYERS = {
  base: Object.fromEntries(CHAR_SKIN_KEYS.map((k) => [k, { body: { url: u('base_' + k) } }])),
  outfit: Object.fromEntries(CHAR_OUTFIT_KEYS.map((k) => [k, { full: { url: u('outfit_' + k) } }])),
};

// keys present for each category (handy for the wardrobe UI)
export const CHAR_KEYS = Object.fromEntries(
  Object.entries(CHAR_LAYERS).map(([cat, m]) => [cat, Object.keys(m)]),
);
