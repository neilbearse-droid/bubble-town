// Layered paper-doll sprite registry. Each wearable is an isolated, trimmed
// .webp generated to fit the shared character base (see scripts/build-char-layers.mjs
// and the base reference). The compositor (CharSprite) stacks them with the
// per-layer geometry below.
//
// A wearable is NOT a single flat overlay: it can carry a `back` piece and a
// `front` piece so the body is painted *between* them. That's what lets a hair
// put its length behind the head while the bangs sit in front of the forehead,
// or a jacket tuck the torso inside it. Pieces with no body in front of them
// (e.g. an open jacket worn over the torso) can supply just `front`.
//
// Geometry per piece is normalised to the trimmed BASE-BODY frame:
//   w  = piece width as a fraction of the base width
//   cx = horizontal centre (0..1 across base width)
//   cy = vertical centre  (0..1 down base height)
// so pieces stay aligned at any render size. Generate back/front pieces from a
// single illustration with scripts/split-layer-parts.mjs.
const urls = import.meta.glob('./char/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['./char/' + name + '.webp'];

// height / width of the trimmed base body (keeps the frame the right shape)
export const CHAR_BASE_ASPECT = 1.757;

// Paint order, back -> front. The body (`base`) is painted in the middle so
// `back` pieces fall behind it and `front` pieces in front of it.
export const CHAR_Z = [
  { cat: 'hair', part: 'back' },
  { cat: 'top', part: 'back' },
  { cat: 'base' },
  { cat: 'bottom', part: 'front' },
  { cat: 'shoes', part: 'front' },
  { cat: 'top', part: 'front' },
  { cat: 'acc', part: 'front' },
  { cat: 'hair', part: 'front' },
];

export const CHAR_LAYERS = {
  base: {
    tan: { url: u('base_tan') },
  },
  bottom: {},
  shoes: {},
  top: {
    // Open puffer worn over the torso: a single front piece (body shows through
    // the open front, no back panel needed).
    puffer_lavender: {
      front: { url: u('top_puffer'), w: 1.021, cx: 0.502, cy: 0.571 },
    },
  },
  hair: {
    // Bob: full silhouette behind the head + a bangs crop in front of the
    // forehead, so the face sits inside the hair.
    bob_blue: {
      back: { url: u('hair_bob_back'), w: 0.881, cx: 0.502, cy: 0.104 },
      front: { url: u('hair_bob_front'), w: 0.881, cx: 0.502, cy: 0.013 },
    },
  },
  acc: {},
};

// keys present for each category (handy for editors)
export const CHAR_KEYS = Object.fromEntries(
  Object.entries(CHAR_LAYERS).map(([cat, m]) => [cat, Object.keys(m)]),
);
