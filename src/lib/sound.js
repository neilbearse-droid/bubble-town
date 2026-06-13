// ---------- tiny sound kit (WebAudio, no assets) ----------
let _ac = null;
const _audio = () => { if (typeof window === 'undefined') return null; if (!_ac) { try { _ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { _ac = null; } } return _ac; };
let SOUND_ON = true;
const setSoundOn = (v) => { SOUND_ON = v; };
const _tone = (freq, t0, dur, type, gain) => {
  const ac = _audio(); if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain == null ? 0.16 : gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0007, t0 + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
};
const sfx = (name) => {
  if (!SOUND_ON) return;
  const ac = _audio(); if (!ac) return;
  if (ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
  const t = ac.currentTime;
  if (name === 'pop') { _tone(440, t, 0.11, 'sine', 0.18); _tone(660, t + 0.03, 0.11, 'sine', 0.13); }
  else if (name === 'chomp') { _tone(170, t, 0.08, 'square', 0.15); _tone(110, t + 0.05, 0.09, 'square', 0.13); }
  else if (name === 'sparkle') { [880, 1170, 1560, 2080].forEach((f, i) => _tone(f, t + i * 0.05, 0.15, 'triangle', 0.1)); }
  else if (name === 'yum') { _tone(523, t, 0.13, 'sine', 0.16); _tone(784, t + 0.1, 0.2, 'sine', 0.16); }
  else if (name === 'pip') { _tone(740, t, 0.09, 'triangle', 0.13); _tone(1000, t + 0.07, 0.12, 'triangle', 0.12); }
  else if (name === 'build') { [330, 392, 523, 659].forEach((f, i) => _tone(f, t + i * 0.12, 0.22, 'triangle', 0.13)); }
};

export { setSoundOn, sfx };
