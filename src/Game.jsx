import { useState, useEffect, useRef } from 'react';
import { CIMG, IMG } from './assets/images.js';
import { Sw } from './components/charsvg.jsx';
import { CharSprite } from './components/charsprite.jsx';
import { CHAR_KEYS, CHAR_BASE_ASPECT } from './assets/charLayers.js';
import { CONTAINER_DEFS } from './components/containers.jsx';
import { EXT, StairsSVG } from './components/exteriors.jsx';
import { FURN, VARIANTS } from './components/furniture.jsx';
import { Backpack, ChevronLeft, FlipHorizontal2, Paintbrush, Pencil, Plus, Settings, Shuffle, Sofa, Trash2, Users, X } from './components/icons.jsx';
import { BUILDABLE_IDS, BUILDINGS, MAP_SPOTS, bRooms, bSecrets, defaultState, freshBuilding, randomChar } from './data/buildings.js';
import { EVENTS } from './data/events.js';
import { BAND, CATS, CHAR_BAND, FLOORS, ITEMS, LOOT_KEYS, WALLS, floorS, wallS } from './data/items.js';
import { setSoundOn, sfx, resumeAudio } from './lib/sound.js';
import { storage } from './lib/storage.js';
import { KEY, OLDKEY, clamp, clone, rand, uid } from './lib/utils.js';

