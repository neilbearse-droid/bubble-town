// Tiny key/value persistence, namespaced with a `tt_` prefix and an async
// surface so callers can `await`.
//
// On the WEB it uses localStorage (unchanged — existing saves and the GitHub
// Pages build keep working exactly as before). Inside the NATIVE app
// (Capacitor / iOS) it uses @capacitor/preferences, which is durable native
// storage that isn't subject to WKWebView data eviction — so game saves stick.
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const PFX = 'tt_';
const native = Capacitor.isNativePlatform();

export const storage = {
  async get(key) {
    let value;
    if (native) value = (await Preferences.get({ key: PFX + key })).value;
    else value = localStorage.getItem(PFX + key);
    if (value === null || value === undefined) throw new Error('not found');
    return { key, value };
  },
  async set(key, value) {
    const v = String(value);
    if (native) await Preferences.set({ key: PFX + key, value: v });
    else localStorage.setItem(PFX + key, v);
    return { key, value: v };
  },
  async delete(key) {
    if (native) await Preferences.remove({ key: PFX + key });
    else localStorage.removeItem(PFX + key);
    return { key, deleted: true };
  },
  async list(prefix) {
    let all = [];
    if (native) {
      all = (await Preferences.keys()).keys || [];
    } else {
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) all.push(k); }
    }
    const keys = [];
    for (const k of all) {
      if (k.indexOf(PFX) !== 0) continue;
      const real = k.slice(PFX.length);
      if (!prefix || real.indexOf(prefix) === 0) keys.push(real);
    }
    return { keys, prefix };
  },
};
