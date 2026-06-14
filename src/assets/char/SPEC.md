# Illustrated paper-doll — art & layer spec

How the dress-up character is built. Adding a new outfit (or skin) is **pure
art** — no code changes. The depth order lives in `src/assets/charLayers.js`
(`CHAR_Z`); this file is the art contract that fills it.

## The trick: magenta-skin chroma key

Every asset is an image-model render in **one fixed pose**, on a solid
**`#FF00FF` magenta** background. We key out *all* the magenta, so whatever
survives is a clean, body-conformed, pre-aligned cutout.

- **Base (the "skin"):** the figure with **normal skin + a simple face**, bald,
  in plain underwear. Keying removes only the background → the bare body.
- **Outfit:** the **same figure**, but with **magenta skin and a blank magenta
  head** (no face), fully dressed. Keying removes the background *and the skin*,
  leaving only the **clothing + hair**, already shaped to the body.

Stacking an outfit over the base then gives correct occlusion **for free**: where
clothing exposes skin (neck, hands, the forearm below a short sleeve), that skin
was magenta → keyed to transparent → the base shows through. No rig, no per-limb
slots, no geometry. Each layer is just a full-canvas PNG painted at `inset: 0`.

### Why it must be the same pose
The base and every outfit are separate renders, so they only line up if they
share the **exact pose, proportions, scale, and crop**. Generate each new render
**using the base as the reference/control image**, changing only skin/face and
the clothes. Same `1024 × 1536` frame, centered, identical crop.

## Prompts

**Base (per skin tone):**
```
Use the attached reference figure. Keep the EXACT same character, pose, body
proportions, scale, and framing. Skin: <tan> normal soft-shaded skin. Add a
simple cute face — two big glossy dark eyes, small nose, small smile, rosy
cheeks. Bald, wearing only plain light-grey underwear. Same 3D-ish soft-shaded
chibi render style. Full body, centered, on a solid #FF00FF magenta background.
```

**Outfit (complete look):**
```
Use the attached reference figure. Keep the EXACT same character, pose,
proportions, scale, and framing, arms in the same position. Paint ALL SKIN solid
#FF00FF magenta and make the HEAD a blank magenta blob with NO face. Background:
solid #FF00FF magenta. Dress the figure (each item normal colors):
  • Top:    <a mustard hoodie>
  • Bottom: <blue jeans>
  • Shoes:  <white sneakers>
  • Hair:   <short brown hair, FULL and dense, tufts overlapping with NO gaps,
            fully covering the crown and back — no scalp/background showing>
Same render style as the reference. Full body, identical crop, magenta background.
```

> Keep the head a **blank magenta blob** (hair on top is fine — hair is the one
> head thing we keep). Any face features left on would survive the key.
> Make hair **full/dense** or the background pokes through the tufts (auto-sealed
> in integration, but fuller art is cleaner).

## Integration (what the maintainer runs on a new render)

1. **Key** the magenta: a pixel is background/skin if `R>110 && B>90 && G <
   min(R,B)*0.72`. Everything else is kept.
2. **De-spill** (hue-safe): `m = min(R,B); if (m > G) { R -= m-G; B -= m-G }` —
   removes the magenta fringe without shifting warm colors.
3. **Drop specks:** connected-component the alpha, discard islands `< ~0.3%` of
   the frame (kills stray dark outline bits from hands/feet).
4. **Seal hair gaps:** in the head region, fill transparent pixels that are
   mostly surrounded by opaque hair with the local hair color.
5. Export `webp` (`alphaQuality: 100`) to `src/assets/char/` and register it.

## File naming & registry

```
base_<skin>.webp          e.g. base_tan.webp
outfit_<name>.webp        e.g. outfit_everyday.webp
```

Register in `charLayers.js`:
```
base:   { tan:      { body: { url: u('base_tan') } } }
outfit: { everyday: { full: { url: u('outfit_everyday') } } }
```

## Later: mix-and-match

Complete outfits look best and are the default. To mix tops/bottoms/shoes
independently, render each **item alone** on the magenta figure (same pose) and
add per-category layers to `CHAR_Z` (`bottom → top → shoes → hair`), keyed the
same way. The stack order is the only thing that matters; alignment is inherited
from the shared pose.
