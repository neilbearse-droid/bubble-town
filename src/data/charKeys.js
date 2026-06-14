// Canonical character layer keys — the single source of truth for which skins,
// hair, tops, bottoms and shoes exist. `charLayers.js` maps these to asset URLs
// by naming convention (base_<skin>.webp, hair_<k>.webp, top_<k>.webp,
// bottom_<k>.webp, shoes_<k>.webp); the data layer (buildings, events) uses them
// to build & randomise friends.
//
// Plain module (no Vite `import.meta.glob`) so Node scripts — e.g. the data
// integrity check — can import the data layer without a build step.
export const CHAR_SKIN_KEYS = ['tan'];
export const CHAR_HAIR_KEYS = ['tousle', 'bob', 'bunny', 'bunnygold', 'blonde', 'lime', 'brownstreak'];
// HATS are the topmost layer and are worn on a BALD head — wearing one hides
// the hair entirely (see CharSprite). Optional slot: a friend may wear none.
export const CHAR_HAT_KEYS = ['tophat', 'bucket', 'cowboy', 'beret', 'cap', 'sailor', 'beanie', 'sunhat', 'helmet', 'party'];
export const CHAR_TOP_KEYS = ['tank', 'red', 'poptee', 'unicorn', 'band', 'the1975', 'u2', 'blacktank', 'beyonce', 'billie', 'chappell', 'katseye', 'sabrina', 'taylor', 'yungblud', 'denimjacket', 'hoodie', 'jersey', 'sweater', 'tunic', 'striped', 'button', 'raincoat'];
// OVERSIZED tops hang OVER the pants (untucked); everything else is "fitted" and
// tucks in (the pant waistband sits over the shirt hem). Tank is fitted here.
export const CHAR_TOP_OVERSIZED = ['red', 'poptee', 'unicorn', 'band', 'the1975', 'u2', 'beyonce', 'billie', 'chappell', 'katseye', 'sabrina', 'taylor', 'yungblud', 'denimjacket', 'hoodie', 'jersey', 'sweater', 'tunic', 'striped', 'button', 'raincoat'];
export const CHAR_BOTTOM_KEYS = ['flares', 'sparkle', 'boho', 'plaid', 'shorts', 'stars', 'leggings', 'blackleggings', 'jeans', 'cords', 'sweatpants', 'cargo', 'khakishorts', 'skirt', 'joggers', 'capris', 'overalls'];
// WIDE/flared pants drape OVER the shoe (boot-cut look); everything else is
// "tight" and the shoe sits on top of the cuff (skinny-jeans-into-sneakers).
// Shorts don't reach the shoe, so they're moot.
export const CHAR_BOTTOM_WIDE = ['flares', 'sparkle', 'boho', 'plaid', 'stars'];
export const CHAR_SHOE_KEYS = ['white', 'hightop', 'green', 'boots', 'blue', 'jordan', 'crocs', 'loafers', 'slippers', 'clogs', 'pinkboots', 'skates', 'redsneaks', 'whitehigh', 'rainboots', 'flats', 'sandals'];
// OPEN-BACK shoes (Crocs, sandals, slides) show the bare foot through them, so
// the feet layer is NOT hidden for these (closed shoes enclose the foot fully).
export const CHAR_SHOE_OPEN = ['crocs', 'clogs', 'sandals', 'flats'];
