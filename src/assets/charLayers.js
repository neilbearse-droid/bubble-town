// Layered paper-doll sprite registry. Each wearable is an isolated, trimmed
// .webp generated to fit the shared character base (see scripts/build-char-layers.mjs
// and the base reference). The compositor (CharSprite) stacks them with the
// per-layer geometry below.
//
// Geometry is normalised to the trimmed BASE-BODY frame:
//   w  = layer width as a fraction of the base width
//   cx = horizontal centre (0..1 across base width)
//   cy = vertical centre  (0..1 down base height)
// so layers stay aligned at any render size.
const urls = import.meta.glob('./char/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['./char/' + name + '.webp'];

// height / width of the trimmed base body (keeps the frame the right shape)
export const CHAR_BASE_ASPECT = 1.757;

// paint order, back -> front
export const CHAR_Z = ['base', 'bottom', 'shoes', 'top', 'hair', 'acc'];

export const CHAR_LAYERS = {
  base: {
    tan: { url: u('base_tan') },
  },
  bottom: {},
  shoes: {},
  top: {
    puffer_lavender: { url: u('top_puffer'), w: 1.021, cx: 0.502, cy: 0.571 },
  },
  hair: {
    bob_blue: { url: u('hair_bob'), w: 0.881, cx: 0.502, cy: 0.104 },
  },
  acc: {},
};

// keys present for each category (handy for editors)
export const CHAR_KEYS = Object.fromEntries(
  Object.entries(CHAR_LAYERS).map(([cat, m]) => [cat, Object.keys(m)]),
);
