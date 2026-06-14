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
- **Garment:** the **same figure**, but with **magenta skin and a blank magenta
  head** (no face), wearing **one garment** (a top, OR a bottom, OR shoes, OR
  hair). Keying removes the background *and the skin*, leaving only that garment,
  already shaped to the body.

The wardrobe is **mix-and-match**: each garment is its own layer, so stacking
base → bottom → top → shoes → hair lets you swap any one slot independently.
Occlusion is **free** — where a garment exposes skin (neck, hands, midriff, bare
legs), that skin was magenta → keyed to transparent → the base shows through. No
rig, no per-limb slots, no geometry. Each layer is a full-canvas PNG at `inset:0`.

> **One garment per render.** Don't render a full outfit and slice it: garments
> overlap (a shirt over the waistband, hair on the shoulders), so a horizontal
> cut leaks one piece into another and a lower garment's hidden upper half can't
> be recovered. Render the **pants alone** and you get the whole pants.

### Pick a key color the garment doesn't use
Magenta is the default, but a **pink or red** garment is indistinguishable from
the magenta skin/background — the key eats its edges and pink areas (e.g. a pink
t-shirt body vanishes, leaving only its graphic). For any garment with pink/red/
magenta in it, render it on a **green screen instead**: green skin, blank green
head, solid **`#00FF00`** background. Green is far from skin and pink, so it
clips clean. (Conversely, use magenta for a *green* garment.) Integration
auto-detects which screen the render uses (samples the corners) and keys that
color, so either screen drops in the same way.

### Why it must be the same pose
The base and every garment are separate renders, so they only line up if they
share the **exact pose, proportions, scale, and crop**. Generate each new render
**using the base as the reference/control image**, changing only skin/face and
the one garment. Same `1024 × 1536` frame, centered, identical crop. Integration
trims every asset to a shared bounding box so the figure fills the frame.

## Prompts

**Base (per skin tone):**
```
Use the attached reference figure. Keep the EXACT same character, pose, body
proportions, scale, and framing. Skin: <tan> normal soft-shaded skin. Add a
simple cute face — two big glossy dark eyes, small nose, small smile, rosy
cheeks. Bald, wearing only plain light-grey underwear. Same 3D-ish soft-shaded
chibi render style. Full body, centered, on a solid #FF00FF magenta background.
```

**Garment (one item — top / bottom / shoes / hair):**
```
Use the attached reference figure. Keep the EXACT same character, pose,
proportions, scale, and framing, arms in the same position. Paint ALL SKIN solid
#FF00FF magenta and make the HEAD a blank magenta blob with NO face. Background:
solid #FF00FF magenta. Dress the figure in ONLY <one garment>, in normal colors —
everything else is bare (magenta): no other clothing, no shoes, no hair.
  • for a TOP:    <a mustard hoodie>, bare magenta legs/feet, blank magenta head
  • for a BOTTOM: <blue jeans>, bare magenta torso/feet, blank magenta head
  • for SHOES:    <white sneakers>, bare magenta legs, blank magenta head
  • for HAIR:     <short brown hair> in its real color, full & dense (tufts
                  overlapping, no gaps), no clothing
Same render style as the reference. Full body, identical crop, magenta background.
```

> Keep the head a **blank magenta blob** (hair, when it's the garment, is fine).
> Any face features left on would survive the key. Make hair **full/dense** or the
> background pokes through the tufts (auto-sealed in integration, but fuller art
> is cleaner).

## Integration (what the maintainer runs on a new render)

1. **Key** the magenta: a pixel is background/skin if `R>110 && B>90 && G <
   min(R,B)*0.72`. Everything else is kept. **Also respect any existing alpha** —
   some renders export with the background *already transparent* (alpha 0); drop
   those pixels too, or the empty background gets painted opaque (a black blob).
2. **De-spill** (hue-safe): `m = min(R,B); if (m > G) { R -= m-G; B -= m-G }` —
   removes the magenta fringe without shifting warm colors.
3. **Drop specks:** connected-component the alpha, discard islands `< ~0.3%` of
   the frame (kills stray dark outline bits from hands/feet).
4. **Seal hair gaps:** in the head region, fill transparent pixels that are
   mostly surrounded by opaque hair with the local hair color.
5. Export `webp` (`alphaQuality: 100`) to `src/assets/char/` and register it.

## File naming & registry

Assets follow a naming convention so a new garment needs **no wiring**:
```
base_<skin>.webp     hair_<k>.webp     top_<k>.webp
bottom_<k>.webp      shoes_<k>.webp
```

To add a garment (or skin):
1. Drop the trimmed `.webp` in `src/assets/char/`.
2. Add its key to the matching list in `src/data/charKeys.js`
   (`CHAR_HAIR_KEYS` / `CHAR_TOP_KEYS` / `CHAR_BOTTOM_KEYS` / `CHAR_SHOE_KEYS` /
   `CHAR_SKIN_KEYS`).

`charLayers.js` builds the registry from those keys by convention, and it lights
up everywhere — the creator's per-slot pickers, randomised friends, presets.
`charKeys.js` is a plain module (no Vite glob) so the data layer and Node data
check can import it. Depth order is `CHAR_Z` (base → bottom → top → shoes → hair);
a missing/None slot is simply skipped, so a friend can be bald/shirtless/barefoot.
