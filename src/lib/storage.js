// Tiny key/value persistence backed by localStorage, namespaced with a `tt_`
// prefix. The async surface mirrors a remote store so callers can `await`.
export const storage = {
  async get(key) {
    const v = localStorage.getItem('tt_' + key);
    if (v === null) throw new Error('not found');
    return { key, value: v };
  },
  async set(key, value) {
    localStorage.setItem('tt_' + key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem('tt_' + key);
    return { key, deleted: true };
  },
  async list(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('tt_') === 0) {
        const real = k.slice(3);
        if (!prefix || real.indexOf(prefix) === 0) keys.push(real);
      }
    }
    return { keys, prefix };
  },
};
