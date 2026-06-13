// Sprite registry. The actual .webp files live in ./items and ./containers and
// are emitted by Vite as separate, content-hashed, cacheable assets (instead of
// ~2.3MB of base64 baked into the JS bundle). import.meta.glob wires filename ->
// final URL at build time.
const itemUrls = import.meta.glob('./items/*.webp', { eager: true, query: '?url', import: 'default' });
const containerUrls = import.meta.glob('./containers/*.webp', { eager: true, query: '?url', import: 'default' });

const baseName = (p) => p.split('/').pop().replace('.webp', '');

// key -> url, e.g. IMG.sofa
export const IMG = Object.fromEntries(
  Object.entries(itemUrls).map(([p, url]) => [baseName(p), url]),
);

// container type -> { c: closedUrl, o: openUrl, cw, ow }. Missing closed sprites
// (the wardrobe) stay undefined so the UI falls back to the SVG component.
const CONTAINER_META = {
  "chest": {
    "cw": 120,
    "ow": 123,
    "hasC": true,
    "hasO": true
  },
  "cabinet": {
    "cw": 128,
    "ow": 160,
    "hasC": true,
    "hasO": true
  },
  "fridge": {
    "cw": 104,
    "ow": 109,
    "hasC": true,
    "hasO": true
  },
  "wardrobe": {
    "ow": 150,
    "hasC": false,
    "hasO": true
  }
};

export const CIMG = Object.fromEntries(
  Object.entries(CONTAINER_META).map(([k, m]) => [
    k,
    {
      c: m.hasC ? containerUrls['./containers/' + k + '_c.webp'] : undefined,
      o: m.hasO ? containerUrls['./containers/' + k + '_o.webp'] : undefined,
      cw: m.cw,
      ow: m.ow,
    },
  ]),
);
