// Layered paper-doll sprite registry. Each wearable is an isolated, trimmed
// .webp generated to fit the shared character base (see scripts/build-char-layers.mjs
// and the base reference). The compositor (CharSprite) stacks them with the
// per-layer geometry below.
//
// A wearable is NOT a single flat overlay: it can carry a `back` piece and a
// `front` piece so the body is painted *between* them. That's what lets a hair
// put its length behind the head while the bangs sit in front of the forehead,
// or a jacket tuck the torso inside it. Pieces with no body in front of them
// (e.g. an open jacket worn over the torso) can supply just `front`.
//
// Geometry per piece is normalised to the trimmed BASE-BODY frame:
//   w  = piece width as a fraction of the base width
//   cx = horizontal centre (0..1 across base width)
//   cy = vertical centre  (0..1 down base height)
// so pieces stay aligned at any render size. Generate back/front pieces from a
// single illustration with scripts/split-layer-parts.mjs.
const urls = import.meta.glob('./char/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['./char/' + name + '.webp'];

// height / width of the trimmed base body (keeps the frame the right shape)
export const CHAR_BASE_ASPECT = 1.757;

// ---------------------------------------------------------------------------
// THE RIG — authoritative depth stack, back -> front. Single source of truth;
// SPEC.md documents the art contract that fills it. Each entry is one slot:
// a BASE body part (`base: <part>`) or a garment piece (`<category>: <part>`).
//
// The body is split into depth-ordered parts so garments wrap per-limb instead
// of sitting flat on top. The per-limb micro-stacks are what make sleeve and
// trouser *lengths* "just work" — a short sleeve only fills sleeve_upper, so the
// bare forearm shows in front of it; a long sleeve also fills sleeve_fore:
//   arm:  arm_upper -> sleeve_upper -> arm_fore -> sleeve_fore -> hand
//   leg:  leg_thigh -> bottom_thigh -> leg_shin -> bottom_shin -> foot -> shoe
//   head: hair.back -> head -> ear -> collar -> hair.front (bangs)
// Missing slots are skipped, so the rig lights up part-by-part as art lands.
export const CHAR_Z = [
  { hair: 'back' },
  { top: 'torso_back' }, // open-jacket lining / shirt back panel, behind the torso
  { base: 'arm_upper_l' }, { base: 'arm_upper_r' },
  { base: 'leg_thigh_l' }, { base: 'leg_thigh_r' },
  { base: 'leg_shin_l' }, { base: 'leg_shin_r' },
  { base: 'foot_l' }, { base: 'foot_r' },
  { base: 'torso' },
  { base: 'head' },
  { base: 'ear_l' }, { base: 'ear_r' },
  { bottom: 'thigh_l' }, { bottom: 'thigh_r' }, // trousers over the thighs (shorts stop here)
  { bottom: 'shin_l' }, { bottom: 'shin_r' }, // trousers over the shins (full-length only)
  { shoes: 'l' }, { shoes: 'r' }, // over the trouser cuffs
  { top: 'torso_front' }, // shirt / jacket body over the torso
  { top: 'collar' }, // collar over the neck
  { top: 'sleeve_upper_l' }, { top: 'sleeve_upper_r' },
  { base: 'arm_fore_l' }, { base: 'arm_fore_r' }, // bare forearm: over short sleeves, under long
  { top: 'sleeve_fore_l' }, { top: 'sleeve_fore_r' },
  { base: 'hand_l' }, { base: 'hand_r' }, // always in front of the cuff
  { acc: 'front' },
  { hair: 'front' },
];

// Art registry. Purpose-drawn pieces are authored full-canvas (no geometry).
// The pieces below are the bootstrap/placeholder set sliced from the original
// flat art (see scripts/{rig-base-parts,split-layer-parts,split-open-jacket}.mjs)
// and still carry { w, cx, cy }; they'll be replaced part-by-part per SPEC.md.
export const CHAR_LAYERS = {
  base: {
    // A skin is a set of depth-ordered, full-frame body parts keyed by the slot
    // names in CHAR_Z. Bootstrap art is one full-figure `torso` cutout plus a
    // combined `hand_l` (the placeholder image already holds both hands).
    tan: {
      torso: { url: u('base_tan') },
      hand_l: { url: u('base_tan_hands') },
    },
  },
  bottom: {},
  shoes: {},
  top: {
    // Open puffer: lining behind the torso, panels + sleeves in front.
    puffer_lavender: {
      torso_back: { url: u('top_puffer_back'), w: 1.021, cx: 0.502, cy: 0.571 },
      torso_front: { url: u('top_puffer_front'), w: 1.021, cx: 0.502, cy: 0.571 },
    },
  },
  hair: {
    // Bob: full silhouette behind the head + a bangs crop over the forehead.
    bob_blue: {
      back: { url: u('hair_bob_back'), w: 0.881, cx: 0.502, cy: 0.104 },
      front: { url: u('hair_bob_front'), w: 0.881, cx: 0.502, cy: 0.013 },
    },
  },
  acc: {},
};

// keys present for each category (handy for editors)
export const CHAR_KEYS = Object.fromEntries(
  Object.entries(CHAR_LAYERS).map(([cat, m]) => [cat, Object.keys(m)]),
);
