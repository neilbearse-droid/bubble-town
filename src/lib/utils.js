const KEY = 'tiny_town_save_v2';
const OLDKEY = 'tiny_town_save_v1';
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Deep-copy game state (pure JSON data). structuredClone is markedly faster than
// a JSON round-trip and runs on every state update — including each pointermove
// during a drag — so it matters on lower-end mobile. Fall back for old engines.
const clone =
  typeof structuredClone === 'function'
    ? (s) => structuredClone(s)
    : (s) => JSON.parse(JSON.stringify(s));
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => clamp(Math.round(c + 255 * amt / 100), 0, 255);
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export { KEY, OLDKEY, uid, clamp, clone, rand, shade };
