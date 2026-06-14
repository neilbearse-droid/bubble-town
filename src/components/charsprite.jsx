import { useState } from 'react';
import { CHAR_LAYERS, CHAR_BASE_ASPECT, CHAR_Z, CHAR_KEYS } from '../assets/charLayers.js';

// Layered illustrated paper-doll. `c` maps each category to a layer key:
//   { skinKey, bottomKey, shoesKey, topKey, hairKey, accKey }
// The body is rigged into depth-ordered parts and garments interleave between
// them (CHAR_Z), so clothing wraps the character instead of sitting flat on top
// — e.g. hair length behind the head with bangs over the forehead, hands in
// front of the sleeves, and shoes over the trouser cuffs (see SPEC.md).
//
// Every layer registers to the same frame. Purpose-drawn art is authored
// full-canvas (no geometry → painted at inset 0); legacy trimmed pieces carry a
// normalised { w, cx, cy } and are centred + scaled. Missing slots are skipped,
// so the rig lights up part-by-part as art lands.
const FULL_FRAME = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' };

function CharSprite({ c = {}, size = 132, style }) {
  const base = CHAR_LAYERS.base[c.skinKey] || Object.values(CHAR_LAYERS.base)[0];
  const keyFor = { base, bottom: c.bottomKey, shoes: c.shoesKey, top: c.topKey, hair: c.hairKey, acc: c.accKey };
  return (
    <div style={{ position: 'relative', width: size, height: size * CHAR_BASE_ASPECT, ...style }}>
      {CHAR_Z.map((slot, i) => {
        const [cat, part] = Object.entries(slot)[0];
        const group = cat === 'base' ? base : (CHAR_LAYERS[cat] && CHAR_LAYERS[cat][keyFor[cat]]);
        const L = group && group[part];
        if (!L) return null;
        const placed = L.w == null ? FULL_FRAME : {
          position: 'absolute', left: `${L.cx * 100}%`, top: `${L.cy * 100}%`,
          width: `${L.w * 100}%`, transform: 'translate(-50%,-50%)',
          display: 'block', pointerEvents: 'none',
        };
        return <img key={i} src={L.url} draggable="false" alt="" style={placed} />;
      })}
    </div>
  );
}

// ---- Beta preview: pick from the (currently small) illustrated wardrobe ----
const startLook = () => ({
  skinKey: CHAR_KEYS.base[0],
  hairKey: CHAR_KEYS.hair[0] || null,
  topKey: CHAR_KEYS.top[0] || null,
});

function CharSpriteDemo({ onClose }) {
  const [look, setLook] = useState(startLook);
  const Row = ({ label, cat, field }) => (
    <div className="mt-3">
      <div className="text-xs font-bold mb-1" style={{ color: '#9D95C0' }}>{label}</div>
      <div className="flex flex-wrap gap-2">
        <Chip active={!look[field]} onClick={() => setLook({ ...look, [field]: null })}>None</Chip>
        {CHAR_KEYS[cat].map((k) => (
          <Chip key={k} active={look[field] === k} onClick={() => setLook({ ...look, [field]: k })}>
            {k.replace(/_/g, ' ')}
          </Chip>
        ))}
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 grid place-items-center p-4" style={{ zIndex: 3200, background: 'rgba(60,40,30,.45)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full rounded-3xl p-4 overflow-y-auto no-sb" style={{ background: '#241B3C', maxWidth: 420, maxHeight: '88dvh' }}>
        <div className="flex items-center justify-between">
          <div className="font-bold" style={{ color: '#ECE7FA' }}>Illustrated friend <span style={{ color: '#A24BFF' }}>· beta</span></div>
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm font-bold active:scale-90" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}>Close</button>
        </div>
        <div className="grid place-items-center mt-2 rounded-2xl" style={{ background: 'rgba(162,75,255,0.14)', minHeight: 300, overflow: 'hidden' }}>
          <CharSprite c={look} size={150} />
        </div>
        <Row label="Hair" cat="hair" field="hairKey" />
        <Row label="Outfit" cat="top" field="topKey" />
        <p className="text-xs mt-4 leading-relaxed" style={{ color: '#9D95C0' }}>
          Early preview of the layered illustrated dress-up. More hairstyles, outfits, bottoms & accessories are on the way ✨
        </p>
      </div>
    </div>
  );
}

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} className="rounded-full px-3.5 py-2 text-xs font-bold active:scale-95 capitalize"
    style={{ background: active ? '#A24BFF' : 'rgba(255,255,255,0.08)', color: active ? '#FFF' : '#A24BFF' }}>{children}</button>
);

export { CharSprite, CharSpriteDemo };
