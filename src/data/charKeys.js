// Canonical character layer keys — the single source of truth for which skins,
// hair, tops, bottoms and shoes exist. `charLayers.js` maps these to asset URLs
// by naming convention (base_<skin>.webp, hair_<k>.webp, top_<k>.webp,
// bottom_<k>.webp, shoes_<k>.webp); the data layer (buildings, events) uses them
// to build & randomise friends.
//
// Plain module (no Vite `import.meta.glob`) so Node scripts — e.g. the data
// integrity check — can import the data layer without a build step.
export const CHAR_SKIN_KEYS = ['tan'];
export const CHAR_HAIR_KEYS = ['tousle', 'bob'];
export const CHAR_TOP_KEYS = ['hoodie', 'tank', 'red', 'poptee', 'unicorn', 'cupcake', 'band', 'the1975', 'u2'];
export const CHAR_BOTTOM_KEYS = ['flares', 'sparkle'];
export const CHAR_SHOE_KEYS = ['white', 'canvas'];
