import { NAMES } from './items.js';
import { CHAR_SKIN_KEYS, CHAR_HAIR_KEYS, CHAR_HAT_KEYS, CHAR_TOP_KEYS, CHAR_BOTTOM_KEYS, CHAR_SHOE_KEYS } from './charKeys.js';
import { rand, uid } from '../lib/utils.js';

// containers are fixed scenery with hidden loot; x is world-%, they sit on the floor
const BUILDINGS = {
  home: {
    n: 'Cozy House', e: '🏠', frame: '#A9745B', roof: '#E76F51', chip: 'rgba(162,75,255,0.24)',
    floors: [
      { name: 'Downstairs',
        rooms: [
          { name: 'Living Room', w: 'cream', f: 'woodL', win: true },
          { name: 'Kitchen', w: 'dotsun', f: 'checker', win: true },
        ],
        containers: [{ id: 'hc', t: 'chest', x: 8 }, { id: 'hf', t: 'fridge', x: 60 }, { id: 'hk', t: 'cabinet', x: 95 }],
        items: [['rug', 16, 97], ['shelf', 9, 95], ['sofa', 16, 95], ['tv', 24, 94], ['lamp', 29, 95], ['frame', 16, 42], ['clock', 24, 40],
          ['table', 64, 95], ['chair', 58, 95.5], ['chair', 70, 95.5, true], ['pot', 75, 96], ['cupcake', 80, 94]],
      },
      { name: 'Upstairs',
        rooms: [
          { name: 'Bedroom', w: 'pink', f: 'carpetmint', win: true },
          { name: 'Bathroom', w: 'sky', f: 'checker' },
        ],
        containers: [{ id: 'hw', t: 'wardrobe', x: 7 }, { id: 'hb', t: 'cabinet', x: 95 }],
        items: [['rug', 16, 97], ['bed', 16, 95], ['teddy', 26, 95], ['plant', 31, 95], ['frame', 16, 42],
          ['bath', 62, 95], ['toilet', 74, 95], ['mirror', 68, 44], ['basket', 80, 95], ['soap', 57, 96]],
      },
    ],
  },
  cafe: {
    n: 'Sunny Café', e: '☕', frame: '#C99A66', roof: '#F4A261', chip: '#FFF1C7',
    floors: [
      { name: 'Café',
        rooms: [
          { name: 'Counter', w: 'butter', f: 'woodD' },
          { name: 'Seating', w: 'stripepink', f: 'checkpink', win: true },
          { name: 'Garden Nook', w: 'mint', f: 'woodL', win: true },
        ],
        containers: [{ id: 'cf', t: 'fridge', x: 6 }, { id: 'cc', t: 'cabinet', x: 16 }, { id: 'cx', t: 'chest', x: 94 }],
        items: [['kettle', 23, 95], ['cupcake', 26.5, 94], ['coffee', 29.5, 94],
          ['table', 42, 95], ['chair', 38, 95.5], ['chair', 46, 95.5, true],
          ['table', 56, 95], ['chair', 52, 95.5], ['chair', 60, 95.5, true], ['frame', 49, 42],
          ['plant', 71, 95], ['tree', 79, 96], ['flower', 86, 95], ['bird', 75, 94]],
      },
    ],
  },
  shop: {
    n: 'Mini Mart', e: '🛍️', frame: '#7A9CC6', roof: '#4D96FF', chip: '#DCEFFB',
    floors: [
      { name: 'Shop',
        rooms: [
          { name: 'Toy Aisle', w: 'dotmint', f: 'checker' },
          { name: 'Treasure Corner', w: 'lilac', f: 'woodL', win: true },
        ],
        containers: [{ id: 'sc', t: 'chest', x: 8 }, { id: 'sk', t: 'cabinet', x: 60 }, { id: 'sw', t: 'wardrobe', x: 92 }],
        items: [['shelf', 17, 95], ['teddy', 24, 95], ['robot', 29, 95], ['skate', 35, 95], ['ball', 41, 94],
          ['gift', 70, 95], ['balloon', 74, 20], ['frame', 79, 42], ['lamp', 83, 95]],
      },
    ],
  },
  bakery: {
    n: 'Sweet Bakery', e: '🧁', frame: '#C98A8A', roof: '#F15BB5', chip: '#FFE3EE', buildable: true,
    floors: [
      { name: 'Bakery',
        rooms: [
          { name: 'Bake Room', w: 'peach', f: 'checker' },
          { name: 'Shop Front', w: 'stripepink', f: 'woodL', win: true },
        ],
        containers: [{ id: 'bk1', t: 'cabinet', x: 10 }, { id: 'bk2', t: 'fridge', x: 24 }, { id: 'bk3', t: 'chest', x: 90 }],
        items: [['pot', 33, 95], ['kettle', 39, 94], ['bread', 44, 94], ['table', 64, 95], ['chair', 58, 95.5], ['cupcake', 70, 94], ['cupcake', 75, 93.5], ['frame', 66, 42], ['lamp', 83, 95]],
      },
    ],
  },
  school: {
    n: 'Little School', e: '🏫', frame: '#B05A4A', roof: '#8A5A4A', chip: '#FFE7D6', buildable: true,
    floors: [
      { name: 'School',
        rooms: [
          { name: 'Classroom', w: 'sky', f: 'woodL', win: true },
          { name: 'Library', w: 'cream', f: 'carpetblue' },
          { name: 'Art Room', w: 'dotmint', f: 'checker', win: true },
        ],
        containers: [{ id: 'sc1', t: 'cabinet', x: 6 }, { id: 'sc2', t: 'chest', x: 48 }, { id: 'sc3', t: 'wardrobe', x: 92 }],
        items: [['table', 16, 95], ['chair', 12, 95.5], ['chair', 20, 95.5, true], ['frame', 16, 40], ['clock', 25, 40], ['shelf', 30, 95], ['shelf', 40, 95], ['rug', 55, 97], ['armchair', 55, 95], ['lamp', 60, 95], ['art', 72, 94], ['table', 80, 95], ['chair', 85, 95.5], ['frame', 78, 42], ['plant', 87, 95]],
      },
    ],
  },
  castle: {
    n: 'Wee Castle', e: '🏰', frame: '#8E9BAD', roof: '#F15BB5', chip: '#E6ECF5', buildable: true,
    floors: [
      { name: 'Ground',
        rooms: [
          { name: 'Great Hall', w: 'cream', f: 'checker', win: true },
          { name: 'Treasury', w: 'butter', f: 'woodD' },
        ],
        containers: [{ id: 'k1', t: 'chest', x: 70 }, { id: 'k2', t: 'chest', x: 92 }],
        items: [['rug', 16, 97], ['armchair', 16, 95], ['candle', 8, 94], ['candle', 24, 94], ['frame', 16, 42], ['table', 30, 95],
          ['lamp', 60, 95], ['gift', 70, 94], ['gem', 84, 94], ['mirror', 64, 44]],
      },
      { name: 'Tower',
        rooms: [
          { name: 'Tower Room', w: 'sky', f: 'woodD', win: true },
          { name: 'Lookout', w: 'lilac', f: 'woodL', win: true },
        ],
        containers: [{ id: 'kw', t: 'wardrobe', x: 8 }, { id: 'kc', t: 'chest', x: 92 }],
        items: [['bed', 16, 95], ['teddy', 26, 95], ['frame', 16, 42], ['balloon', 30, 18],
          ['armchair', 62, 95], ['lamp', 70, 95], ['plant', 80, 95], ['frame', 74, 42]],
      },
    ],
  },
};
const BUILDABLE_IDS = ['bakery', 'school', 'castle'];
const MAP_SPOTS = [
  { core: 'home', x: 28, y: 20 },
  { core: 'cafe', x: 72, y: 30 },
  { core: 'shop', x: 27, y: 42 },
  { plot: 0, x: 73, y: 54 },
  { plot: 1, x: 28, y: 66 },
  { plot: 2, x: 70, y: 78 },
];
const bRooms = (id) => BUILDINGS[id].floors.reduce((a, f) => a + f.rooms.length, 0);
const bSecrets = (id) => BUILDINGS[id].floors.reduce((a, f) => a + f.containers.length, 0);

