# Bubble Town — FUTURE POP Art Bible

The single source of truth for how everything in Bubble Town looks: characters,
rooms, props, furniture, UI, pets, decor. Inspired by the warmth of Toca-Boca-style
life-sims **without copying them** — our own lane is **Future Pop**: playful
futuristic, cozy, neon-arcade-bedroom, pastel cyberpop, kid-safe.

This doc blends two things:
1. **Aesthetic** — the look (Future Pop).
2. **Engine rules** — the hard technical constraints that make a render actually
   line up in the game (canvas shape, the standable floor line, day/night). These
   are baked into the prompt templates so you can't forget them.

---

## 0. Engine constraints (read first — non-negotiable)

Backdrops are drawn with `object-fit: cover`, and characters/furniture are placed
by the engine on top. If the canvas shape or ground line is off, art either gets
cropped or characters float. Keep these exact:

| Asset | Canvas | Aspect | The ground line |
|---|---|---|---|
| **Room interior** | 1024 × 1536 | **2:3 portrait** | bottom ~34% is floor |
| **Yard / balcony exterior** | 1448 × 1086 | **4:3 landscape** (= two rooms wide) | bottom ~34% is ground |
| **Character layer** | 875 × 1331 | fixed pose, full-frame | feet near bottom |

**The 66% rule (the most important one):**
The flat, *walkable* ground — grass, deck, floor — must **start at 66% of the way
down from the top** and run to the bottom edge. The bottom ~34% is the "standable
strip" where the engine drops live characters and furniture.

- Upper two-thirds (0–66%) = backdrop only: sky, walls, windows, fence, railing,
  neon signs, far scenery.
- Ground may *texture* higher than 66% as scenery, but the **walkable** ground may
  never start lower than 66% or characters at the back will hover.
- **Keep the standable strip clear** — no characters and no large foreground props
  in it; the engine fills that space. Small flush-to-edge decor (a rug edge, base
  of a fence) is fine.
- Camera looks **slightly down** at the ground so the near edge sits at the very
  bottom (98%) and the far edge of flat ground sits at 66%.

**Day / night:** deliver every scene as **two complete images**. The night version
is a *fully finished* night scene (its own moon, stars, glow) — the game does **not**
add a moon overlay on top of a supplied night image. Night = same composition,
same ground line, swapped to cozy-dark lighting.

---

## 1. The Art Bible (concise)

**Core vibe:** neon arcade bedroom meets soft sci-fi. Cool-kid stylish but warm,
cozy, and readable for children. More "cool" than basic cartoon, never gritty.

**Visual language**
- Soft rounded geometry; no sharp or aggressive shapes.
- **Thick, clean outlines** with a slightly uneven, hand-drawn charm.
- Smooth vector-like fills with a **light painterly texture** (not flat, not glossy 3D).
- **Bright neon accents balanced against soft pastels.** Neon is a highlight, not the whole frame.
- Cozy, motivated lighting (lamp glow, screen glow, sign glow). Dark used sparingly.
- Everything reads as **touchable, toy-like, collectible**.

