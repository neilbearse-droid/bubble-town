// Canonical character layer keys — the single source of truth for which skins
// and outfits exist. `charLayers.js` maps these to asset URLs by naming
// convention (base_<skin>.webp, outfit_<outfit>.webp); the data layer
// (buildings, events) uses them to build & randomise friends.
//
// Plain module (no Vite `import.meta.glob`) so Node scripts — e.g. the data
// integrity check — can import the data layer without a build step.
export const CHAR_SKIN_KEYS = ['tan'];
export const CHAR_OUTFIT_KEYS = ['everyday', 'futurepop'];
