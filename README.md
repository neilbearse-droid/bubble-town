# Tiny Town

A cozy, Toca Boca-style paper-doll sandbox. Decorate multi-room buildings, dress
up friends in the character creator, feed them snacks, crack open sparkly
containers for hidden treasure, paint walls and floors, and throw themed events.

Everything is touch-first, autosaves to `localStorage`, and runs entirely in the
browser — no backend.

## Tech stack

- **React 18** + **Vite 5** (production build, no in-browser Babel)
- **Tailwind CSS 3** via PostCSS (JIT)
- Hand-drawn **SVG** characters/furniture plus **WebP** sprite assets

## Develop

```bash
npm install
npm run dev      # start the dev server (HMR) at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the built dist/ locally
```

The build emits a static `dist/` you can host anywhere (the Vite `base` is
relative, so it works from a subpath or a domain root).

## Project layout

```
index.html              # Vite entry; loads /src/main.jsx and the Fredoka font
src/
  main.jsx              # React root
  App.jsx               # error boundary + app shell
  Game.jsx              # the game (state, drag/drop, world rendering, UI)
  index.css             # Tailwind directives + base styles
  lib/
    utils.js            # uid/clamp/clone/rand/shade + save keys
    storage.js          # localStorage-backed async key/value store
    sound.js            # WebAudio sound kit (no audio assets)
  data/
    items.js            # furniture/prop catalog, palettes, walls & floors
    buildings.js        # building layouts, world map, default/save state
    events.js           # themed events (popstar / mermaid / space)
  components/
    icons.jsx           # emoji-backed icon set
    charsvg.jsx         # layered chibi character renderer + creator controls
    furniture.jsx       # SVG furniture components + FURN registry
    containers.jsx      # treasure containers + defs
    exteriors.jsx       # building exteriors + stairs
  assets/
    images.js           # sprite registry (filename -> hashed URL via import.meta.glob)
    items/*.webp        # item sprites
    containers/*.webp   # container sprites (closed/open)
```

## Notes on assets

Sprites live as individual `.webp` files under `src/assets/`. Vite emits them as
separate, content-hashed, cacheable files and `src/assets/images.js` maps each
filename to its final URL at build time — so the JS bundle stays small instead of
carrying megabytes of inline base64.
