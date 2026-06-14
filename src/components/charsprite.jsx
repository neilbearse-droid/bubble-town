import { CHAR_LAYERS, CHAR_BASE_ASPECT, CHAR_Z } from '../assets/charLayers.js';

// Illustrated paper-doll. `c` maps each category to a layer key:
//   { skinKey, hairKey, topKey, bottomKey, shoesKey }  (any garment may be null)
// Each layer is a full-canvas, pre-aligned cutout produced by keying magenta off
// a fixed-pose render (see SPEC.md), so the pieces just stack at inset 0 in
// CHAR_Z order. Bare skin keys to transparent, so garments show the base through
// them for free (hands in front of sleeves, etc.) — and mix & match freely.
const FULL_FRAME = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' };

function CharSprite({ c = {}, size = 132, style }) {
  const base = CHAR_LAYERS.base[c.skinKey] || Object.values(CHAR_LAYERS.base)[0];
  const keyFor = { base, hair: c.hairKey, top: c.topKey, bottom: c.bottomKey, shoes: c.shoesKey };
  return (
    <div style={{ position: 'relative', width: size, height: size * CHAR_BASE_ASPECT, ...style }}>
      {CHAR_Z.map((slot, i) => {
        const [cat, part] = Object.entries(slot)[0];
        // hide bare feet when shoes are worn (so no skin peeks around the shoe)
        if (cat === 'base' && part === 'feet' && c.shoesKey) return null;
        // pants have two possible slots: 'full' (under the shoe) and 'over' (draped
        // over the shoe). A WIDE/flared pant renders only at 'over'; a tight one only
        // at 'full'. So flares cover high-tops, skinny jeans tuck into them.
        if (cat === 'bottom') {
          const g = CHAR_LAYERS.bottom[c.bottomKey];
          if (!g || !!g.wide !== (part === 'over')) return null;
          return <img key={i} src={g.full.url} draggable="false" alt="" style={FULL_FRAME} />;
        }
        const group = cat === 'base' ? base : (CHAR_LAYERS[cat] && CHAR_LAYERS[cat][keyFor[cat]]);
        const L = group && group[part];
        if (!L) return null;
        return <img key={i} src={L.url} draggable="false" alt="" style={FULL_FRAME} />;
      })}
    </div>
  );
}

export { CharSprite };