function Game() {
  const [st, setSt] = useState(null);
  const [view, setView] = useState('building');
  const [bid, setBid] = useState('home');
  const [mode, setMode] = useState('items');
  const [dockOpen, setDockOpen] = useState(false);
  const [cat, setCat] = useState('living');
  const [brush, setBrush] = useState(null);
  const [sel, setSel] = useState(null);
  const [creator, setCreator] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [resetArm, setResetArm] = useState(false);
  const [saveStat, setSaveStat] = useState('');
  const [drag, setDrag] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [dw, setDw] = useState(null); // dragged thing's world pos (for landing shadow)
  const [pan, setPan] = useState(0);
  const [fly, setFly] = useState(null); // loot flying to backpack
  const [packPulse, setPackPulse] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [puffs, setPuffs] = useState([]);
  const [buildSheet, setBuildSheet] = useState(null);
  const [constructing, setConstructing] = useState(null);
  const [reacts, setReacts] = useState({});
  const [eating, setEating] = useState(null);
  const [feed, setFeed] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const [eventSheet, setEventSheet] = useState(false);
  const [surfHint, setSurfHint] = useState(null);
  const [curFloor, setCurFloor] = useState(0);
  const [floorDir, setFloorDir] = useState(1);
  const dragRef = useRef(null);
  const panRef = useRef(0);
  const vpRef = useRef(null);
  const trashRef = useRef(null);
  const dockRef = useRef(null);
  const firstLoad = useRef(true);
  const saveTimer = useRef(null);
  useEffect(() => { panRef.current = pan; }, [pan]);
  const stRef = useRef(null); stRef.current = st;
  const floorRef = useRef(0); floorRef.current = curFloor;

  // ---- load + migrate (list first so missing keys never throw) ----
  useEffect(() => {
    (async () => {
      let keys = [];
      try { const l = await storage.list('tiny_town'); keys = (l && l.keys) || []; } catch (e) { keys = []; }
      // Convert any legacy friend to the per-slot illustrated wardrobe. Old SVG
      // looks (skin/hair/outfit colors) and bundled outfit keys are retired; we
      // keep each friend's name & place and give them mix-and-match garments.
      const MIGRATE_LOOKS = [
        { hairKey: 'tousle', topKey: 'red', bottomKey: 'flares', shoesKey: 'white' },
        { hairKey: 'bob', topKey: 'tank', bottomKey: 'flares', shoesKey: 'hightop' },
      ];
      const OUTFIT_MAP = { everyday: MIGRATE_LOOKS[0], futurepop: MIGRATE_LOOKS[1] };
      const slotsFor = (c, i) => OUTFIT_MAP[c && c.outfitKey] || MIGRATE_LOOKS[i % MIGRATE_LOOKS.length];
      if (keys.includes(KEY)) {
        try {
          const r = await storage.get(KEY);
          if (r && r.value) {
            const p = JSON.parse(r.value);
            if (!p.plots) p.plots = [null, null, null];
            if (p.sound === undefined) p.sound = true;
            if (p.night === undefined) p.night = false;
            if (p.event === undefined) p.event = null;
            if (!p.buildingsV || p.buildingsV < 5) {
              const ns = defaultState();
              ns.sound = p.sound; ns.night = p.night; ns.event = p.event;
              ns.backpack = p.backpack || {};
              ns.plots = p.plots;
              if (Array.isArray(p.chars) && p.chars.length) {
                ns.chars = p.chars.map((c, i) => ({
                  id: c.id || uid(), name: c.name || 'Friend',
                  skinKey: CHAR_KEYS.base[0], ...slotsFor(c, i),
                  building: c.building || null, floor: 0,
                  x: clamp(c.x == null ? 50 : c.x, 2, 98), y: clamp(c.y == null ? 92 : c.y, CHAR_BAND[0], CHAR_BAND[1]),
                  ...(c.inTub ? { inTub: c.inTub } : {}),
                }));
              }
              p.plots.forEach((pid) => { if (pid && !ns.buildings[pid]) ns.buildings[pid] = freshBuilding(pid); });
              setSt(ns); return;
            }
            p.plots.forEach((pid) => { if (pid && !p.buildings[pid]) p.buildings[pid] = freshBuilding(pid); });
            setSt(p); return;
          }
        } catch (e) { /* fall through to fresh */ }
      }
      let fresh = defaultState();
      if (keys.includes(OLDKEY)) {
        try {
          const old = await storage.get(OLDKEY);
          if (old && old.value) {
            const o = JSON.parse(old.value);
            if (o.chars && o.chars.length) {
              fresh.chars = o.chars.map((c, i) => ({
                id: c.id || uid(), name: c.name || 'Friend',
                skinKey: CHAR_KEYS.base[0], ...slotsFor(c, i),
                building: null, floor: 0, x: 50, y: 92,
              }));
            }
          }
        } catch (e) { /* no v1 save */ }
      }
      setSt(fresh);
    })();
  }, []);

  // ---- autosave ----
  useEffect(() => {
    if (!st) return;
    if (firstLoad.current) { firstLoad.current = false; return; }
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await storage.set(KEY, JSON.stringify(st));
        setSaveStat('saved ✓');
        setTimeout(() => setSaveStat(''), 1300);
      } catch (e) { /* ignore */ }
    }, 700);
  }, [st]);

  const soundOn = !st || st.sound !== false;
  useEffect(() => { setSoundOn(soundOn); }, [soundOn]);
  useEffect(() => {
    window.addEventListener('pointerdown', resumeAudio);
    return () => window.removeEventListener('pointerdown', resumeAudio);
  }, []);

  // ---- helpers ----
  const zoneClamp = (key, y) => { const b = BAND[(ITEMS[key] && ITEMS[key].zone) || 'floor']; return clamp(y, b[0], b[1]); };
  const upd = (fn) => setSt((s) => { const c = clone(s); fn(c); return c; });

  const isFloor = (key) => ((ITEMS[key] && ITEMS[key].zone) || 'floor') === 'floor';
  const addItem = (key, x, y) => {
    const ly = zoneClamp(key, y);
    upd((c) => { c.buildings[bid].floors[floorRef.current].items.push({ id: uid(), key, x, y: ly, flip: false }); });
    if (isFloor(key)) puffAt(x, ly);
    sfx('pop');
  };
  const addRare = (key, x, y) => {
    if (!st.backpack[key]) return;
    const ly = zoneClamp(key, y);
    upd((c) => {
      if (!c.backpack[key]) return;
      c.backpack[key]--; if (c.backpack[key] <= 0) delete c.backpack[key];
      c.buildings[bid].floors[floorRef.current].items.push({ id: uid(), key, x, y: ly, flip: false });
    });
    if (isFloor(key)) puffAt(x, ly);
    sfx('pop');
  };
  const MAXSURF = 116;
  const canRest = (key) => { const d = ITEMS[key]; return !!(d && d.zone === 'floor' && !d.surf && d.s <= MAXSURF); };
  // Stacking hierarchy. Items render by depth (y), but a "ground" layer (rugs &
  // mats) is pushed into a lower z-band so everything else — chairs, tables,
  // characters — always sits on top of them. GROUND_Z stays small enough that
  // ground items remain above the room background.
  const GROUND_Z = 500;
  const itemZ = (key, yref, on) => Math.round(yref * 10) + (on ? 2 : 0) - ((ITEMS[key] && ITEMS[key].layer) === 'ground' ? GROUND_Z : 0);
  const surfTopY = (surf, vpH) => { const d = ITEMS[surf.key]; const ph = d.s * (d.r || 1); return surf.y - (d.surf.top * ph) / vpH * 100; };
  const findSurface = (x, y, draggedId) => {
    if (!vpRef.current || !stRef.current) return null;
    const r = vpRef.current.getBoundingClientRect();
    const sceneW = r.width * nRooms();
    const arr = (stRef.current.buildings[bid].floors[floorRef.current] || {}).items || [];
    let best = null, bestTop = -1;
    for (const it of arr) {
      if (it.id === draggedId) continue;
      const d = ITEMS[it.key]; if (!d || !d.surf) continue;
      const half = (d.surf.half * d.s) / sceneW * 100;
      if (Math.abs(x - it.x) > half) continue;
      const top = surfTopY(it, r.height);
      if (y > it.y + 2 || y < top - 16) continue;
      if (top > bestTop) { bestTop = top; best = { id: it.id, x: clamp(x, it.x - half, it.x + half), y: top, baseY: it.y, sx: it.x }; }
    }
    return best;
  };
  // Is the drop point over a hot tub? (used to seat a character in the water)
  const tubAt = (x, y) => {
    if (!vpRef.current || !stRef.current) return null;
    const r = vpRef.current.getBoundingClientRect();
    const sceneW = r.width * nRooms();
    const arr = (stRef.current.buildings[bid].floors[floorRef.current] || {}).items || [];
    for (let k = arr.length - 1; k >= 0; k--) {
      const it = arr[k]; const d = ITEMS[it.key];
      if (!d || !d.tub) continue;
      const halfW = (d.surf.half * d.s) / sceneW * 100;
      const top = surfTopY(it, r.height);
      if (Math.abs(x - it.x) <= halfW && y >= top - 16 && y <= it.y + 2) return { id: it.id, x: it.x, baseY: it.y };
    }
    return null;
  };
  const addItemOn = (key, surf) => {
    upd((c) => { c.buildings[bid].floors[floorRef.current].items.push({ id: uid(), key, x: surf.x, y: surf.y, flip: false, on: surf.id, ox: surf.x - surf.sx, by: surf.baseY }); });
    sfx('pop');
  };
  const addRareOn = (key, surf) => {
    if (!st.backpack[key]) return;
    upd((c) => {
      if (!c.backpack[key]) return;
      c.backpack[key]--; if (c.backpack[key] <= 0) delete c.backpack[key];
      c.buildings[bid].floors[floorRef.current].items.push({ id: uid(), key, x: surf.x, y: surf.y, flip: false, on: surf.id, ox: surf.x - surf.sx, by: surf.baseY });
    });
    sfx('pop');
  };
  const removeItem = (id) => {
    upd((c) => {
      const fs = c.buildings[bid].floors[floorRef.current];
      const arr = fs.items;
      const it = arr.find((t) => t.id === id);
      if (it && ITEMS[it.key].rare) c.backpack[it.key] = (c.backpack[it.key] || 0) + 1; // treasures go back to the pack
      if (it && ITEMS[it.key] && ITEMS[it.key].surf) { // things resting on it fall to the floor
        for (const ch of arr) if (ch.on === id) { ch.on = null; ch.by = null; ch.y = zoneClamp(ch.key, 999); }
      }
      if (it && ITEMS[it.key] && ITEMS[it.key].tub) { // friends climb out when the tub goes
        for (const ch of c.chars) if (ch.inTub === id) { delete ch.inTub; ch.y = clamp(ch.y, CHAR_BAND[0], CHAR_BAND[1]); }
      }
      fs.items = arr.filter((t) => t.id !== id);
    });
    setSel(null);
  };
  const flipItem = (id) => upd((c) => { const it = c.buildings[bid].floors[floorRef.current].items.find((t) => t.id === id); if (it) it.flip = !it.flip; });
  const cycleVar = (id) => upd((c) => { const it = c.buildings[bid].floors[floorRef.current].items.find((t) => t.id === id); if (it) { const nv = VARIANTS[it.key] || 1; it.v = ((it.v || 0) + 1) % nv; } });
  // Tap an interactive item (lamp, TV, arcade…) to toggle its on/off state.
  const toggleLit = (id) => { let on = false; upd((c) => { const it = c.buildings[bid].floors[floorRef.current].items.find((t) => t.id === id); if (it) { it.lit = !it.lit; on = it.lit; } }); sfx(on ? 'pip' : 'pop'); };
  const placeChar = (id, x, y) => {
    const tub = tubAt(x, y);
    const ly = clamp(y, CHAR_BAND[0], CHAR_BAND[1]);
    upd((c) => { const ch = c.chars.find((t) => t.id === id); if (ch) { ch.building = bid; ch.floor = floorRef.current; if (tub) { ch.inTub = tub.id; ch.x = tub.x; ch.y = tub.baseY; } else { delete ch.inTub; ch.x = x; ch.y = ly; } } });
    if (tub) { sfx('pip'); relaxBurst(id); } else { puffAt(x, ly); sfx('pop'); }
  };
  // Drop a friend that's already in the building (handles climbing into the tub).
  const settleChar = (id, x, y) => {
    const tub = tubAt(x, y);
    let entered = false;
    upd((c) => {
      const ch = c.chars.find((t) => t.id === id); if (!ch) return;
      if (tub) { entered = ch.inTub !== tub.id; ch.inTub = tub.id; ch.x = tub.x; ch.y = tub.baseY; }
      else { delete ch.inTub; ch.y = clamp(ch.y, CHAR_BAND[0], CHAR_BAND[1]); }
    });
    if (tub) { sfx('pip'); if (entered) relaxBurst(id); }
    else setTimeout(() => puffAt(x, clamp(y, CHAR_BAND[0], CHAR_BAND[1])), 230);
  };
  const relaxBurst = (id) => {
    const ch = ((stRef.current && stRef.current.chars) || []).find((t) => t.id === id);
    if (ch) spawnFloaters(ch.x, ch.y - 16, [{ t: '♨️', dx: -16 }, { t: '😌', dx: 16 }, { t: '💧', dx: 0 }]);
  };
  const stowChar = (id) => { upd((c) => { const ch = c.chars.find((t) => t.id === id); if (ch) ch.building = null; }); setSel(null); };
  const paintRoom = (i) => { if (!brush) return; upd((c) => { const r = c.buildings[bid].floors[floorRef.current].rooms[i]; if (r) r[brush.t === 'wall' ? 'w' : 'f'] = brush.id; }); };
  const openEditor = (id) => { const ch = st.chars.find((c) => c.id === id); if (ch) setCreator(clone(ch)); };
  const saveChar = () => {
    const d = creator;
    upd((c) => {
      if (d.id && c.chars.some((x) => x.id === d.id)) {
        Object.assign(c.chars.find((x) => x.id === d.id), { name: d.name || 'Friend', skinKey: d.skinKey, hairKey: d.hairKey, hatKey: d.hatKey, topKey: d.topKey, bottomKey: d.bottomKey, shoesKey: d.shoesKey });
      } else {
        c.chars.push({ ...d, id: uid(), name: d.name || 'Friend', building: null, x: 50, y: 92 });
      }
    });
    setCreator(null); setView('building'); setMode('people'); setDockOpen(true);
  };
  const deleteChar = (id) => { upd((c) => { c.chars = c.chars.filter((x) => x.id !== id); }); setCreator(null); setSel(null); };
  // one wardrobe row of pill options for a character slot (None = take it off)
  const wRow = (label, cat, field, allowNone = true) => (
    <div className="mt-3" key={field}>
      <div className="text-xs font-bold mb-1.5" style={{ color: '#9D95C0' }}>{label}</div>
      <div className="flex flex-wrap gap-2">
        {allowNone && (
          <button onClick={() => setCreator({ ...creator, [field]: null })} className="rounded-full px-3.5 py-2 text-xs font-bold active:scale-95"
            style={{ background: !creator[field] ? '#A24BFF' : 'rgba(255,255,255,0.08)', color: !creator[field] ? '#FFF' : '#A24BFF' }}>None</button>
        )}
        {CHAR_KEYS[cat].map((k) => (
          <button key={k} onClick={() => setCreator({ ...creator, [field]: k })} className="rounded-full px-3.5 py-2 text-xs font-bold active:scale-95 capitalize"
            style={{ background: creator[field] === k ? '#A24BFF' : 'rgba(255,255,255,0.08)', color: creator[field] === k ? '#FFF' : '#A24BFF' }}>{k}</button>
        ))}
      </div>
    </div>
  );
  const enterBuilding = (id) => {
    setBid(id); setView('building'); setMode('items'); setDockOpen(false); setSel(null); setPan(0); setCurFloor(0);
    upd((c) => { c.buildings[id].floors.forEach((f) => { f.looted = {}; f.copen = {}; }); }); // secrets restock & re-close every visit
  };
  const resetWorld = async () => {
    try {
      const l = await storage.list('tiny_town');
      const ks = (l && l.keys) || [];
      if (ks.includes(KEY)) await storage.delete(KEY);
      if (ks.includes(OLDKEY)) await storage.delete(OLDKEY);
    } catch (e) { /* ignore */ }
    setSt(defaultState()); setShowSettings(false); setResetArm(false); enterBuildingLite('home');
  };
  const enterBuildingLite = (id) => { setBid(id); setView('building'); setMode('items'); setSel(null); setPan(0); setCurFloor(0); };
  const changeFloor = (f) => {
    if (f < 0 || f >= BUILDINGS[bid].floors.length || f === curFloor) return;
    setFloorDir(f > curFloor ? 1 : -1);
    setCurFloor(f); setPan(0); setSel(null); setDockOpen(false); sfx('pip');
  };

  const lootContainer = (cid, e) => {
    const loot = rand(LOOT_KEYS);
    upd((c) => { const fs = c.buildings[bid].floors[floorRef.current]; fs.looted = { ...(fs.looted || {}), [cid]: true }; });
    setFly({ key: loot, e: ITEMS[loot].e, x: e.clientX, y: e.clientY - 60, go: false });
    requestAnimationFrame(() => requestAnimationFrame(() => setFly((f) => (f ? { ...f, go: true } : f))));
    setTimeout(() => {
      upd((c) => { c.backpack[loot] = (c.backpack[loot] || 0) + 1; });
      setFly(null); setPackPulse(true); setTimeout(() => setPackPulse(false), 1200);
      sfx('sparkle');
      setMode('items'); setCat('living');
    }, 780);
  };
  const toggleContainer = (cid, e) => {
    const fs0 = st.buildings[bid].floors[floorRef.current] || {};
    const isOpen = !!(fs0.copen || {})[cid];
    if (isOpen) { upd((c) => { const fs = c.buildings[bid].floors[floorRef.current]; const o = { ...(fs.copen || {}) }; delete o[cid]; fs.copen = o; }); sfx('pip'); return; }
    upd((c) => { const fs = c.buildings[bid].floors[floorRef.current]; fs.copen = { ...(fs.copen || {}), [cid]: true }; });
    sfx('pop');
    if (!(fs0.looted || {})[cid] && !fly) lootContainer(cid, e);
  };

  const puffAt = (x, y, big) => {
    const pid = uid();
    setPuffs((p) => [...p, { id: pid, x, y, big: !!big }]);
    setTimeout(() => setPuffs((p) => p.filter((q) => q.id !== pid)), 820);
  };

  const SAY = ['Hi! 👋', 'Yay!', "Let's play!", "I'm hungry!", 'Hee hee!', 'Twirl! 💫', 'Hello!', 'Wheee!', 'Love you! 💖', 'Snack time?', 'Boop!'];
  const reactChar = (id) => {
    setReacts((r) => ({ ...r, [id]: rand(SAY) }));
    sfx('pip');
    setTimeout(() => setReacts((r) => { const n = { ...r }; delete n[id]; return n; }), 1700);
  };
  const spawnFloaters = (x, y, set) => {
    const made = (set || [{ t: '💖', dx: -18 }, { t: '💕', dx: 16 }, { t: '⭐', dx: 0 }]).map((o) => ({ id: uid(), x, y, ...o }));
    setFloaters((f) => [...f, ...made]);
    made.forEach((m) => setTimeout(() => setFloaters((f) => f.filter((q) => q.id !== m.id)), 1100));
  };
  const eatSeq = (charId, key, fromItemId) => {
    sfx('chomp');
    let step = 0;
    setEating({ charId, key, step: 0 });
    const iv = setInterval(() => {
      step++;
      if (step >= 4) {
        clearInterval(iv);
        setEating(null);
        if (fromItemId) upd((c) => { const fs = c.buildings[bid].floors[floorRef.current]; fs.items = fs.items.filter((t) => t.id !== fromItemId); });
        const ch = (stRef.current && stRef.current.chars || []).find((x) => x.id === charId);
        if (ch) spawnFloaters(ch.x, ch.y);
        sfx('yum');
        return;
      }
      sfx('chomp');
      setEating({ charId, key, step });
    }, 200);
  };
  const setEvent = (id) => { upd((c) => { c.event = c.event === id ? null : id; }); setEventSheet(false); sfx('sparkle'); };
  const addPreset = (pc) => { upd((c) => { c.chars.push({ ...pc, id: uid(), building: null, x: 50, y: 92 }); }); sfx('pip'); };

  const startConstruction = (plotIdx, id) => {
    setBuildSheet(null);
    setConstructing({ plot: plotIdx, id, phase: 'build' });
    setTimeout(() => { setConstructing((c) => (c ? { ...c, phase: 'done' } : c)); sfx('build'); }, 2050);
    setTimeout(() => {
      upd((c) => { c.plots[plotIdx] = id; c.buildings[id] = freshBuilding(id); });
      setConstructing(null);
    }, 2780);
  };

  // ---- world math ----
  const nRooms = () => BUILDINGS[bid].floors[floorRef.current].rooms.length;
  const worldFromEvent = (e) => {
    const r = vpRef.current.getBoundingClientRect();
    const sceneW = r.width * nRooms();
    const wx = clamp(((e.clientX - r.left - panRef.current) / sceneW) * 100, 1, 99);
    const wy = clamp(((e.clientY - r.top) / r.height) * 100, 5, 98);
    const rIdx = clamp(Math.floor((wx / 100) * nRooms()), 0, nRooms() - 1);
    return { x: wx, y: wy, rIdx, vw: r.width, sceneW };
  };
  const overDock = (e) => { const r = dockRef.current && dockRef.current.getBoundingClientRect(); return r && e.clientY >= r.top; };
  const stairTap = (onGo) => (e) => {
    e.stopPropagation(); e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const upH = (ev) => { window.removeEventListener('pointerup', upH); if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 10) onGo(); };
    window.addEventListener('pointerup', upH);
  };

  // ---- pointer system: pan, drag, tap ----
  const startDrag = (e, payload) => {
    e.preventDefault(); e.stopPropagation();
    if (payload.kind !== 'pan' && mode === 'paint') return;
    dragRef.current = { ...payload, sx: e.clientX, sy: e.clientY, startPan: panRef.current, moved: false, anyMove: false, zd: false };
    setGhost({ x: e.clientX, y: e.clientY });
    setDrag(payload);
    setDragMoved(false);
    if (payload.kind !== 'pan') setSel(null);
    if (payload.kind !== 'pan') {
      const w = worldFromEvent(e);
      setDw({ x: w.x, y: w.y, key: payload.key || null, id: payload.id || null });
    }
  };

  useEffect(() => {
    if (!drag) return;
    const mv = (e) => {
      e.preventDefault();
      const d = dragRef.current; if (!d) return;
      if (!d.anyMove && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 7) d.anyMove = true;
      const trayKind = d.kind === 'new-item' || d.kind === 'new-rare' || d.kind === 'place-char';
      if (!d.moved && (trayKind ? d.sy - e.clientY > 12 : d.anyMove)) { d.moved = true; setDragMoved(true); }
      if (d.kind === 'pan') {
        if (!d.moved) return;
        const r = vpRef.current.getBoundingClientRect();
        const minPan = -(r.width * (nRooms() - 1));
        setPan(clamp(d.startPan + (e.clientX - d.sx), minPan, 0));
        return;
      }
      setGhost({ x: e.clientX, y: e.clientY });
      const w = worldFromEvent(e);
      setDw({ x: w.x, y: w.y, key: d.key || null, id: d.id || null });
      // A surface under the pointer (table/shelf) wins over feeding, so food
      // dropped on a table sets the table instead of feeding a nearby friend.
      const restKey = ((d.kind === 'new-item' || d.kind === 'item') && d.key && canRest(d.key)) ? d.key : null;
      const restSurf = (restKey && d.anyMove) ? findSurface(w.x, w.y, d.kind === 'item' ? d.id : null) : null;
      if (restSurf && d.feedId) { d.feedId = null; setFeed(null); }
      const foodKey = (!restSurf && (d.kind === 'new-item' || d.kind === 'item') && ITEMS[d.key] && ITEMS[d.key].food) ? d.key : null;
      if (foodKey && d.anyMove && !d.fed) {
        const r = vpRef.current.getBoundingClientRect();
        const sceneW = r.width * nRooms();
        const chs = ((stRef.current && stRef.current.chars) || []).filter((ch) => ch.building === bid);
        let hit = null, best = 72;
        for (const ch of chs) {
          const sx = r.left + panRef.current + (ch.x / 100) * sceneW;
          const sy = r.top + (ch.y / 100) * r.height - 142;
          const dist = Math.hypot(e.clientX - sx, e.clientY - sy);
          if (dist < best) { best = dist; hit = ch.id; }
        }
        if (hit) {
          if (d.feedId !== hit) { d.feedId = hit; d.feedAt = performance.now(); setFeed({ charId: hit }); }
          else if (performance.now() - d.feedAt > 420) {
            d.fed = true;
            const fromItemId = d.kind === 'item' ? d.id : null;
            dragRef.current = null; setDrag(null); setGhost(null); setDw(null); setDragMoved(false); setFeed(null); setDockOpen(false);
            eatSeq(hit, foodKey, fromItemId);
            return;
          }
        } else if (d.feedId) { d.feedId = null; setFeed(null); }
      }
      if (restKey && d.anyMove && !d.feedId) {
        d.surf = restSurf;
        setSurfHint(restSurf ? { x: restSurf.x, y: restSurf.y } : null);
      } else if (d.surf) { d.surf = null; setSurfHint(null); }
      if ((d.kind === 'item' || d.kind === 'char') && d.moved) {
        if (d.kind === 'item') {
          setSt((s) => {
            const c = clone(s);
            const arr = c.buildings[bid].floors[floorRef.current].items;
            const i = arr.findIndex((t) => t.id === d.id);
            if (i < 0) return s;
            const it = arr[i]; it.x = w.x; it.y = w.y;
            if (it.on) { it.on = null; it.by = null; }
            if (ITEMS[it.key] && ITEMS[it.key].surf && vpRef.current) {
              const rr = vpRef.current.getBoundingClientRect();
              for (const ch of arr) if (ch.on === it.id) { ch.x = it.x + ch.ox; ch.by = it.y; ch.y = surfTopY(it, rr.height); }
            }
            if (!d.zd) { d.zd = true; arr.splice(i, 1); arr.push(it); }
            return c;
          });
        } else {
          setSt((s) => { const c = clone(s); const ch = c.chars.find((t) => t.id === d.id); if (ch) { ch.x = w.x; ch.y = w.y; if (ch.inTub) delete ch.inTub; } return c; });
        }
      }
      if (d.kind === 'container' && d.moved) {
        setSt((s) => { const c = clone(s); const fs = c.buildings[bid].floors[floorRef.current]; fs.cpos = { ...(fs.cpos || {}) }; fs.cpos[d.id] = { x: w.x, y: clamp(w.y, BAND.floor[0], BAND.floor[1]) }; return c; });
      }
    };
    const up = (e) => {
      const d = dragRef.current;
      dragRef.current = null; setDrag(null); setGhost(null); setDw(null); setDragMoved(false);
      if (!d) return;
      const w = vpRef.current ? worldFromEvent(e) : { x: 50, y: 92, rIdx: 0 };
      const tr = trashRef.current && trashRef.current.getBoundingClientRect();
      const inT = tr && e.clientX >= tr.left - 14 && e.clientX <= tr.right + 14 && e.clientY >= tr.top - 14 && e.clientY <= tr.bottom + 14;
      if (d.kind === 'pan') {
        if (!d.moved) {
          if (mode === 'paint' && brush) paintRoom(w.rIdx);
          else { setSel(null); setDockOpen(false); }
        }
        return;
      }
      if (d.kind === 'item') {
        if (inT) { removeItem(d.id); return; }
        if (!d.moved) {
          if (ITEMS[d.key] && ITEMS[d.key].interactive) { toggleLit(d.id); return; }
          setSel((s) => (s && s.t === 'item' && s.id === d.id ? null : { t: 'item', id: d.id }));
          return;
        }
        if (d.surf) {
          const sf = d.surf;
          upd((c) => { const it = c.buildings[bid].floors[floorRef.current].items.find((t) => t.id === d.id); if (it) { it.x = sf.x; it.y = sf.y; it.on = sf.id; it.ox = sf.x - sf.sx; it.by = sf.baseY; } });
          setSurfHint(null); sfx('pop');
        } else {
          const landY = zoneClamp(d.key, w.y);
          upd((c) => {
            const fs = c.buildings[bid].floors[floorRef.current];
            const it = fs.items.find((t) => t.id === d.id);
            if (it) {
              it.y = zoneClamp(it.key, it.y); it.on = null; it.by = null;
              if (ITEMS[it.key] && ITEMS[it.key].surf && vpRef.current) {
                const rr = vpRef.current.getBoundingClientRect();
                for (const ch of fs.items) if (ch.on === it.id) { ch.x = it.x + ch.ox; ch.by = it.y; ch.y = surfTopY(it, rr.height); }
              }
            }
          });
          if (isFloor(d.key)) setTimeout(() => puffAt(w.x, landY), 230);
        }
      } else if (d.kind === 'char') {
        if (inT) { stowChar(d.id); return; }
        if (!d.moved) {
          setSel((s) => {
            const same = s && s.t === 'char' && s.id === d.id;
            if (!same) reactChar(d.id);
            return same ? null : { t: 'char', id: d.id };
          });
          return;
        }
        settleChar(d.id, w.x, w.y);
      } else if (d.kind === 'container') {
        if (!d.moved) toggleContainer(d.id, e);
        return;
      } else if (d.kind === 'new-item' || d.kind === 'new-rare') {
        if (e.type === 'pointercancel') return;
        const fn = d.kind === 'new-item' ? addItem : addRare;
        if (!d.anyMove) {
          const r = vpRef.current ? vpRef.current.getBoundingClientRect() : null;
          const cx = r ? clamp(((-panRef.current + r.width / 2) / (r.width * nRooms())) * 100, 2, 98) : 50;
          fn(d.key, cx, 90); setDockOpen(false);
        } else if (d.moved && !overDock(e)) {
          if (d.surf && d.kind === 'new-item') addItemOn(d.key, d.surf);
          else if (d.surf && d.kind === 'new-rare') addRareOn(d.key, d.surf);
          else fn(d.key, w.x, w.y);
          setSurfHint(null); setDockOpen(false);
        }
      } else if (d.kind === 'place-char') {
        if (e.type === 'pointercancel') return;
        if (!d.anyMove) openEditor(d.id);
        else if (d.moved && !overDock(e)) { placeChar(d.id, w.x, w.y); setDockOpen(false); }
      }
    };
    window.addEventListener('pointermove', mv, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [drag, bid, mode, brush]);

  if (!st) {
    return (
      <div className="w-full grid place-items-center" style={{ height: '100dvh', background: 'linear-gradient(#2A1F52,#181428)' }}>
        <div className="text-5xl" style={{ animation: 'ttbob .7s ease-in-out infinite alternate' }}>🏠</div>
        <style>{'@keyframes ttbob{from{transform:translateY(0)}to{transform:translateY(-10px)}}'}</style>
      </div>
    );
  }

  const bdef = BUILDINGS[bid];
  const fdef = bdef.floors[curFloor] || bdef.floors[0];
  const b = st.buildings[bid].floors[curFloor] || st.buildings[bid].floors[0];
  const n = fdef.rooms.length;
  const placedChars = st.chars.filter((c) => c.building === bid && (c.floor || 0) === curFloor);
  const night = !!(st && st.night);
  const looted = b.looted || {};
  const copen = b.copen || {};
  const cpos = b.cpos || {};
  const packTotal = Object.values(st.backpack).reduce((a, v) => a + v, 0);
  const vpW = vpRef.current ? vpRef.current.getBoundingClientRect().width : 1;
  const vpH = vpRef.current ? vpRef.current.getBoundingClientRect().height : 1;
  const curRoom = clamp(Math.round(-pan / vpW), 0, n - 1);

  let chip = null;
  if (sel && view === 'building') {
    if (sel.t === 'item') {
      const it = b.items.find((t) => t.id === sel.id);
      if (it) { const d = ITEMS[it.key]; chip = { x: it.x, y: it.y, h: d.s * (d.r || 1), t: 'item', id: it.id, key: it.key }; }
    } else {
      const ch = placedChars.find((c) => c.id === sel.id);
      if (ch) chip = { x: ch.x, y: ch.y, h: 188, t: 'char', id: ch.id };
    }
  }

  const goTab = (id) => {
    setSel(null);
    if (id === 'map') { setBrush(null); setView('map'); setMode('map'); setDockOpen(false); return; }
    setView('building'); setMode(id);
  };

  const dropShadow = dw && drag && drag.kind !== 'pan' && (() => {
    if (surfHint) return null;
    const key = dw.key || (dw.id && drag.kind === 'item' && (b.items.find((t) => t.id === dw.id) || {}).key) || null;
    const isChar = drag.kind === 'char' || drag.kind === 'place-char';
    const zone = isChar ? 'floor' : key ? ITEMS[key].zone : 'floor';
    if (zone !== 'floor') return null;
    const landY = isChar ? clamp(dw.y, CHAR_BAND[0], CHAR_BAND[1]) : zoneClamp(key, dw.y);
    const wdt = isChar ? 90 : (ITEMS[key] ? ITEMS[key].s * 0.7 : 60);
    return { x: dw.x, y: landY, w: wdt };
  })();

  return (
    <div className="tt-root flex flex-col overflow-hidden relative" style={{ height: '100dvh', width: '100%', background: 'linear-gradient(#2A1F52 0%,#211A40 55%,#181428 100%)' }}>
      <style>{`
        .tt-root{font-family:'Fredoka','Baloo 2','Comic Sans MS',ui-rounded,system-ui,sans-serif;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;}
        .no-sb::-webkit-scrollbar{display:none}.no-sb{scrollbar-width:none}
        @keyframes ttbob{from{transform:translateY(0)}to{transform:translateY(-6px)}}
        @keyframes ttpop{from{scale:.5;opacity:0}to{scale:1;opacity:1}}
        @keyframes tttwinkle{0%,100%{opacity:.35;transform:translateY(0) scale(.9)}50%{opacity:1;transform:translateY(-6px) scale(1.15)}}
        @keyframes ttglow{0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(.92)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}}
        @keyframes ttfloatbob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}
        @keyframes ttrelaxsteam{0%{opacity:0;transform:translate(-50%,6px) scale(.6)}25%{opacity:.85}100%{opacity:0;transform:translate(-50%,-28px) scale(1.15)}}
        @keyframes ttpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
        @keyframes ttwiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
        @keyframes ttfloat{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-170%) scale(1.15)}}
        @keyframes ttflrUp{from{transform:translateY(46px);opacity:.25}to{transform:translateY(0);opacity:1}}
        @keyframes ttflrDown{from{transform:translateY(-46px);opacity:.25}to{transform:translateY(0);opacity:1}}
        .ttpuff{position:absolute;left:0;top:0;border-radius:50%;background:radial-gradient(circle at 38% 35%, #F6EFDD, #DCCBA4 68%, rgba(220,203,164,0) 72%);transform:translate(-50%,-50%) scale(.35);animation:ttpuffgo .62s ease-out forwards;pointer-events:none}
        @keyframes ttpuffgo{0%{transform:translate(-50%,-50%) scale(.35);opacity:.95}100%{transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.25);opacity:0}}
        @keyframes ttrise{from{transform:translateY(102%)}to{transform:translateY(0)}}
        @keyframes tthammer{from{transform:rotate(-22deg)}to{transform:rotate(16deg)}}
        @keyframes ttbuilt{0%{transform:scale(.75)}55%{transform:scale(1.12)}100%{transform:scale(1)}}
        @keyframes ttdrift{from{transform:translateX(-18vw)}to{transform:translateX(112vw)}}
        @media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {view === 'map' ? (
        <div className="absolute inset-0 overflow-hidden" onContextMenu={(e) => e.preventDefault()} style={{ background: 'linear-gradient(#1A1638 0%, #2A1F52 45%, #3A2A66 100%)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.16) 5px, transparent 6px), radial-gradient(rgba(64,128,52,.12) 7px, transparent 8px)', backgroundSize: '92px 92px, 140px 140px', backgroundPosition: '0 0, 46px 64px' }} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 180" preserveAspectRatio="none">
            <path d="M28 36 C 58 38, 82 44, 72 54 C 62 66, 37 64, 27 76 C 17 88, 63 85, 73 97 C 83 109, 38 107, 28 119 C 18 131, 58 132, 70 140" stroke="#4A3F8C" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M28 36 C 58 38, 82 44, 72 54 C 62 66, 37 64, 27 76 C 17 88, 63 85, 73 97 C 83 109, 38 107, 28 119 C 18 131, 58 132, 70 140" stroke="#FFFFFF" strokeWidth="1.4" strokeDasharray="3 4" fill="none" opacity=".75" />
          </svg>
          <div className="absolute" style={{ left: '82%', top: '8%', transform: 'translate(-50%,-50%)' }}>
            <div style={{ width: 86, height: 50, borderRadius: '50%', background: '#7EC8E3', border: '5px solid #6CB9D6', boxShadow: 'inset 0 6px 0 rgba(255,255,255,.35)' }} />
            <span className="absolute" style={{ left: 28, top: 8, fontSize: 20 }}>🦆</span>
          </div>
          <span className="absolute" style={{ top: '3%', left: 0, fontSize: 42, opacity: .95, animation: 'ttdrift 64s linear infinite' }}>☁️</span>
          <span className="absolute" style={{ top: '10%', left: 0, fontSize: 30, opacity: .8, animation: 'ttdrift 88s linear -30s infinite' }}>☁️</span>
          {[['🌳', 8, 28, 46], ['🌳', 90, 44, 44], ['🌲', 8, 56, 44], ['🌳', 90, 70, 46], ['🌲', 12, 88, 42], ['🌳', 88, 86, 40], ['🌼', 50, 38, 24], ['🌷', 47, 62, 24], ['🌻', 52, 84, 26], ['🍄', 14, 70, 22]].map(([e, x, y, fs], i) => (
            <span key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', fontSize: fs, filter: 'drop-shadow(0 4px 3px rgba(40,80,30,.25))' }}>{e}</span>
          ))}
          {MAP_SPOTS.map((sp, si) => {
            const bId = sp.core || st.plots[sp.plot];
            const isConstr = constructing && sp.core === undefined && constructing.plot === sp.plot;
            if (isConstr) {
              const Ext = EXT[constructing.id];
              const done = constructing.phase === 'done';
              return (
                <div key={si} className="absolute flex flex-col items-center" style={{ left: `${sp.x}%`, top: `${sp.y}%`, transform: 'translate(-50%,-100%)', zIndex: 20 }}>
                  <div style={{ overflow: 'hidden', paddingTop: 6 }}>
                    <div style={{ animation: done ? 'ttbuilt .5s ease' : 'ttrise 2s cubic-bezier(.25,.9,.3,1) forwards' }}>
                      <Ext size={104} />
                    </div>
                  </div>
                  {!done && (
                    <span className="absolute" style={{ left: -28, bottom: 6, fontSize: 26, animation: 'tthammer .3s ease-in-out infinite alternate' }}>🔨</span>
                  )}
                  {!done && (
                    <span className="absolute" style={{ right: -28, bottom: 12, fontSize: 24, animation: 'tthammer .36s ease-in-out -0.18s infinite alternate-reverse' }}>🪚</span>
                  )}
                  {[[-36, -6, 0], [36, -6, 0.15], [-17, -17, 0.3], [19, -15, 0.08], [0, -9, 0.22]].map(([dx, dy, dl], i) => (
                    <div key={i} className="ttpuff" style={{ left: '50%', top: 'auto', bottom: -4, width: 30, height: 30, '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${dl}s`, animationIterationCount: done ? 1 : 4 }} />
                  ))}
                  {done && <span className="absolute" style={{ top: -20, fontSize: 26, animation: 'ttpop .4s ease' }}>🎉</span>}
                </div>
              );
            }
            if (bId) {
              const Ext = EXT[bId];
              const cfg = BUILDINGS[bId];
              const cnt = st.chars.filter((c) => c.building === bId).length;
              return (
                <button key={si} onClick={() => !constructing && enterBuilding(bId)} className="absolute flex flex-col items-center active:scale-95" style={{ left: `${sp.x}%`, top: `${sp.y}%`, transform: 'translate(-50%,-100%)', zIndex: 10 }}>
                  <div className="absolute" style={{ bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 92, height: 18, borderRadius: '50%', background: 'radial-gradient(rgba(40,80,30,.32),transparent 70%)' }} />
                  <Ext size={104} />
                  <div className="rounded-full px-2.5 py-1 text-[10px] font-bold shadow mt-1" style={{ background: 'rgba(36,27,70,0.88)', color: '#ECE7FA' }}>{cfg.e} {cfg.n}{cnt > 0 ? ` · ${cnt}🙂` : ''}</div>
                </button>
              );
            }
            return (
              <button key={si} onClick={() => !constructing && setBuildSheet(sp.plot)} className="absolute flex flex-col items-center active:scale-95" style={{ left: `${sp.x}%`, top: `${sp.y}%`, transform: 'translate(-50%,-100%)', zIndex: 10 }}>
                <div className="grid place-items-center" style={{ width: 96, height: 74, borderRadius: 18, border: '3px dashed rgba(255,255,255,.85)', background: 'rgba(255,255,255,.2)' }}>
                  <div className="w-10 h-10 rounded-full grid place-items-center shadow" style={{ background: 'rgba(36,27,70,0.88)', color: '#ECE7FA', animation: 'ttbob 1.6s ease-in-out infinite alternate' }}><Plus size={20} /></div>
                </div>
                <div className="rounded-full px-2.5 py-1 text-[10px] font-bold shadow mt-1" style={{ background: 'rgba(36,27,70,0.88)', color: '#ECE7FA' }}>Build here</div>
              </button>
            );
          })}
          {st.event && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: EVENTS[st.event].wash, zIndex: 1 }} />
          )}
          <button onClick={() => setEventSheet(true)} className="absolute active:scale-95" style={{ right: 16, bottom: 'max(16px, env(safe-area-inset-bottom))', height: 52, borderRadius: 26, padding: '0 16px', gap: 8, background: st.event ? EVENTS[st.event].accent : '#A24BFF', color: '#fff', boxShadow: '0 10px 26px rgba(60,40,20,.4)', display: 'flex', alignItems: 'center', zIndex: 30 }}>
            <span style={{ fontSize: 20 }}>{st.event ? EVENTS[st.event].e : '🎉'}</span>
            <span className="text-xs font-bold">{st.event ? 'Event on' : 'Events'}</span>
          </button>
          {eventSheet && (
            <div className="fixed inset-0" style={{ zIndex: 3000, background: 'rgba(60,40,30,.45)' }} onClick={() => setEventSheet(false)}>
              <div onClick={(e) => e.stopPropagation()} className="absolute inset-x-0 bottom-0 rounded-t-3xl p-4 pb-6" style={{ background: '#241B3C' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold" style={{ color: '#ECE7FA' }}>🎉 Events</div>
                  <button onClick={() => setEventSheet(false)} className="rounded-full p-2 active:scale-90" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}><X size={16} /></button>
                </div>
                <p className="text-[11px] mb-2" style={{ color: '#9D95C0' }}>Turn one on for special items &amp; friends — find them in the <b>+</b> menu inside a building.</p>
                {Object.entries(EVENTS).map(([id, ev]) => {
                  const on = st.event === id;
                  return (
                    <button key={id} onClick={() => setEvent(id)} className="w-full flex items-center gap-3 rounded-2xl p-2.5 mb-2 active:scale-95" style={{ background: on ? ev.accent : '#241B3C', color: on ? '#fff' : '#A24BFF', border: `2px solid ${ev.accent}` }}>
                      <span style={{ fontSize: 34 }}>{ev.e}</span>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-bold text-sm">{ev.n}</div>
                        <div className="text-[11px]" style={{ color: on ? 'rgba(255,255,255,.88)' : '#9D95C0' }}>{ev.blurb}</div>
                      </div>
                      <span className="text-xs font-bold shrink-0">{on ? 'On ✓' : 'Turn on'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {buildSheet !== null && (
            <div className="fixed inset-0" style={{ zIndex: 3000, background: 'rgba(60,40,30,.45)' }} onClick={() => setBuildSheet(null)}>
              <div onClick={(e) => e.stopPropagation()} className="absolute inset-x-0 bottom-0 rounded-t-3xl p-4 pb-6" style={{ background: '#241B3C' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold" style={{ color: '#ECE7FA' }}>🏗️ Build something new!</div>
                  <button onClick={() => setBuildSheet(null)} className="rounded-full p-2 active:scale-90" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}><X size={16} /></button>
                </div>
                {BUILDABLE_IDS.filter((id) => !st.plots.includes(id)).length === 0 ? (
                  <p className="text-sm font-semibold py-4 text-center" style={{ color: '#9D95C0' }}>You've built everything! 🎉</p>
                ) : BUILDABLE_IDS.filter((id) => !st.plots.includes(id)).map((id) => {
                  const Ext = EXT[id]; const cfg = BUILDINGS[id];
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-2xl p-2.5 mb-2" style={{ background: '#241B3C' }}>
                      <div className="shrink-0 grid place-items-center" style={{ width: 64 }}><Ext size={60} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm" style={{ color: '#ECE7FA' }}>{cfg.e} {cfg.n}</div>
                        <div className="text-[11px] font-medium" style={{ color: '#9D95C0' }}>{bRooms(id)} rooms · ✨ {bSecrets(id)} secrets</div>
                      </div>
                      <button onClick={() => startConstruction(buildSheet, id)} className="rounded-2xl px-4 py-2.5 text-xs font-bold active:scale-95" style={{ background: '#A24BFF', color: '#FFF' }}>Build</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div ref={vpRef} className="absolute inset-0 overflow-hidden" style={{ touchAction: 'none' }}
          onPointerDown={(e) => startDrag(e, { kind: 'pan' })} onContextMenu={(e) => e.preventDefault()}>
          {/* the scene: n rooms wide, swipe to pan */}
          <div key={curFloor} className="absolute inset-0" style={{ animation: `${floorDir > 0 ? 'ttflrUp' : 'ttflrDown'} .42s cubic-bezier(.25,.9,.3,1)` }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${n * 100}%`, transform: `translateX(${pan}px)` }}>
            {/* room slices */}
            {fdef.rooms.map((rdef, i) => {
              const rs = b.rooms[i] || {};
              return (
                <div key={i} className="absolute top-0 bottom-0 overflow-hidden" style={{ left: `${(i * 100) / n}%`, width: `${100 / n}%`, ...wallS(rs.w) }}>
                  <div className="absolute inset-x-0 top-0" style={{ height: 22, background: 'rgba(255,255,255,.5)', boxShadow: '0 3px 0 rgba(0,0,0,.05)' }} />
                  <div className="absolute inset-x-0" style={{ top: 0, bottom: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(0,0,0,0) 28%, rgba(0,0,0,.07))' }} />
                  <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: '40%', ...floorS(rs.f) }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,6,22,.5), rgba(8,6,22,.12) 32%, rgba(255,255,255,0) 58%, rgba(255,255,255,.10))' }} />
                    <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {[7, 25, 43, 57, 75, 93].map((bx, k) => (
                        <line key={k} x1={bx} y1="100" x2={50 + (bx - 50) * 0.2} y2="2" stroke="rgba(0,0,0,.24)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                      ))}
                      {[16, 36, 60, 84].map((ly, k) => (
                        <line key={'h' + k} x1="0" y1={ly} x2="100" y2={ly} stroke="rgba(0,0,0,.16)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      ))}
                    </svg>
                  </div>
                  <div className="absolute inset-x-0" style={{ bottom: '40%', height: 9, background: 'rgba(0,0,0,.24)', boxShadow: '0 8px 14px rgba(0,0,0,.24)' }} />
                  <div className="absolute inset-x-0" style={{ bottom: '40%', height: 2, background: '#2FE6F6', opacity: 0.5, boxShadow: '0 0 10px 1px rgba(47,230,246,.7)' }} />
                  {rdef.win && (
                    <div className="absolute" style={{ left: '50%', top: '11%', transform: 'translateX(-50%)', width: 128, height: 116, borderRadius: 16, border: '9px solid #8A623F', background: 'linear-gradient(#9ED5FF,#DFF3FF)', boxShadow: '0 6px 14px rgba(60,40,20,.18)' }}>
                      <div className="absolute inset-y-0" style={{ left: '50%', width: 7, marginLeft: -3.5, background: '#8A623F' }} />
                      <div className="absolute inset-x-0" style={{ top: '50%', height: 7, marginTop: -3.5, background: '#8A623F' }} />
                      <div className="absolute" style={{ left: 18, top: 12, width: 26, height: 26, borderRadius: '50%', background: '#2E2059', opacity: .85 }} />
                      <div className="absolute" style={{ left: -14, right: -14, bottom: -16, height: 12, borderRadius: 6, background: '#8A623F' }} />
                    </div>
                  )}
                  {/* ceiling light */}
                  <div className="absolute" style={{ left: rdef.win ? '16%' : '50%', top: 24, transform: 'translateX(-50%)' }}>
                    <div style={{ width: 3, height: 30, background: '#7A6A58', margin: '0 auto' }} />
                    <div style={{ width: 48, height: 27, borderRadius: '50% 50% 9px 9px', background: '#F2C14E', boxShadow: 'inset 0 -5px 0 rgba(0,0,0,.12)' }} />
                    <div style={{ width: 70, height: 34, margin: '-4px auto 0', borderRadius: '50%', background: 'radial-gradient(rgba(255,224,138,.55),transparent 70%)' }} />
                  </div>
                </div>
              );
            })}
            {/* interior walls with doorways */}
            {Array.from({ length: n - 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0" style={{ left: `${((i + 1) * 100) / n}%`, width: 0 }}>
                <div className="absolute top-0 bottom-0" style={{ left: -11, width: 22, background: bdef.frame, boxShadow: '0 0 10px rgba(60,40,20,.2)' }} />
                <div className="absolute" style={{ left: -39, width: 78, bottom: '20%', height: '44%', borderRadius: '40px 40px 0 0', background: '#5E4434', border: '7px solid #8A623F', borderBottom: 'none' }}>
                  <div className="absolute" style={{ right: 10, top: '46%', width: 9, height: 9, borderRadius: '50%', background: '#F2C14E' }} />
                </div>
              </div>
            ))}

            {/* stairs between floors */}
            {[curFloor < bdef.floors.length - 1 ? { dir: 'up', x: 95, go: () => changeFloor(curFloor + 1) } : null,
              curFloor > 0 ? { dir: 'down', x: 5, go: () => changeFloor(curFloor - 1) } : null].filter(Boolean).map((stp) => (
              <div key={stp.dir} className="absolute" style={{ left: `${stp.x}%`, top: '96%', transform: 'translate(-50%,-100%)', zIndex: 938, touchAction: 'none', cursor: 'pointer' }} onPointerDown={stairTap(stp.go)}>
                <div className="absolute" style={{ left: '50%', bottom: -6, transform: 'translateX(-50%)', width: 100, height: 16, borderRadius: '50%', background: 'radial-gradient(rgba(60,40,30,.25),transparent 70%)' }} />
                <StairsSVG size={128} dir={stp.dir} />
                <div className="absolute flex flex-col items-center" style={{ left: '50%', top: -34, transform: 'translateX(-50%)', gap: 2 }}>
                  <span style={{ fontSize: 22, lineHeight: 1, animation: 'ttbob 1.2s ease-in-out infinite alternate' }}>{stp.dir === 'up' ? '⬆️' : '⬇️'}</span>
                  <span className="text-[10px] font-bold rounded-full px-2 py-0.5 shadow whitespace-nowrap" style={{ background: 'rgba(36,27,70,0.86)', color: '#ECE7FA' }}>{stp.dir === 'up' ? 'Upstairs' : 'Downstairs'}</span>
                </div>
              </div>
            ))}

            {/* landing spot (gravity preview) */}
            {dropShadow && (
              <div className="absolute pointer-events-none" style={{ left: `${dropShadow.x}%`, top: `${dropShadow.y}%`, transform: 'translate(-50%,-50%)', width: dropShadow.w, height: dropShadow.w * 0.22, borderRadius: '50%', background: 'radial-gradient(rgba(60,40,30,.35),transparent 70%)', zIndex: 5 }} />
            )}
            {surfHint && (
              <div className="absolute pointer-events-none" style={{ left: `${surfHint.x}%`, top: `${surfHint.y}%`, transform: 'translate(-50%,-50%)', width: 64, height: 17, borderRadius: '50%', background: 'radial-gradient(rgba(77,150,255,.55),rgba(77,150,255,0) 72%)', boxShadow: '0 0 0 2px rgba(77,150,255,.45)', zIndex: 980 }} />
            )}

            {/* secret containers — movable; tap to open/close, drag to move */}
            {fdef.containers.map((cn) => {
              const cd = CONTAINER_DEFS[cn.t];
              const ci = CIMG[cn.t];
              const open = !!copen[cn.id];
              const pos = cpos[cn.id] || { x: cn.x, y: 96 };
              const gotLoot = !!looted[cn.id];
              const isDragC = drag && drag.kind === 'container' && drag.id === cn.id;
              const imgSrc = ci ? (open ? ci.o : ci.c) : null;
              const imgW = ci ? (open ? ci.ow : ci.cw) : 0;
              const baseW = (ci && ci.cw) ? ci.cw : cd.s;
              return (
                <div key={cn.id} className="absolute" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-100%)', zIndex: Math.round(pos.y * 10) + 1, touchAction: 'none', cursor: 'grab', transition: isDragC ? 'none' : 'top .35s cubic-bezier(.34,1.56,.64,1)' }}
                  onPointerDown={(e) => startDrag(e, { kind: 'container', id: cn.id, t: cn.t })}>
                  <div className="absolute" style={{ left: '50%', bottom: -7, transform: 'translateX(-50%)', width: baseW * 0.8, height: baseW * 0.16, borderRadius: '50%', background: 'radial-gradient(rgba(60,40,30,.28),transparent 70%)' }} />
                  {imgSrc ? <img src={imgSrc} draggable="false" style={{ width: imgW, height: 'auto', display: 'block', pointerEvents: 'none' }} /> : <cd.C size={cd.s} open={open} />}
                  {!open && !gotLoot && <div className="absolute text-xl" style={{ top: -26, left: '50%', transform: 'translateX(-50%)', animation: 'tttwinkle 1.6s ease-in-out infinite', pointerEvents: 'none' }}>✨</div>}
                </div>
              );
            })}

            {/* placed items (z-order by depth) */}
            {b.items.map((it) => {
              const def = ITEMS[it.key]; if (!def) return null;
              const isSel = sel && sel.t === 'item' && sel.id === it.id;
              const isDrag = drag && drag.kind === 'item' && drag.id === it.id;
              const Fc = def.svg ? FURN[def.svg] : null;
              const lit = !!(it.lit && def.interactive);
              const src = (lit && def.interactive.onImg && IMG[def.interactive.onImg]) ? IMG[def.interactive.onImg] : IMG[it.key];
              const onItem = it.on ? b.items.find((t) => t.id === it.on) : null;
              const floating = !!(onItem && ITEMS[onItem.key] && ITEMS[onItem.key].tub);
              return (
                <div key={it.id}
                  onPointerDown={(e) => startDrag(e, { kind: 'item', id: it.id, key: it.key })}
                  style={{
                    position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
                    transform: `translate(-50%,-100%)${it.flip ? ' scaleX(-1)' : ''}`,
                    zIndex: itemZ(it.key, it.by != null ? it.by : it.y, it.on), touchAction: 'none', cursor: 'grab',
                    transition: isDrag ? 'none' : 'top .35s cubic-bezier(.34,1.56,.64,1)',
                    filter: isSel ? 'drop-shadow(0 0 8px #4D96FF)' : 'none',
                    animation: 'ttpop .22s ease',
                  }}>
                  {def.zone === 'floor' && !['Rug', 'RingRug'].includes(def.svg) && !it.on && (
                    <div style={{ position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%)', width: def.s * 0.72, height: def.s * 0.15, borderRadius: '50%', background: 'radial-gradient(rgba(60,40,30,.25),transparent 70%)' }} />
                  )}
                  {lit && def.interactive.glow && (
                    <div className="absolute pointer-events-none" style={{ left: '50%', top: '42%', transform: 'translate(-50%,-50%)', width: def.s * 1.5, height: def.s * 1.5, borderRadius: '50%', background: `radial-gradient(circle, ${def.interactive.glow}cc, ${def.interactive.glow}00 70%)`, mixBlendMode: 'screen', animation: 'ttglow 2.2s ease-in-out infinite' }} />
                  )}
                  <div style={floating ? { animation: 'ttfloatbob 2.8s ease-in-out infinite' } : undefined}>
                    {src ? <img src={src} draggable="false" style={{ width: def.s, height: 'auto', display: 'block', pointerEvents: 'none' }} /> : Fc ? <Fc size={def.s} v={it.v || 0} /> : <span style={{ fontSize: def.s, lineHeight: 1, display: 'block', filter: 'drop-shadow(0 3px 2px rgba(0,0,0,.15))' }}>{def.e}</span>}
                  </div>
                </div>
              );
            })}

            {/* characters */}
            {placedChars.map((c, i) => {
              const isDrag = drag && drag.kind === 'char' && drag.id === c.id;
              const isSel = sel && sel.t === 'char' && sel.id === c.id;
              const waving = !!reacts[c.id];
              const eatingThis = eating && eating.charId === c.id;
              const tubItem = (c.inTub && !isDrag) ? b.items.find((t) => t.id === c.inTub && ITEMS[t.key] && ITEMS[t.key].tub) : null;
              if (tubItem) {
                const cs = 121, chestFrac = 0.56;
                const HcPct = (cs * CHAR_BASE_ASPECT) / vpH * 100;
                const waterY = surfTopY(tubItem, vpH);
                const cyTub = waterY + (1 - chestFrac) * HcPct;
                const clipB = Math.round((1 - chestFrac) * 100);
                return (
                  <div key={c.id} onPointerDown={(e) => startDrag(e, { kind: 'char', id: c.id })}
                    style={{ position: 'absolute', left: `${tubItem.x}%`, top: `${cyTub}%`, transform: 'translate(-50%,-100%)', zIndex: Math.round(tubItem.y * 10) + 6, touchAction: 'none', cursor: 'grab' }}>
                    <span className="absolute pointer-events-none" style={{ left: '56%', top: '2%', transform: 'translate(-50%,0)', fontSize: 22, zIndex: 2, animation: 'ttrelaxsteam 2.8s ease-in-out infinite' }}>♨️</span>
                    <span className="absolute pointer-events-none" style={{ left: '42%', top: '7%', transform: 'translate(-50%,0)', fontSize: 16, zIndex: 2, animation: 'ttrelaxsteam 3.6s ease-in-out 1s infinite' }}>♨️</span>
                    {waving && (
                      <div className="absolute" style={{ left: '50%', top: -2, transform: 'translate(-50%,-100%)', zIndex: 8, animation: 'ttpop .25s ease' }}>
                        <div style={{ background: '#2E2059', color: '#ECE7FA', fontWeight: 700, fontSize: 13, padding: '6px 12px', borderRadius: 16, boxShadow: '0 6px 14px rgba(60,40,20,.22)', whiteSpace: 'nowrap' }}>{reacts[c.id]}</div>
                        <div style={{ width: 0, height: 0, margin: '0 auto', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #2E2059' }} />
                      </div>
                    )}
                    <div style={{ animation: `ttbob 3s ease-in-out ${i * 0.3}s infinite alternate`, clipPath: `inset(0 0 ${clipB}% 0)`, WebkitClipPath: `inset(0 0 ${clipB}% 0)`, filter: isSel ? 'drop-shadow(0 0 8px #4D96FF)' : 'none' }}>
                      <CharSprite c={c} size={cs} />
                    </div>
                  </div>
                );
              }
              return (
                <div key={c.id} onPointerDown={(e) => startDrag(e, { kind: 'char', id: c.id })}
                  style={{ position: 'absolute', left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-100%)', zIndex: Math.round(c.y * 10) + 5, touchAction: 'none', cursor: 'grab', transition: isDrag ? 'none' : 'top .35s cubic-bezier(.34,1.56,.64,1)' }}>
                  <div style={{ position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%)', width: 60, height: 14, borderRadius: '50%', background: 'radial-gradient(rgba(60,40,30,.28),transparent 70%)' }} />
                  {waving && (
                    <div className="absolute" style={{ left: '50%', top: -6, transform: 'translate(-50%,-100%)', zIndex: 8, animation: 'ttpop .25s ease' }}>
                      <div style={{ background: '#2E2059', color: '#ECE7FA', fontWeight: 700, fontSize: 13, padding: '6px 12px', borderRadius: 16, boxShadow: '0 6px 14px rgba(60,40,20,.22)', whiteSpace: 'nowrap' }}>{reacts[c.id]}</div>
                      <div style={{ width: 0, height: 0, margin: '0 auto', borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '8px solid #2E2059' }} />
                    </div>
                  )}
                  <div style={{ animation: isDrag ? 'none' : (waving ? 'ttwiggle .4s ease-in-out 3' : `ttbob 2.4s ease-in-out ${i * 0.35}s infinite alternate`), transform: isDrag ? 'scale(1.1) rotate(3deg)' : 'none', filter: isSel ? 'drop-shadow(0 0 8px #4D96FF)' : 'none' }}>
                    <CharSprite c={c} size={132} />
                  </div>
                  {eatingThis && (
                    <span className="absolute" style={{ left: '50%', top: 64, transform: `translate(-50%,-50%) scale(${Math.max(0.18, 1 - eating.step * 0.24)})`, fontSize: 36, zIndex: 7, pointerEvents: 'none', transition: 'transform .15s ease' }}>{IMG[eating.key] ? <img src={IMG[eating.key]} style={{ width: 46, height: 'auto', display: 'block' }} /> : ITEMS[eating.key].e}</span>
                  )}
                </div>
              );
            })}

            {/* dust puffs */}
            {puffs.map((p) => (
              <div key={p.id} className="absolute pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: Math.round(p.y * 10) + 30 }}>
                {[[-26, -8, 0], [26, -8, 0.05], [-11, -22, 0.1], [13, -19, 0.14]].map(([dx, dy, dl], i) => (
                  <div key={i} className="ttpuff" style={{ width: p.big ? 32 : 21, height: p.big ? 32 : 21, '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${dl}s` }} />
                ))}
              </div>
            ))}

            {/* hearts + yum floaters */}
            {floaters.map((f) => (
              <span key={f.id} className="absolute pointer-events-none" style={{ left: `calc(${f.x}% + ${f.dx}px)`, top: `${f.y - 12}%`, transform: 'translate(-50%,-50%)', fontSize: 26, zIndex: 1200, animation: 'ttfloat 1.05s ease-out forwards' }}>{f.t}</span>
            ))}

            {/* selection actions */}
            {chip && (
              <div onPointerDown={(e) => e.stopPropagation()} className="absolute flex gap-1.5"
                style={{ left: `${chip.x}%`, top: `calc(${chip.y}% - ${chip.h + 10}px)`, transform: 'translate(-50%,-100%)', zIndex: 1900 }}>
                {chip.t === 'item' ? (
                  <>
                    {VARIANTS[chip.key] && <button onClick={() => cycleVar(chip.id)} className="w-10 h-10 rounded-full grid place-items-center shadow-lg active:scale-90" style={{ background: '#A24BFF', color: '#ECE7FA' }}><Shuffle size={17} /></button>}
                    <button onClick={() => flipItem(chip.id)} className="w-10 h-10 rounded-full grid place-items-center shadow-lg active:scale-90" style={{ background: '#2E2059', color: '#ECE7FA' }}><FlipHorizontal2 size={17} /></button>
                    <button onClick={() => removeItem(chip.id)} className="w-10 h-10 rounded-full grid place-items-center shadow-lg active:scale-90" style={{ background: '#FF6B6B', color: '#FFF' }}><Trash2 size={17} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { openEditor(chip.id); setSel(null); }} className="w-10 h-10 rounded-full grid place-items-center shadow-lg active:scale-90" style={{ background: '#2E2059', color: '#ECE7FA' }}><Pencil size={17} /></button>
                    <button onClick={() => stowChar(chip.id)} className="w-10 h-10 rounded-full grid place-items-center shadow-lg active:scale-90" style={{ background: '#2E2059', color: '#ECE7FA' }}><Users size={17} /></button>
                  </>
                )}
              </div>
            )}
          </div>
          </div>

          {night && (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1400, background: 'linear-gradient(180deg, rgba(16,18,52,.6), rgba(28,20,66,.5) 55%, rgba(34,24,74,.34))' }}>
              <div className="absolute" style={{ right: 26, top: 26, fontSize: 42, filter: 'drop-shadow(0 0 12px rgba(255,240,180,.65))' }}>🌙</div>
              {[[10, 22], [20, 46], [31, 16], [43, 34], [55, 20], [64, 50], [74, 28], [85, 40], [15, 70], [38, 60], [50, 78], [82, 66]].map(([x, y], i) => (
                <span key={i} className="absolute" style={{ left: `${x}%`, top: `${y}px`, fontSize: 11, color: '#FFFFFF', opacity: 0.85, animation: `tttwinkle ${1.5 + i * 0.12}s ease-in-out infinite` }}>✦</span>
              ))}
            </div>
          )}

          {mode === 'paint' && brush && (
            <div className="absolute left-1/2 flex items-center gap-2 rounded-full pl-2 pr-1.5 py-1.5 shadow-lg" style={{ top: 64, transform: 'translateX(-50%)', zIndex: 60, background: 'rgba(36,27,70,0.86)' }} onPointerDown={(e) => e.stopPropagation()}>
              <span className="w-6 h-6 rounded-full shrink-0" style={{ border: '2px solid rgba(0,0,0,.12)', ...(brush.t === 'wall' ? wallS(brush.id) : floorS(brush.id)) }} />
              <span className="text-xs font-bold" style={{ color: '#ECE7FA' }}>Tap rooms to paint</span>
              <button onClick={() => setBrush(null)} className="w-7 h-7 rounded-full grid place-items-center active:scale-90" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}><X size={13} /></button>
            </div>
          )}
        </div>
      )}

      {/* floating top bar */}
      <div className="absolute top-0 inset-x-0 flex items-start gap-2 px-3 pt-3 pointer-events-none" style={{ zIndex: 2000 }}>
        {view === 'building' ? (
          <button onClick={() => goTab('map')} className="pointer-events-auto flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 text-xs font-bold shadow-lg active:scale-95" style={{ background: 'rgba(36,27,70,0.86)', color: '#ECE7FA' }}>
            <ChevronLeft size={15} /> Map
          </button>
        ) : <div style={{ width: 64 }} />}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="rounded-full px-4 py-1.5 font-bold text-sm shadow-lg truncate" style={{ background: 'rgba(36,27,70,0.86)', color: '#ECE7FA', maxWidth: '70vw' }}>
            {view === 'map' ? '🌈 Tiny Town' : `${bdef.e} ${fdef.rooms[curRoom].name}`}
          </div>
          {st.event && (
            <div className="rounded-full px-3 py-1 text-[11px] font-bold shadow" style={{ background: EVENTS[st.event].accent, color: '#fff' }}>{EVENTS[st.event].banner}</div>
          )}
          {view === 'building' && n > 1 && (
            <div className="flex gap-1.5 rounded-full px-2.5 py-1.5 shadow" style={{ background: 'rgba(36,27,70,0.7)' }}>
              {fdef.rooms.map((_, i) => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === curRoom ? '#A24BFF' : 'rgba(255,255,255,0.25)' }} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold" style={{ color: '#6FE7B7', textShadow: '0 1px 0 #fff' }}>{saveStat}</span>
          {view === 'building' && (
            <button onClick={() => upd((c) => { c.night = !c.night; })} className="pointer-events-auto rounded-full shadow-lg active:scale-95 grid place-items-center" style={{ background: 'rgba(36,27,70,0.86)', width: 34, height: 34 }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{night ? '☀️' : '🌙'}</span>
            </button>
          )}
          <button onClick={() => { setShowSettings(true); setResetArm(false); }} className="pointer-events-auto rounded-full p-2 shadow-lg active:scale-95" style={{ background: 'rgba(36,27,70,0.86)', color: '#ECE7FA' }}>
            <Settings size={16} />
          </button>
        </div>
      </div>

      {view === 'building' && bdef.floors.length > 1 && (
        <div className="absolute left-2 pointer-events-auto flex flex-col items-center gap-1 rounded-3xl p-1.5 shadow-lg" style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 2000, background: 'rgba(36,27,70,0.9)' }}>
          <button disabled={curFloor >= bdef.floors.length - 1} onClick={() => changeFloor(curFloor + 1)} className="rounded-full grid place-items-center active:scale-90" style={{ width: 42, height: 42, background: curFloor >= bdef.floors.length - 1 ? 'rgba(255,255,255,0.06)' : '#A24BFF', color: '#fff', opacity: curFloor >= bdef.floors.length - 1 ? 0.45 : 1 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>⬆️</span>
          </button>
          <div className="text-[10px] font-bold text-center leading-tight" style={{ color: '#ECE7FA', width: 56 }}>{fdef.name}</div>
          <button disabled={curFloor <= 0} onClick={() => changeFloor(curFloor - 1)} className="rounded-full grid place-items-center active:scale-90" style={{ width: 42, height: 42, background: curFloor <= 0 ? 'rgba(255,255,255,0.06)' : '#A24BFF', color: '#fff', opacity: curFloor <= 0 ? 0.45 : 1 }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>⬇️</span>
          </button>
        </div>
      )}

      {/* trash while dragging placed things */}
      {drag && (drag.kind === 'item' || drag.kind === 'char') && (
        <div ref={trashRef} className="absolute left-1/2" style={{ top: 56, transform: 'translateX(-50%)', zIndex: 2100 }}>
          <div className="w-14 h-14 rounded-full grid place-items-center shadow-xl" style={{ background: '#FF6B6B', outline: '4px solid #FFFFFFAA' }}>
            <Trash2 color="#fff" size={22} />
          </div>
        </div>
      )}

      {/* ghost for things coming from the tray */}
      {drag && ghost && (drag.kind === 'new-item' || drag.kind === 'new-rare' || drag.kind === 'place-char') && (
        <div className="fixed pointer-events-none" style={{ left: ghost.x, top: ghost.y, transform: 'translate(-50%,-70%)', zIndex: 2200 }}>
          {drag.kind === 'place-char'
            ? (() => { const ch = st.chars.find((c) => c.id === drag.id); return ch ? <CharSprite c={ch} size={87} style={{ filter: 'drop-shadow(0 5px 5px rgba(0,0,0,.25))' }} /> : null; })()
            : (() => { const def = ITEMS[drag.key]; const Fc = def.svg ? FURN[def.svg] : null; return IMG[drag.key] ? <img src={IMG[drag.key]} style={{ width: def.s * 0.7, height: 'auto', display: 'block', filter: 'drop-shadow(0 5px 5px rgba(0,0,0,.25))' }} /> : Fc ? <div style={{ filter: 'drop-shadow(0 5px 5px rgba(0,0,0,.25))' }}><Fc size={def.s * 0.7} /></div> : <span style={{ fontSize: 52, filter: 'drop-shadow(0 5px 5px rgba(0,0,0,.25))' }}>{def.e}</span>; })()}
        </div>
      )}

      {/* loot flying to your pack */}
      {fly && (
        <div className="fixed pointer-events-none" style={{ left: fly.go ? (typeof window !== 'undefined' ? window.innerWidth - 46 : 330) : fly.x, top: fly.go ? (typeof window !== 'undefined' ? window.innerHeight - 42 : 600) : fly.y, transform: fly.go ? 'translate(-50%,-50%) scale(.5)' : 'translate(-50%,-50%) scale(1.25)', transition: 'all .72s cubic-bezier(.45,-.25,.35,1)', zIndex: 2300 }}>
          <span style={{ fontSize: 54, filter: 'drop-shadow(0 0 12px #FFE08A)' }}>{fly.e}</span>
        </div>
      )}

      {/* floating + button and pop-out tool panel */}
      {view === 'building' && (
      <div ref={dockRef} className="absolute inset-x-0 bottom-0 px-2 pointer-events-none"
        style={{ zIndex: 2050, paddingBottom: 'max(10px, env(safe-area-inset-bottom))', transform: drag && drag.kind !== 'pan' && dragMoved ? 'translateY(130%)' : 'translateY(0)', transition: 'transform .22s ease' }}>
        <div className="rounded-3xl shadow-2xl mx-auto overflow-hidden" style={{ background: 'rgba(26,20,48,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', maxWidth: 560, marginBottom: 68, transformOrigin: '88% 118%', transform: dockOpen ? 'scale(1) translateY(0)' : 'scale(.06) translateY(46px)', opacity: dockOpen ? 1 : 0, pointerEvents: dockOpen ? 'auto' : 'none', transition: 'transform .32s cubic-bezier(.34,1.56,.64,1), opacity .18s ease' }}>
            <div className="px-3 pt-3">
              {mode === 'items' && (
                <div>
                  {packTotal > 0 && (
                    <div className="mb-1">
                      <div className="text-[11px] font-bold mb-1.5 flex items-center gap-1" style={{ color: '#FFE6BE' }}>
                        <Backpack size={13} /> My finds · drag into the room
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-sb pb-2">
                        {Object.entries(st.backpack).map(([k, cnt]) => (
                          <button key={k} onPointerDown={(e) => startDrag(e, { kind: 'new-rare', key: k })}
                            className="relative shrink-0 w-14 h-14 rounded-2xl grid place-items-center active:scale-90"
                            style={{ background: 'rgba(255,180,143,0.16)', border: '2px solid #F2C14E', touchAction: 'pan-x', animation: packPulse ? 'ttpulse .6s ease' : 'none' }}>
                            {IMG[k] ? <img src={IMG[k]} style={{ maxWidth: 40, maxHeight: 40, display: 'block' }} /> : <span style={{ fontSize: 30, lineHeight: 1 }}>{ITEMS[k].e}</span>}
                            <span className="absolute -top-1.5 -right-1.5 text-[10px] font-bold rounded-full h-5 grid place-items-center px-1.5" style={{ background: '#F2745F', color: '#FFF', minWidth: 20 }}>{cnt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-1.5 overflow-x-auto no-sb pb-2">
                    {(st.event ? [{ id: 'event', n: EVENTS[st.event].n, e: EVENTS[st.event].e }, ...CATS] : CATS).map((c) => (
                      <button key={c.id} onClick={() => setCat(c.id)} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold active:scale-95"
                        style={{ background: cat === c.id ? '#A24BFF' : 'rgba(255,255,255,0.08)', color: cat === c.id ? '#FFF' : '#A24BFF' }}>
                        {c.e} {c.n}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-sb pb-3">
                    {Object.entries(ITEMS).filter(([, d]) => (cat === 'event' ? d.ev === st.event : d.c === cat)).map(([k, d]) => {
                      const Fc = d.svg ? FURN[d.svg] : null;
                      return (
                        <button key={k} onPointerDown={(e) => startDrag(e, { kind: 'new-item', key: k })}
                          className="shrink-0 w-14 h-14 rounded-2xl grid place-items-center active:scale-90"
                          style={{ background: 'rgba(255,255,255,0.06)', touchAction: 'pan-x', overflow: 'hidden' }}>
                          {IMG[k] ? <img src={IMG[k]} style={{ maxWidth: 46, maxHeight: 46, display: 'block' }} /> : Fc ? <Fc size={(d.r || 1) > 1 ? 36 / d.r : 40} /> : <span style={{ fontSize: 28, lineHeight: 1 }}>{d.e}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {mode === 'people' && (
                <div>
                  <div className="text-[11px] font-bold mb-1.5" style={{ color: '#9D95C0' }}>Drag a friend into the room · tap to edit</div>
                  <div className="flex gap-2 overflow-x-auto no-sb pb-3">
                    <button onClick={() => setCreator({ ...randomChar(), id: null })}
                      className="shrink-0 w-20 rounded-2xl grid place-items-center active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.08)', height: 96, color: '#ECE7FA' }}>
                      <div className="flex flex-col items-center gap-1">
                        <Plus size={22} />
                        <span className="text-[10px] font-bold">New</span>
                      </div>
                    </button>
                    {st.chars.map((c) => (
                      <div key={c.id} onPointerDown={(e) => startDrag(e, { kind: 'place-char', id: c.id })}
                        className="shrink-0 w-20 rounded-2xl flex flex-col items-center justify-end pb-1 relative active:scale-95"
                        style={{ background: c.building ? 'rgba(111,231,183,0.16)' : 'rgba(255,255,255,0.06)', height: 96, touchAction: 'pan-x', cursor: 'grab', overflow: 'hidden' }}>
                        <CharSprite c={c} size={55} />
                        <span className="text-[10px] font-bold truncate w-full text-center px-1" style={{ color: '#ECE7FA' }}>{c.name}</span>
                        {c.building && <span className="absolute top-1 right-1 text-[10px]">{BUILDINGS[c.building].e}</span>}
                      </div>
                    ))}
                  </div>
                  {st.event && (
                    <div className="mt-1">
                      <div className="text-[11px] font-bold mb-1.5" style={{ color: EVENTS[st.event].accent }}>{EVENTS[st.event].e} {EVENTS[st.event].n} friends · tap to add</div>
                      <div className="flex gap-2 overflow-x-auto no-sb pb-3">
                        {EVENTS[st.event].chars.map((pc, idx) => (
                          <button key={idx} onClick={() => addPreset(pc)} className="shrink-0 w-20 rounded-2xl flex flex-col items-center justify-end pb-1 active:scale-95" style={{ background: 'rgba(255,111,181,0.14)', border: `2px solid ${EVENTS[st.event].accent}`, height: 96, overflow: 'hidden' }}>
                            <CharSprite c={pc} size={55} />
                            <span className="text-[10px] font-bold truncate w-full text-center px-1" style={{ color: '#ECE7FA' }}>{pc.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {mode === 'paint' && (
                <div className="pb-3">
                  <div className="text-[11px] font-bold mb-1.5" style={{ color: '#9D95C0' }}>Pick a swatch, then tap a room</div>
                  <div className="flex items-center gap-2 overflow-x-auto no-sb pb-2">
                    <span className="text-[10px] font-bold shrink-0" style={{ color: '#9D95C0', width: 38 }}>Walls</span>
                    {WALLS.map((w) => (
                      <Sw key={w.id} active={!!(brush && brush.t === 'wall' && brush.id === w.id)} onClick={() => { setBrush({ t: 'wall', id: w.id }); setDockOpen(false); }} style={w.s} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-sb">
                    <span className="text-[10px] font-bold shrink-0" style={{ color: '#9D95C0', width: 38 }}>Floors</span>
                    {FLOORS.map((f) => (
                      <Sw key={f.id} active={!!(brush && brush.t === 'floor' && brush.id === f.id)} onClick={() => { setBrush({ t: 'floor', id: f.id }); setDockOpen(false); }} style={f.s} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          <div className="flex justify-around items-stretch px-2 py-1.5">
            {[{ id: 'items', I: Sofa, n: 'Stuff' }, { id: 'people', I: Users, n: 'People' }, { id: 'paint', I: Paintbrush, n: 'Paint' }].map((t) => {
              const active = mode === t.id;
              return (
                <button key={t.id} onClick={() => goTab(t.id)} className="flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 active:scale-95"
                  style={{ background: active ? 'rgba(162,75,255,0.24)' : 'transparent', color: '#ECE7FA' }}>
                  <t.I size={19} strokeWidth={2.4} />
                  <span className="text-[10px] font-bold">{t.n}</span>
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={() => setDockOpen((o) => !o)} className="pointer-events-auto absolute grid place-items-center active:scale-90"
          style={{ right: 16, bottom: 'max(10px, env(safe-area-inset-bottom))', width: 58, height: 58, borderRadius: '50%', background: '#A24BFF', color: '#FFFFFF', boxShadow: '0 10px 26px rgba(60,40,20,.4)', transform: dockOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform .25s ease', animation: packPulse && !dockOpen ? 'ttpulse .6s ease 2' : 'none' }}>
          <Plus size={30} strokeWidth={2.6} />
        </button>
        {packPulse && !dockOpen && (
          <div className="pointer-events-none absolute text-xs font-bold rounded-full px-2.5 py-1 shadow-lg" style={{ right: 14, bottom: 80, background: 'rgba(255,180,143,0.16)', color: '#FFE6BE', animation: 'ttpop .3s ease' }}>🎒 +1</div>
        )}
      </div>
      )}

      {/* friend creator */}
      {creator && (
        <div className="fixed inset-0 grid place-items-center p-4" style={{ zIndex: 3000, background: 'rgba(60,40,30,.45)' }} onClick={() => setCreator(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full rounded-3xl p-4 overflow-y-auto no-sb" style={{ background: '#241B3C', maxWidth: 420, maxHeight: '88dvh' }}>
            <div className="flex items-center justify-between">
              <div className="font-bold" style={{ color: '#ECE7FA' }}>{creator.id ? 'Edit friend' : 'New friend'}</div>
              <button onClick={() => setCreator(null)} className="rounded-full p-2 active:scale-90" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}><X size={16} /></button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="rounded-2xl grid place-items-center shrink-0" style={{ background: 'rgba(162,75,255,0.24)', width: 128, height: 176, overflow: 'hidden' }}>
                <CharSprite c={creator} size={116} />
              </div>
              <div className="flex-1 min-w-0">
                <input value={creator.name} onChange={(e) => setCreator({ ...creator, name: e.target.value })} maxLength={14} placeholder="Name"
                  className="w-full rounded-2xl px-3 py-2.5 font-bold outline-none" style={{ background: '#2E2059', border: '2px solid rgba(255,255,255,0.18)', color: '#ECE7FA' }} />
                <button onClick={() => setCreator({ ...randomChar(), id: creator.id, name: creator.name })}
                  className="mt-2 w-full rounded-2xl px-3 py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}>
                  <Shuffle size={15} /> Surprise me
                </button>
              </div>
            </div>
            {CHAR_KEYS.base.length > 1 && wRow('Skin', 'base', 'skinKey', false)}
            {wRow('Hair', 'hair', 'hairKey')}
            {CHAR_KEYS.hat.length > 0 && wRow('Hat', 'hat', 'hatKey')}
            {wRow('Top', 'top', 'topKey')}
            {wRow('Bottom', 'bottom', 'bottomKey')}
            {wRow('Shoes', 'shoes', 'shoesKey')}
            <div className="flex gap-2 mt-4">
              {creator.id && (
                <button onClick={() => deleteChar(creator.id)} className="rounded-2xl px-4 py-3 active:scale-95" style={{ background: 'rgba(255,90,110,0.16)', color: '#FF8FA3' }}>
                  <Trash2 size={16} />
                </button>
              )}
              <button onClick={saveChar} className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold active:scale-95" style={{ background: '#A24BFF', color: '#FFF' }}>
                {creator.id ? 'Save friend' : 'Add friend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* settings */}
      {showSettings && (
        <div className="fixed inset-0 grid place-items-center p-4" style={{ zIndex: 3000, background: 'rgba(60,40,30,.45)' }} onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full rounded-3xl p-4" style={{ background: '#241B3C', maxWidth: 380 }}>
            <div className="flex items-center justify-between">
              <div className="font-bold" style={{ color: '#ECE7FA' }}>Settings</div>
              <button onClick={() => setShowSettings(false)} className="rounded-full p-2 active:scale-90" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}><X size={16} /></button>
            </div>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: '#9D95C0' }}>
              Tiny Town saves by itself. ✨ Sparkly furniture hides treasure. 🍎 Drag a <b>Yummy</b> onto a friend's face to feed them. Tap a friend to make them wave & talk. Tap 🌙 up top for night-time.
            </p>
            <button onClick={() => upd((c) => { c.sound = !(c.sound !== false); })}
              className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between active:scale-95" style={{ background: 'rgba(255,255,255,0.08)', color: '#ECE7FA' }}>
              <span>🔊 Sound</span><span>{(st.sound !== false) ? 'On ✓' : 'Off'}</span>
            </button>
            <button onClick={() => { if (!resetArm) { setResetArm(true); return; } resetWorld(); }}
              className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold active:scale-95"
              style={{ background: resetArm ? '#FF8FA3' : 'rgba(255,90,110,0.16)', color: resetArm ? '#FFF' : '#FF8FA3' }}>
              {resetArm ? 'Tap again to erase everything' : 'Reset Tiny Town'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Game;
