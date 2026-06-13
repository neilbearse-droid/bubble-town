// Data-integrity check for the content layer. The data modules are plain JS, so
// we can import them directly (no build) and assert the catalog, building
// layouts, loot tables, world map, and default save all reference real things.
import { readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(resolve(root, p)).href);

const { ITEMS, CATS, LOOT_KEYS, WALLS, FLOORS } = await imp('src/data/items.js');
const { BUILDINGS, BUILDABLE_IDS, MAP_SPOTS, defaultState } = await imp('src/data/buildings.js');
const { EVENTS } = await imp('src/data/events.js');

const errors = [];
const fail = (msg) => errors.push(msg);

const catIds = new Set(CATS.map((c) => c.id).concat(['rare', 'event']));
const wallIds = new Set(WALLS.map((w) => w.id));
const floorIds = new Set(FLOORS.map((f) => f.id));
const CONTAINER_TYPES = new Set(['chest', 'fridge', 'cabinet', 'wardrobe']);

// 1. Every item has a valid category.
for (const [k, d] of Object.entries(ITEMS)) {
  if (!catIds.has(d.c)) fail(`ITEMS.${k} has unknown category "${d.c}"`);
  if (!d.e && !d.svg && !['sofa'].includes(k)) { /* sprite items rely on IMG; emoji/svg optional */ }
}

// 2. Loot table is sane.
if (!LOOT_KEYS.length) fail('LOOT_KEYS is empty');
for (const k of LOOT_KEYS) if (!ITEMS[k] || !ITEMS[k].rare) fail(`LOOT_KEYS has non-rare/unknown key "${k}"`);

// 3. Building layouts reference real items, rooms use real wall/floor styles,
//    and containers are known types.
for (const [bid, b] of Object.entries(BUILDINGS)) {
  for (const [fi, floor] of b.floors.entries()) {
    for (const r of floor.rooms) {
      if (!wallIds.has(r.w)) fail(`${bid} floor ${fi} room "${r.name}" has unknown wall "${r.w}"`);
      if (!floorIds.has(r.f)) fail(`${bid} floor ${fi} room "${r.name}" has unknown floor "${r.f}"`);
    }
    for (const it of floor.items || []) {
      if (!ITEMS[it[0]]) fail(`${bid} floor ${fi} places unknown item "${it[0]}"`);
    }
    for (const c of floor.containers || []) {
      if (!CONTAINER_TYPES.has(c.t)) fail(`${bid} floor ${fi} has unknown container type "${c.t}"`);
    }
  }
}

// 4. World map spots reference real buildings or valid plot indices.
for (const sp of MAP_SPOTS) {
  if (sp.core !== undefined && !BUILDINGS[sp.core]) fail(`MAP_SPOTS references unknown core "${sp.core}"`);
  if (sp.plot !== undefined && (sp.plot < 0 || sp.plot > 2)) fail(`MAP_SPOTS has out-of-range plot ${sp.plot}`);
}
for (const id of BUILDABLE_IDS) if (!BUILDINGS[id]) fail(`BUILDABLE_IDS references unknown building "${id}"`);

// 5. Events reference real item keys via their `ev` tag.
for (const [eid] of Object.entries(EVENTS)) {
  const evItems = Object.values(ITEMS).filter((d) => d.ev === eid);
  if (!evItems.length) fail(`event "${eid}" has no items tagged ev:"${eid}"`);
}

// 6. Every item sprite is actually used — a sprite file with no matching ITEMS
//    key would never render in-game (the orphan-sprite bug).
for (const f of readdirSync(resolve(root, 'src/assets/items'))) {
  const key = f.replace(/\.webp$/, '');
  if (!ITEMS[key]) fail(`sprite "${f}" has no matching item key "${key}"`);
}

// 7. The default save is internally consistent.
const st = defaultState();
for (const ch of st.chars) {
  if (ch.building && !BUILDINGS[ch.building]) fail(`default char "${ch.name}" placed in unknown building "${ch.building}"`);
}

if (errors.length) {
  console.error('❌ data-integrity check FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✅ data-integrity check passed — ${Object.keys(ITEMS).length} items, ${Object.keys(BUILDINGS).length} buildings, ${Object.keys(EVENTS).length} events`);
