// Headless render smoke test. Loads the production bundle in jsdom, drives the
// async save-load, and asserts the full game scene renders with no runtime
// errors. Run after `npm run build`.
import { JSDOM } from 'jsdom';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const distAssets = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/assets');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const { window } = dom;

for (const k of [
  'window', 'document', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle',
  'customElements', 'CSS', 'MutationObserver', 'DocumentFragment', 'Event', 'CustomEvent',
  'PointerEvent', 'MouseEvent', 'KeyboardEvent', 'SVGElement', 'Image', 'DOMParser',
  'NodeList', 'HTMLCollection', 'getSelection', 'requestIdleCallback',
]) {
  if (window[k] === undefined) continue;
  try {
    Object.defineProperty(globalThis, k, { value: window[k], configurable: true, writable: true });
  } catch { /* read-only global (e.g. navigator in Node 22) — leave it */ }
}
globalThis.self = window;

if (!window.localStorage) {
  const store = new Map();
  window.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
}
globalThis.localStorage = window.localStorage;
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
globalThis.matchMedia = window.matchMedia;

class FakeAudio {
  constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
  createOscillator() { return { type: '', frequency: { setValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
  createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
  resume() {}
}
window.AudioContext = FakeAudio;
window.webkitAudioContext = FakeAudio;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const errors = [];
window.addEventListener('error', (e) => errors.push(String(e.error?.stack || e.error || e.message)));
process.on('uncaughtException', (e) => errors.push('uncaught: ' + (e?.stack || e)));
process.on('unhandledRejection', (e) => errors.push('rejection: ' + (e?.stack || e)));

const jsFile = readdirSync(distAssets).find((f) => /^index-.*\.js$/.test(f));
if (!jsFile) {
  console.error('No built bundle found — run `npm run build` first.');
  process.exit(1);
}
console.log('loading bundle:', jsFile);
try {
  await import(pathToFileURL(distAssets + '/' + jsFile).href);
} catch (e) {
  errors.push('import threw: ' + (e?.stack || e));
}

await new Promise((r) => setTimeout(r, 800));

const html = window.document.getElementById('root')?.innerHTML ?? '';
const markers = ['Map', 'Stuff', 'tt-root', 'svg', 'img'];
const missing = markers.filter((m) => !html.includes(m));

if (errors.length || missing.length || html.length < 5000) {
  console.error('\n❌ smoke test FAILED');
  if (errors.length) for (const e of errors.slice(0, 12)) console.error('  - ' + e.split('\n').slice(0, 3).join('\n    '));
  if (missing.length) console.error('  missing markers:', missing.join(', '));
  console.error('  rendered html length:', html.length);
  process.exit(1);
}
console.log('✅ smoke test passed — rendered', html.length, 'chars, all markers present, no runtime errors');
