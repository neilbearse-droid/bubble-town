# Layered paper-doll — art & layer spec

This is the contract every body part and garment piece is drawn against. Follow
it and any new shirt / pants / hair becomes **pure art** — no code or rig
changes. The authoritative depth order lives in `src/assets/charLayers.js`
(`CHAR_Z`); this file documents how to fill it.

## 1. Master canvas & registration

- **One shared canvas for everything.** Every layer — each body part and each
  garment piece — is drawn full-frame on the same canvas and exported with a
  transparent background. The compositor paints purpose-drawn layers at
  `inset: 0` (no offsets), so *alignment is baked into the canvas*. Draw a
  sleeve where the arm actually is and it will line up.
- **Canvas:** `584 × 1024` px (aspect **1.757**, matching `CHAR_BASE_ASPECT`).
  Transparent. Export **WebP**, `alphaQuality: 100` (or PNG, then convert).
- **Draw against the template.** Generate the pose/region guide with
  `node scripts/build-char-template.mjs` and use it as the control image / ref
  so every asset shares the same body pose and proportions.
- A piece contains **only its own pixels**; everything else is transparent. No
  baked drop-shadows onto other parts.

## 2. The rig — depth stack (back → front)

The body is split into parts so clothing wraps per-limb. The per-limb
micro-stacks are what make sleeve and trouser *lengths* work for free:

```
arm :  arm_upper → sleeve_upper → arm_fore → sleeve_fore → hand
leg :  leg_thigh → bottom_thigh → leg_shin → bottom_shin → foot → shoe
head:  hair.back → head → ear → collar → hair.front (bangs)
torso: top.torso_back → torso → top.torso_front
```

So a **short** sleeve only fills `sleeve_upper`; the bare `arm_fore` paints in
front of it. A **long** sleeve also fills `sleeve_fore`, covering the forearm,
with the `hand` always in front of the cuff. Same idea for **shorts** (fill
`bottom_thigh` only) vs **trousers** (`bottom_thigh` + `bottom_shin`).

Full order is `CHAR_Z` in `charLayers.js`. Missing slots are skipped, so the rig
lights up part-by-part as art arrives.

## 3. Base body parts (the "skin")

Drawn once per skin tone. Each is a full-canvas cutout of just that part.

| Slot (`base: …`) | What to draw |
|---|---|
| `head` | head, face, neck (everything above the shoulders, minus ears) |
| `ear_l` / `ear_r` | the two ears (so side-hair can tuck behind them) |
| `torso` | chest + belly + hips |
| `arm_upper_l/r` | shoulder → elbow |
| `arm_fore_l/r` | elbow → wrist |
| `hand_l/r` | the hands |
| `leg_thigh_l/r` | hip → knee |
| `leg_shin_l/r` | knee → ankle |
| `foot_l/r` | bare feet (covered when shoes are worn) |

> Adjacent parts should **overlap by a few px** at the joints so no seam shows
> when nothing is layered between them.

## 4. Garment piece checklist (by type)

Draw only the pieces a garment needs; omit the rest.

| Garment | Pieces (`<cat>: …`) |
|---|---|
| Tank / sleeveless top | `top: torso_front` (+ `torso_back` if open) |
| T-shirt (short sleeve) | `torso_front` + `sleeve_upper_l/r` (+ `collar`) |
| Long-sleeve / jacket | `torso_front` + `sleeve_upper_l/r` + `sleeve_fore_l/r` (+ `collar`, + `torso_back` if open) |
| Shorts | `bottom: thigh_l/r` |
| Trousers | `bottom: thigh_l/r` + `shin_l/r` |
| Shoes | `shoes: l` + `shoes: r` |
| Hair | `hair: back` (length behind head) + `hair: front` (bangs) |
| Accessory | `acc: front` |

An **open** jacket needs `torso_back` (the lining behind the body) so the shirt/
torso shows through the opening; a closed top doesn't.

## 5. File naming

Flat files in `src/assets/char/`, imported by `import.meta.glob`:

```
base_<skin>_<part>.webp      e.g. base_tan_head.webp, base_tan_arm_upper_l.webp
<cat>_<variant>_<part>.webp  e.g. top_puffer_torso_front.webp, bottom_jeans_thigh_l.webp
hair_<variant>_<back|front>.webp
```

Register each file in `charLayers.js` under its category → variant → part. A
purpose-drawn (full-canvas) piece needs **no** `{ w, cx, cy }`; only the legacy
bootstrap pieces carry geometry.

## 6. AI-gen pipeline

Hard rules — these are what make assets drop in cleanly:

- **One part per image.** No sprite sheets. The filename = the part.
- **Real transparency.** Export PNG with a true alpha channel. If the tool can't,
  render on a **flat solid `#FF00FF` magenta** matte (NOT a checkerboard — a
  painted checkerboard reads as opaque art and can't be keyed reliably).
- **Fixed character / seed.** Same skin, face, line weight and shading across
  every part so they read as one character.
- **Draw what the slot says** (see §3) — e.g. `foot` is a **bare foot**, the shoe
  is a separate `shoes` garment.

Steps:

1. Build the template: `node scripts/build-char-template.mjs` → `_template_guide.png`.
2. Generate each part with the guide as the control/reference image. The part may
   fill its own frame (clean + detailed) — it does **not** need to be tiny-in-a-
   big-canvas. Placement is handled for you in step 4.
3. Background per the rules above (alpha or magenta); nothing but the one part.
4. Hand the files back. Integration: key the matte → straight alpha, then
   composite each part into its **canvas slot** (the labelled region boxes in
   `scripts/build-char-template.mjs`), export `webp` (`alphaQuality 100`) to
   `src/assets/char/`, and add the registry entry. Slot placement is
   deterministic, so independently-drawn parts still land in register.

### Prompt skeletons

- **Base part (per skin):** "<part name> of a chibi toddler, warm tan skin, bald,
  big glossy brown eyes (head only), plain light-grey briefs (torso only), flat
  soft-shaded kawaii cartoon, thick clean dark outline, front view, ONLY the
  <part> and nothing else, solid #FF00FF magenta background."
- **Garment piece:** "<garment>, the <part> only (e.g. left upper sleeve), sized
  to the reference body, same line weight/shading, ONLY that piece, solid
  #FF00FF magenta background." Always name the single part so the model doesn't
  draw a whole outfit.

## 7. Bootstrap state (today)

The current art is **placeholder**, sliced from the original flat illustration:
`base_tan` (whole figure → `torso` slot) + `base_tan_hands`, the `puffer` (open
jacket back/front), and the `bob` hair (back/front). These carry geometry and
will be replaced by purpose-drawn, full-canvas parts following §1–§5.
