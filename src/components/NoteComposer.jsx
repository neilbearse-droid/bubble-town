import { useState } from 'react';
import { NOTE_PRESETS, NOTE_STICKERS } from '../lib/notes.js';

const ACCENT = '#A24BFF', PINK = '#FF6FB5', DARK = '#2E2059';

// Pick a friendly preset message (+ optional sticker) to leave for a friend.
// No free text — nothing to moderate.
export default function NoteComposer({ friendName, onClose, onSend }) {
  const [preset, setPreset] = useState(0);
  const [sticker, setSticker] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => { setBusy(true); await onSend(preset, sticker); };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(30,20,50,.55)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 24, padding: 20, boxShadow: '0 20px 50px rgba(20,10,40,.45)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', fontSize: 19, fontWeight: 900, color: DARK, marginBottom: 4 }}>Leave a note 💌</div>
        <div style={{ textAlign: 'center', fontSize: 13, color: '#9A8FBF', marginBottom: 14 }}>for {friendName}</div>

        <div style={{ display: 'grid', gap: 8 }}>
          {NOTE_PRESETS.map((t, i) => (
            <button key={i} onClick={() => setPreset(i)} style={{
              textAlign: 'left', padding: '11px 14px', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 700,
              border: `2px solid ${i === preset ? ACCENT : '#ECE7FA'}`, background: i === preset ? '#F6F0FF' : '#FBFAFF', color: DARK,
            }}>{t}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 800, color: '#9A8FBF', margin: '14px 0 6px' }}>Add a sticker (optional)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {NOTE_STICKERS.map((s) => (
            <button key={s} onClick={() => setSticker(sticker === s ? '' : s)} style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20, cursor: 'pointer',
              border: `2px solid ${sticker === s ? ACCENT : '#ECE7FA'}`, background: sticker === s ? '#F6F0FF' : '#FBFAFF',
            }}>{s}</button>
          ))}
        </div>

        <button disabled={busy} onClick={send} style={{ width: '100%', marginTop: 18, padding: 13, borderRadius: 14, border: 'none', background: `linear-gradient(${ACCENT},${PINK})`, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Sending…' : `Send ${sticker || '💌'}`}
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 8, padding: 8, border: 'none', background: 'transparent', color: '#9A8FBF', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}