const mk = (key, x, y, flip) => ({ id: uid(), key, x, y, flip: !!flip });
function freshFloor(id, i) {
  const fc = BUILDINGS[id].floors[i];
  return { rooms: fc.rooms.map((r) => ({ w: r.w, f: r.f })), looted: {}, items: (fc.items || []).map((t) => mk(t[0], t[1], t[2], t[3])) };
}
function freshBuilding(id) {
  return { floors: BUILDINGS[id].floors.map((_, i) => freshFloor(id, i)) };
}
function defaultState() {
  return {
    v: 5, buildingsV: 5,
    sound: true, night: false, event: null,
    chars: [
      { id: uid(), name: 'Maya', skinKey: CHAR_SKIN_KEYS[0], hairKey: 'tousle', topKey: 'red', bottomKey: 'flares', shoesKey: 'white', building: 'home', floor: 0, x: 62, y: 95 },
    ],
    backpack: {},
    plots: [null, null, null],
    buildings: { home: freshBuilding('home'), cafe: freshBuilding('cafe'), shop: freshBuilding('shop') },
  };
}

function randomChar() {
  return {
    name: rand(NAMES), skinKey: rand(CHAR_SKIN_KEYS),
    hairKey: rand(CHAR_HAIR_KEYS), topKey: rand(CHAR_TOP_KEYS),
    bottomKey: rand(CHAR_BOTTOM_KEYS), shoesKey: rand(CHAR_SHOE_KEYS),
    hatKey: CHAR_HAT_KEYS.length && Math.random() < 0.35 ? rand(CHAR_HAT_KEYS) : null,
    building: null, x: 50, y: 92,
  };
}

export { BUILDINGS, BUILDABLE_IDS, MAP_SPOTS, bRooms, bSecrets, mk, freshFloor, freshBuilding, defaultState, randomChar };
