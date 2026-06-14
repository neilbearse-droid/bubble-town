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
const urls = import.meta.glob('./char/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['./char/' + name + '.webp'];

// height / width of the base figure frame (1024 × 1536 renders)
export const CHAR_BASE_ASPECT = 1.5;

// Depth stack, back -> front. Each layer is one full-canvas image; missing keys
// are skipped, so the wardrobe lights up as art lands.
export const CHAR_Z = [
  { base: 'body' }, // the skin: bald figure with face, in underwear
  { outfit: 'full' }, // a complete look (hair + top + bottom + shoes), keyed in one pass
];

export const CHAR_LAYERS = {
  base: {
    tan: { body: { url: u('base_tan') } },
  },
  outfit: {
    everyday: { full: { url: u('outfit_everyday') } }, // brown hair, mustard hoodie, jeans, sneakers
    futurepop: { full: { url: u('outfit_futurepop') } }, // blue bob, FUTURE POP tank, flared jeans, sneakers
  },
};

// keys present for each category (handy for the wardrobe UI)
export const CHAR_KEYS = Object.fromEntries(
  Object.entries(CHAR_LAYERS).map(([cat, m]) => [cat, Object.keys(m)]),
);
