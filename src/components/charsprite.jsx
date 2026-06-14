import { CHAR_LAYERS, CHAR_BASE_ASPECT } from '../assets/charLayers.js';

// Illustrated paper-doll. `c` maps each category to a layer key:
//   { skinKey, hairKey, topKey, bottomKey, shoesKey }  (any garment may be null)
// Each layer is a full-canvas, pre-aligned cutout produced by keying magenta off
// a fixed-pose render (see SPEC.md), so the pieces just stack at inset 0. Bare
// skin keys to transparent, so garments show the base through them for free.
//
// The {bottom, top, shoes} trio is ordered per character from two flags so the
// overlaps look right (base / feet / hair are fixed around it):
//   • top.oversized  → shirt hangs OVER the pants;  else it tucks UNDER (pants over hem)
//   • bottom.wide    → flared pants drape OVER the shoe; else the shoe sits over the cuff
// These never conflict (waist and ankle are a chain), so a single linear order
// always exists:
const FULL_FRAME = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' };

// back -> front order of [bottom, top, shoes] for each (oversized, wide) combo
const TRIO_ORDER = {
  'o_w': ['shoes', 'bottom', 'top'], // oversized + wide:  shoe < flares < shirt
  'o_t': ['bottom', 'top', 'shoes'], // oversized + tight: pants < shirt, shoe over pants
  'f_w': ['top', 'shoes', 'bottom'], // fitted + wide:     shirt < flares (tucked), flares over shoe
  'f_t': ['top', 'bottom', 'shoes'], // fitted + tight:    shirt < pants (tucked) < shoe
};

function CharSprite({ c = {}, size = 132, style }) {
  const base = CHAR_LAYERS.base[c.skinKey] || Object.values(CHAR_LAYERS.base)[0];
  const topG = CHAR_LAYERS.top[c.topKey];
  const botG = CHAR_LAYERS.bottom[c.bottomKey];
  const oversized = !!(topG && topG.oversized);
  const wide = !!(botG && botG.wide);
  const order = TRIO_ORDER[(oversized ? 'o' : 'f') + '_' + (wide ? 'w' : 't')];
  const url = {
    top: topG && topG.full.url,
    bottom: botG && botG.full.url,
    shoes: (CHAR_LAYERS.shoes[c.shoesKey] || {}).full && CHAR_LAYERS.shoes[c.shoesKey].full.url,
  };
  const hairG = CHAR_LAYERS.hair[c.hairKey];
  const hatG = CHAR_LAYERS.hat[c.hatKey];

  const shoeG = CHAR_LAYERS.shoes[c.shoesKey];
  // foot fill: full bare feet when barefoot; just the ankle (toes removed) for
  // open-back shoes so they show leg, not a bare foot; nothing for closed shoes
  // (they enclose the foot, so hiding it avoids any peek).
  const footLayer = !c.shoesKey ? base.feet : (shoeG && shoeG.open ? base.ankle : null);

  const layers = [base.body.url];
  if (footLayer) layers.push(footLayer.url);
  for (const k of order) { if (url[k]) layers.push(url[k]); }
  if (hairG && !hatG) layers.push(hairG.full.url); // a hat is worn on a bald head — hide the hair
  if (hatG) layers.push(hatG.full.url);

  return (
    <div style={{ position: 'relative', width: size, height: size * CHAR_BASE_ASPECT, ...style }}>
      {layers.map((src, i) => <img key={i} src={src} draggable="false" alt="" style={FULL_FRAME} />)}
    </div>
  );
}

export { CharSprite };