**Palette** (locked to the game's existing accents where noted)

| Role | Name | Hex |
|---|---|---|
| Base | Deep indigo | `#1E1B4B` |
| Base | Midnight purple | `#2A1A4A` |
| Base | Soft charcoal | `#2B2A33` |
| Base | Lavender grey | `#B9B4CC` |
| Accent | **Neon violet** *(in-game `#A24BFF`)* | `#A24BFF` |
| Accent | **Electric cyan** *(in-game glow `#2FE6F6`)* | `#2FE6F6` |
| Accent | **Bubblegum pink** *(in-game `#F15BB5`)* | `#F15BB5` |
| Accent | Mint | `#7BE0C2` |
| Accent | Soft blue | `#7FB6EE` |
| Accent | Warm peach | `#FFC9A3` |

Rule of thumb: **one dominant accent per asset**, pastels for the bulk, neon for the
"pop" detail (a sign, a screen, a trim, a hair streak).

**Hard nos:** no Toca Boca copies, no copyrighted characters, no weapons/violence,
no scary robots or dystopia, not too anime, not too realistic, not too cyberpunk,
not toddler-ish, not generic glossy 3D, no adult fashion styling.

---

## 2. Character design rules

- **Chibi proportions:** big head, small body (~head = 1/3 of height), friendly silhouette.
- **Large expressive eyes**, simple small nose, small mouth. Rounded everything.
- Expressions: cute, mischievous, confident, curious, warm — never angry/scary.
- **Diverse** skin tones, hair types, body shapes, styles by default.
- **Fashion:** oversized hoodies, bomber jackets, cargo pants, sneakers, headphones,
  caps, mini backpacks, graphic tees. One neon detail per outfit (drawstring, trim, logo).
- **Hair:** pastel streaks, space buns, blunt bobs, soft curls, ponytails, undercuts;
  playful color accents.
- **Production note (paper-doll):** characters are built as stacked full-frame layers
  keyed off a **fixed front-facing pose** (magenta background → transparent). Each
  garment is rendered on that exact pose so layers align at inset 0. Keep the pose,
  framing, and lighting identical across every clothing/hair render.

---

## 3. Prop & furniture rules

- Exaggerated, **toy-like proportions**; rounded corners; clear single-read silhouette.
- Looks **collectible** — like you could pick it up. Light painterly shading, soft contact shadow.
- One neon accent max per prop; the rest pastel/base.
- **Signature props:** neon wall signs, floating shelves, star windows, arcade machines,
  gaming chairs, blob-shaped rugs, capsule beds, soft glowing lamps, cute robots,
  holographic stickers, plush alien pets, console controllers, music gear, modular
  futuristic furniture, posters, plants, friendly personal clutter.
- **For placement:** props that the engine drops on the floor are drawn **separately**
  (transparent background, feet/base at the bottom of the frame). Props baked into a
  room backdrop must sit *above* the 66% line (on walls/shelves) so they don't collide
  with live, draggable furniture.

---

## 4. Room / environment rules

Design: bedrooms, play spaces, arcades, tiny apartments, cafes, classrooms, rooftop
hangouts, music studios, space-themed rooms. Plus exteriors: yards (ground floor) and
balconies/rooftops (upper floors).

**Always obey §0:**
- Interior = 2:3 portrait, exterior = 4:3 landscape.
- **Walkable ground starts at 66% down**, bottom ~34% kept clear for live placement.
- Upper two-thirds carries the personality: neon sign, star window, shelves, posters,
  city/space skyline beyond a railing.
- Cozy motivated lighting; dark backgrounds balanced with glow.
- Deliver **day + complete night** versions, identical composition and ground line.
- Keep a consistent slight downward camera so floors read as walkable, not as a wall.

---

## 5. UI style rules

- **Rounded buttons**, generous radius; pill shapes.
- **Neon highlight states** (violet/cyan/pink glow on press/active).
- **Sticker-like icons** that feel like **collectible badges** — soft gradients, thick
  outline, small specular pop.
- Soft gradients over flat fills; friendly readable labels; **minimal text**.
- Match in-game accents: `#A24BFF`, `#2FE6F6`, `#F15BB5`.

---

## 6. Reusable image-generation prompt template

Fill the `[brackets]`. Pick the right block for what you're making.

### A. Scene (room / yard / balcony)
> **Future Pop** kids'-game [room type / yard / balcony], cozy playful-futuristic
> pastel-cyberpop style. Chibi-friendly, toy-like, thick clean hand-drawn outlines,
> smooth vector fills with light painterly texture, soft rounded geometry. Palette:
> deep indigo / midnight purple base, soft pastels, ONE neon-accent pop in
> [neon violet `#A24BFF` / electric cyan `#2FE6F6` / bubblegum pink `#F15BB5`]. Cozy
> motivated lighting, glow from [lamp/sign/screen]. Feature [2–3 signature props].
> **Composition: [2:3 portrait, 1024×1536 for a room | 4:3 landscape, 1448×1086 for
> an exterior]. The flat walkable ground (floor/grass/deck) begins at 66% down from
> the top — the lower third — and runs to the bottom edge; keep that bottom strip
> clear of characters and large foreground props. Upper two-thirds is backdrop. Camera
> angled slightly down so the near floor edge is at the very bottom.** No people in
> frame. [Day: bright, sunny | Night: complete night scene with its own moon/stars and
> cozy dark glow — same composition and ground line.] Kid-safe, warm, no realism, no
> gritty cyberpunk.

### B. Character (paper-doll, fixed pose)
> **Future Pop** chibi kid character, front-facing T-pose-neutral standing pose, big
> head / small body, large expressive eyes, tiny nose, warm [expression]. Wearing
> [outfit], [hair] with a pastel streak, optional [accessory]. Thick clean outlines,
> pastel + one neon accent, soft painterly shading. **Solid flat magenta `#FF00FF`
> background, full body in frame, feet near the bottom, identical framing every time.**
> Kid-safe, friendly, no weapons.

### C. Prop / furniture (placeable)
> **Future Pop** [item], toy-like collectible look, exaggerated rounded proportions,
> thick clean outline, pastel body with one neon accent, soft contact shadow.
> **Transparent background, single object centered, base/feet flush to bottom of
> frame.** Kid-safe, no realism.

### D. UI icon
> **Future Pop** sticker-badge icon of [subject], rounded, thick outline, soft
> gradient, small specular highlight, neon `#A24BFF/#2FE6F6/#F15BB5` accent, collectible
> look. **Transparent background, centered, square.**

---

## 7. Ten sample prompts

**Characters (paper-doll, magenta bg, fixed pose):**

1. Future Pop chibi kid, front-facing neutral standing pose, big head/small body, large
   expressive curious eyes, warm brown skin, **space-bun hair with mint streaks**,
   oversized lavender hoodie with cyan drawstrings, cargo pants, chunky sneakers, mini
   backpack. Thick outlines, pastel + cyan neon pop, soft painterly shading. Solid flat
   magenta `#FF00FF` background, full body, feet near bottom, identical framing. Kid-safe.

2. Future Pop chibi kid, front-facing neutral pose, big head/small body, large confident
   eyes, deep skin tone, **blunt bob with bubblegum-pink tips**, pink bomber jacket over a
   graphic tee, joggers, high-tops, headphones around neck. Thick outlines, pastel + pink
   neon pop. Solid magenta `#FF00FF` background, full body, feet near bottom. Kid-safe.

3. Future Pop chibi kid, front-facing neutral pose, big head/small body, large mischievous
   eyes, fair skin, **soft curls with violet accents under a cap**, oversized graphic tee,
   cargo shorts, sneakers, small sling bag. Thick outlines, pastel + violet neon pop.
   Solid magenta `#FF00FF` background, full body, feet near bottom. Kid-safe.

**Room interiors (2:3 portrait, 1024×1536, ground at 66%):**

4. Future Pop kids' **neon arcade bedroom**, cozy pastel-cyberpop. Capsule bed, blob rug,
   floating shelves with plush alien toys, a glowing neon "PLAY" wall sign in electric
   cyan, star window with night sky. Deep-indigo walls, pastel bedding, cyan neon pop,
   cozy lamp glow. Thick outlines, painterly. **2:3 portrait 1024×1536; floor begins at
   66% down and runs to bottom, that bottom strip kept clear; camera angled slightly
   down.** Day, bright. No people. Kid-safe.

5. Future Pop **rooftop music studio**, midnight-purple walls, modular synth/keyboard gear,
   gaming chair, floating shelf of records, bubblegum-pink neon "ON AIR" sign, big window
   to a pastel city skyline. Pastels + pink neon pop, cozy glow. Thick outlines. **2:3
   portrait 1024×1536; floor starts at 66% down, bottom strip clear; slight downward
   camera.** Night: complete night scene with city lights and a small moon. No people. Kid-safe.

6. Future Pop **cozy cyber-cafe**, soft charcoal + lavender, rounded counter with a cute
   barista robot, floating menu sign in violet neon, capsule booths, potted plants, holographic
   stickers on the wall. Pastels + violet pop, warm lamp glow. Thick outlines. **2:3 portrait
   1024×1536; floor at 66% down, bottom strip clear; slight downward camera.** Day, bright. No
   people. Kid-safe.

**Furniture / prop sets (transparent bg, base at bottom):**

7. Future Pop furniture set, 4 items in a row: a **capsule bed**, a **gaming chair**, a
   **blob-shaped rug**, a **soft glowing floor lamp**. Toy-like, exaggerated rounded
   proportions, thick outlines, pastel bodies each with one neon accent (cyan/violet/pink/mint),
   soft contact shadows. Transparent background, each object's base flush to bottom, evenly
   spaced. Kid-safe, no realism.

8. Future Pop prop set, 6 small collectibles: **arcade machine**, **console controller**,
   **plush alien pet toy**, **holographic sticker pack**, **potted neon-leaf plant**, **mini
   robot speaker**. Toy-like, rounded, thick outlines, pastel + one neon pop each, soft shadow.
   Transparent background, centered grid, bases flush to bottom. Kid-safe.

**Pet design:**

9. Future Pop **plush alien pet**, chibi blob creature, big friendly eyes, tiny limbs, soft
   rounded body, mint-and-lavender fur with a glowing cyan belly-spot, little antennae.
   Cute, huggable, expressive, mischievous-but-sweet. Thick outlines, painterly shading,
   soft contact shadow. Transparent background, centered, base at bottom. Kid-safe, not scary.

**UI icon sheet:**

10. Future Pop **UI icon sheet**, 12 sticker-badge icons on a neat grid: home, heart, star,
    coins, gift box, settings gear, camera, music note, friend/people, lock, sparkle, paint
    bucket. Each rounded with a thick outline, soft gradient, small specular highlight, and a
    neon `#A24BFF`/`#2FE6F6`/`#F15BB5` accent; collectible-badge feel, consistent sizing.
    Transparent background. Minimal/no text. Kid-safe.

---

*When in doubt: cozy over cool, readable over detailed, one neon pop per asset, and
always respect the 66% ground line.*
