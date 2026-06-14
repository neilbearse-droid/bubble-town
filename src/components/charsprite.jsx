import { useState } from 'react';
import { CHAR_LAYERS, CHAR_BASE_ASPECT, CHAR_Z, CHAR_KEYS } from '../assets/charLayers.js';

// Layered illustrated paper-doll. `c` maps each category to a layer key:
//   { skinKey, bottomKey, shoesKey, topKey, hairKey, accKey }
// Pieces stack back-to-front (CHAR_Z) with the body painted in the middle, so a
// wearable's `back` piece falls behind the body and its `front` piece in front
// of it (e.g. hair length behind the head, bangs over the forehead). Each piece
// is centred + scaled by its normalised geometry so it stays registered to the
// base at any size.
function CharSprite({ c = {}, size = 132, style }) {
  const base = CHAR_LAYERS.base[c.skinKey] || Object.values(CHAR_LAYERS.base)[0];
  const keyFor = { bottom: c.bottomKey, shoes: c.shoesKey, top: c.topKey, hair: c.hairKey, acc: c.accKey };
  return (
    <div style={{ position: 'relative', width: size, height: size * CHAR_BASE_ASPECT, ...style }}>
      {CHAR_Z.map((slot) => {
        if (slot.cat === 'base') {
          return base && (
            <img key="base" src={base.url} draggable="false" alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
          );
        }
        const wearable = CHAR_LAYERS[slot.cat] && CHAR_LAYERS[slot.cat][keyFor[slot.cat]];
        const L = wearable && wearable[slot.part];
        if (!L) return null;
        return (
          <img key={`${slot.cat}.${slot.part}`} src={L.url} draggable="false" alt=""
            style={{
              position: 'absolute', left: `${L.cx * 100}%`, top: `${L.cy * 100}%`,
              width: `${L.w * 100}%`, transform: 'translate(-50%,-50%)',
              display: 'block', pointerEvents: 'none',
            }} />
        );
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
