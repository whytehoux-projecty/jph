# Heritage Trust — Agent Brief: Images, Assets and Page Improvements

**For:** an AI coding agent working inside the project in an IDE, with access to an image-generation model (Nano Banana Pro or Nano Banana 2).
**Site:** Next.js (App Router) + Tailwind, live at https://jpheritage.vercel.app. `next.config` has `images: { unoptimized: true }`, so images are NOT optimised by Next and must be compressed by you.
**The owner is new to coding.** Work in small phases, explain in plain language, and always tell her what to look at in the browser.

---

## 0. Kickoff message (the owner pastes this into the agent chat)

> Read `AGENT_BRIEF.md` in full. Do **Phase 0 only**, report back, and wait for my "go" before starting each next phase. Never skip the backup step.

---

## 1. How you must work

### 1.1 Rules

1. **Phases and approvals.** Finish one phase, then stop and report. Do not start the next phase until the owner says "go".
2. **One commit per task**, with a clear message (for example `fix: remove duplicate $ in wealth stat`). Never commit secrets (`.env*`, API keys).
3. **Do not redesign.** Keep copy, layout, colours and tokens exactly as they are, except where a task says otherwise. The design system is "Ledger": Paper, Sand, Ink, Vermilion (Tailwind tokens `paper-*`, `ink-*`, `vermilion-*`, `pine-*`).
4. **Follow the project's existing folders and file names.** Existing assets live in `public/images/hero`, `segments`, `outcomes`, `vault`, `logos`. New folders are listed in each task.
5. **Do not overwrite an existing asset without keeping a backup** in `assets-src/_backup/`.
6. **No new dependencies** except `sharp` (dev dependency, for image processing). Ask before adding anything else.
7. **Do not guess.** If a file, token or route is missing, say so and ask. Do not invent API keys, model IDs, official logos or badges.
8. **After every phase**, run `npm run build`. Fix errors before reporting.
9. **Report format (plain language):** what you did, which files changed, what to check at `http://localhost:3000` (exact page and spot), and anything you need from the owner.

### 1.2 Image-generation protocol (use for every generated image)

- Use the image tool exposed in your environment. If you cannot find one, **stop and ask the owner how image generation is set up.** Do not hardcode model IDs or keys.
- For each image: build the prompt as **[STYLE BLOCK(S) from section 2] + [asset prompt] + [NEGATIVE block]**, request the **aspect ratio and size in the table below**, and pass any **reference image** the task names.
- **Nano Banana generates a few fixed aspect ratios and cannot output transparency or SVG.** Generate at the closest native ratio, at 2K for heroes and banners and 1K for everything else, then crop and resize to the exact target pixels with `sharp`.
- Save raw outputs to `assets-src/<id>-v1.png` (create `assets-src/` and add it to `.gitignore`). Final optimised files go into `public/images/...`.
- **Look at every result** before accepting it. Check it against the task's "Done when" list and the QA list in section 6. If it fails, adjust the prompt and regenerate. Maximum **3 attempts** per image; if still failing, keep the best, mark it `NEEDS REVIEW` in your report and move on.
- Never ask the model to write text, logos, numbers, brand names or readable screens. Never generate real people's likenesses or fake historical photographs.

| Target (px) | Ratio to request | Then |
|---|---|---|
| 2560×1440 | 16:9, 2K | export directly |
| 1200×1600 | 3:4, 2K | resize |
| 1280×1600 | 4:5, 2K | resize |
| 1200×900 | 4:3, 1K | resize |
| 1200×750 (16:10) | 3:2, 1K | centre-crop to 16:10, resize |
| 2560×900 (2.84:1) | 21:9, 2K | crop top/bottom to 2.84:1; leave headroom in the prompt |
| 1200×1000 (6:5) | 5:4, 1K | crop to 6:5, resize |
| 1600×2000 | 4:5, 2K | resize |

### 1.3 Processing snippet (adapt as needed)

```js
// scripts/process-image.mjs  (node scripts/process-image.mjs in.png out.webp 1200 900 [position] [quality])
import sharp from 'sharp';
const [,, input, output, w, h, position = 'centre', quality = '76'] = process.argv;
await sharp(input)
  .resize(Number(w), Number(h), { fit: 'cover', position })
  .webp({ quality: Number(quality) })
  .toFile(output);
```

Keep every file under its weight budget (see tables). If a file is too heavy, lower quality in steps of 4 until it fits, but never below 60.

---

## 2. Style blocks

> **Site paper colour is `#FBF9F4`** (taken from the site's theme colour). Sand is approx. `#F3EEE3`. Ink is approx. `#14181C`. Vermilion `#C8401A`, bright `#F4724A`. Pine `#1D5C4A`. Read the real values from `tailwind.config` / global CSS and use those if they differ.

### MASTER STYLE

```
Premium private-bank editorial photography. Warm, honest, quietly confident. Shot on a full-frame camera, 35mm or 50mm lens, shallow depth of field, natural light, subtle film grain. Colour: warm paper whites (#FBF9F4), deep ink blacks (#14181C), restrained vermilion/burnt-orange accents (#E8532B) appearing only in small real-world objects (a mug, a scarf, a door, a paint can). Muted, slightly desaturated overall. Composed with generous negative space. Real, lived-in, American settings. People look natural and candid, never posed stock-photo smiles, and rarely look at the camera. No visible text, logos, brand names, watermarks, signage lettering, or readable screens anywhere in the image.
```

### LIGHT-PAGE MODIFIER (Personal Banking and other light pages)

```
High-key morning grade for a light web page: brighter exposure than a moody hero, soft diffused window light, paper-white highlights (#FBF9F4), sand mid-tones (#F3EEE3), gentle contrast, only small deep-ink accents, warm and airy. Never underexposed, never heavy shadows.
```

### NEGATIVE

```
NEGATIVE: stock-photo clichés, handshakes, piggy banks, floating coins, glowing holograms, neon blue tech gradients, 3D renders (unless the asset is a product render), plastic skin, distorted hands or fingers, extra limbs, warped faces, gibberish text, fake logos, oversaturated colours, HDR look, lens flare, clip-art, cartoon style.
```

---

# PHASE 0 — Setup and audit (no changes to the site)

**Goal:** understand the project and make it safe to change.

1. Create a git branch: `git checkout -b feature/images-and-polish`. If git is not set up, tell the owner and stop.
2. Make a backup commit of the current state.
3. Create `assets-src/` and `assets-src/_backup/`; add `assets-src/` to `.gitignore`.
4. Install `sharp` as a dev dependency if it is missing.
5. Locate and list: the homepage file, the personal-banking page file, the layout file (metadata), the header and footer components, the facts file (`@/src/content/facts`), the constants file (`@/lib/constants`), Tailwind config, and `public/images/**` (every file with size in KB and pixel dimensions).
6. **Look at every image** in `public/images/hero`, `segments`, `outcomes`, `vault` and note whether it passes the QA list (section 6).
7. Check that the logo package exists in `public/images/logos/`: `heritage-trust-logo.svg`, `heritage-trust-logo-reversed.svg`, `heritage-trust-logo-stacked.svg`, `heritage-trust-mark.svg`, `heritage-trust-mark-reversed.svg`, `favicon.svg` (plus mono variants). Report what is missing; the owner will add it.
8. Confirm what image-generation tool you can use.
9. **Report** a table: asset, path, size KB, dimensions, passes QA (yes/no and why), and the list of missing items. Then wait for "go".

---

# PHASE 1 — Homepage fixes (code only, no image generation)

### 1.1 Duplicate "$" in the Wealth card
The Wealth Management card shows **"$$48B+"**. In the homepage, `segments` has `stat: \`$${FACTS.assets}\``. Check how `FACTS.assets` is defined; if it already includes "$", change to `stat: FACTS.assets`. **Done when:** the card shows "$48B+" once, and the stats bar still shows "$48B+".

### 1.2 Footer logo
The footer is dark but uses the same file as the header. Use `/images/logos/heritage-trust-logo-reversed.svg` in the footer (header keeps the normal version). **Done when:** the footer logo is clearly visible on the dark background.

### 1.3 Descriptive alt text
Card and outcome images currently use their own heading as alt text (screen readers read it twice). For each of `segments/*`, `outcomes/*`, `vault/*`: look at the image and write a factual 8–14 word description. If the image is purely decorative, use `alt=""`. **Done when:** no `alt` duplicates a heading.

### 1.4 Metadata base and social image
- In `app/layout.tsx` set `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jpheritage.vercel.app')`.
- Remove hard-coded `heritagetrust.com` and the manual `openGraph.images` / `twitter` image entries from the homepage metadata so the file-based image in task 3.6 is used.
- **Done when:** page source shows `og:image` on the Vercel domain (after task 3.6).

### 1.5 Page title
The homepage title ends in "| Heritage Vault" (inconsistent with Personal Banking). Find where this comes from (layout title template) and set the homepage to `title: { absolute: 'Heritage Trust Bank — Trusted Since 1888' }`.

### 1.6 Primary button label consistency
The primary vermilion button has dark text on the Personal Banking page but light text on the homepage. Use light text (`text-paper-50`) everywhere and **compute the contrast ratio** against the button background. It must be at least 4.5:1. If it is not, darken `vermilion-600` to a value that passes and report the old and new values.

### 1.7 Convert JPG to WebP
For `segments/*.jpg`, `outcomes/*.jpg`, `vault/vault-1.jpg` (the Vault image is replaced in task 2.2): convert each to WebP at quality 78 (cards: 1200 px wide; keep the original aspect ratio), keep the original in `assets-src/_backup/`, update the references in code, delete the old JPGs from `public/`. **Done when:** every card and outcome image is `.webp`, under 120 KB, and the page looks identical.

**Phase 1 report, then wait for "go".**

---

# PHASE 2 — Homepage image generation

### 2.1 Mobile hero crops (3 images)

**Why:** on a phone the wide hero photos are cropped through the middle and the subjects are cut off.

**Reference image for each:** the matching existing desktop hero (`public/images/hero/hero-N-desktop.webp`, converted to PNG for the call).

**Output:** `public/images/hero/hero-1-mobile.webp`, `hero-2-mobile.webp`, `hero-3-mobile.webp` · **1200×1600** (3:4) · WebP ≤ 140 KB each.

```
[MASTER STYLE]
Using the attached image as the exact source, recompose it as a portrait 3:4 photograph. Keep the same people, clothing, faces, lighting, colour grade, mood and objects: do not change them, do not add or remove people. Extend the surrounding scene naturally where needed. Move the subject(s) into the lower-right 60% of the frame. Keep the top 35% and the left edge dark, calm and low-detail so a white headline can sit over them. Do not crop heads or hands.
[NEGATIVE]
```

**If a result changes faces or objects after 2 attempts,** fall back to a `sharp` crop of the desktop image around the subject (approx. windows: H1 x 58–100%, H2 x 54–98%, H3 x 52–96%), then upscale to 1200×1600 and mark it `CROPPED FALLBACK`.

**Then:** in the homepage, change `<HeroSlides />` to `<HeroSlides useMobileImages />`. **Done when:** on a 390 px wide viewport, each slide shows its subject fully.

### 2.2 Heritage Vault phone (transparent)

**Output:** `public/images/vault/vault-phone.webp` and `vault-phone.png` · **1600×2000** · with transparent background · ≤ 300 KB.

Nano Banana cannot output transparency. Generate on a flat background, then remove it:

```
Photoreal studio render of a modern smartphone with thin bezels and a matte graphite-black frame, rotated 12 degrees and tilted slightly back, centred, on a perfectly flat solid mid-grey background (#808080) with no gradient, no floor, no shadow and no reflections on the background. A soft warm vermilion-orange rim light from the right edge. The screen is on but shows ONLY a plain, dark, blank placeholder: no text, no numbers, no app UI, no icons. Clean product-render quality, crisp glass reflections, no hands, no logos, no brand marks. Portrait 4:5.
NEGATIVE: any visible text, app icons, brand logos, hands, cluttered background, cartoon style.
```

**Background removal:** use `rembg` (`pip install rembg`) or another local tool. **Check the edges** by placing the result over `#14181C` and over `#FBF9F4`. If there is a grey or white fringe after two attempts, **fall back to a code-built phone**: an inline SVG/CSS phone frame (ink body, rounded corners 36 px, thin bezel) and report that this replaced the render.

**Screen content:** do not generate app UI. Overlay a real screenshot of the Heritage Vault portal inside the screen area using absolute positioning, or leave the dark placeholder if no screenshot exists. Add a soft CSS drop shadow (`drop-shadow`) since the generated shadow was removed.

**Update the Vault section** to use the new image (replacing `vault-1.jpg`) and update its alt text. **Done when:** the phone sits on the dark band with no visible box or fringe.

### 2.3 Audit existing card and outcome images (regenerate only if failing)

You looked at these in Phase 0. **Keep every image that passes QA.** Regenerate only failures, using these prompts (target sizes: cards 1200×750, outcomes 1200×750, WebP ≤ 120 KB). Keep the existing file name (`segments/personal.webp`, `business.webp`, `wealth.webp`, `outcomes/outcome-1.webp`, `outcome-2.webp`).

**Personal:**
```
[MASTER STYLE]
Overhead-angled still life on a worn walnut kitchen table, morning light from a window at left. A ceramic mug in vermilion glaze, a set of house keys on a leather tag, a plain folder with no text, and a closed laptop with no logo. A hand with a wedding ring reaches in softly from the right edge. Warm, domestic, calm. Light cream and wood tones, shallow depth of field. Aspect 3:2.
[NEGATIVE]
```
**Business:**
```
[MASTER STYLE]
Close, candid shot over the counter of a small independent coffee shop: the owner's hands in a canvas apron handing a paper cup to a customer, a countertop card terminal with a blank screen in the foreground, soft morning window light, a copper espresso machine blurred behind. Warm and busy but uncluttered. One vermilion accent (a cup sleeve). Aspect 3:2.
[NEGATIVE]
```
**Wealth:**
```
[MASTER STYLE]
Quiet, dark-toned still life on a polished mahogany desk: a black fountain pen resting on an open leather portfolio with blank cream pages, a small brass desk lamp casting a warm pool of light, a blurred bookshelf and a framed architectural drawing with no readable text in the background. Dark ink shadows, amber highlights, a refined private-office mood. Aspect 3:2.
[NEGATIVE]
```
**Outcome 1 (construction firm):**
```
[MASTER STYLE]
Late-afternoon photograph of a mid-rise commercial building under construction: exposed concrete frame, a tower crane silhouetted against a warm apricot sky, two workers in hard hats and hi-vis vests reviewing plans on a table in the foreground, seen from behind. Real and grounded, no logos on equipment or vests. Warm sunset light, long shadows, slight haze. Aspect 3:2.
[NEGATIVE]
```
**Outcome 2 (retail chain):**
```
[MASTER STYLE]
Bright, calm interior of an independent clothing boutique in the morning: a staff member folds knitwear at a wooden counter, a contactless card terminal on the counter with a blank screen, shelves of folded garments in cream and charcoal, one vermilion scarf as the accent. Soft daylight, shallow depth of field, premium but approachable. Aspect 3:2.
[NEGATIVE]
```

### 2.4 Homepage closing banner image ("the light left on")

**Output:** `public/images/home/home-cta-desktop.webp` (**2560×900**, ≤ 200 KB) and `home-cta-mobile.webp` (**1200×1000**, ≤ 120 KB). Dark-toned.

```
[MASTER STYLE]
Wide cinematic architectural photograph at dusk, close and low: a tall arched doorway of an 1888 limestone bank building, its heavy carved stone surround and three stone steps, a warm amber glow from inside spilling onto the steps, the door itself slightly open, the street empty and quiet. The arched doorway sits in the right 40% of the frame. The left 55% is deep ink-blue-black shadow and a dark facade with minimal detail, for a headline overlay. No lettering on the stonework, no signage, no people. Straight vertical lines. Generous headroom and footroom (the image will be cropped to a wide strip). Aspect 21:9.
[NEGATIVE]
```
Mobile version: recompose the same scene as 5:4 with the doorway in the lower-right 60% and the top third dark and calm. This image echoes the logo (the lit arched doorway), so keep the doorway glow vermilion-amber.

**Phase 2 report (show each generated image, with attempt counts), then wait for "go".**

---

# PHASE 3 — Code-authored assets (write these yourself, do NOT use the image model)

Vector and generated-pattern assets are crisper and smaller when written as code.

### 3.1 Security icons (3 SVGs) → `public/images/icons/`
`icon-fdic.svg`, `icon-encryption.svg`, `icon-fraud.svg` · 96×96 viewBox · 1.75 px stroke, round caps and joins, ink (`#14181C`) strokes, **one** small solid vermilion (`#C8401A`) **arched-doorway** shape (a rectangle with a semicircular top) as the only accent in each. Under 4 KB each, no text.
1. **FDIC:** a classical bank facade (pediment and three columns); the doorway is the centre opening.
2. **Encryption:** a padlock; the keyhole is the vermilion arch.
3. **Fraud:** an eye inside a hexagon with a thin scan line; the pupil is the vermilion arch.

Replace the current Lucide icons in the Security section with these. Keep the existing tinted square only if it still looks right; report your choice. **Done when:** the three icons look like one family at 48 px and at 96 px.

### 3.2 Guilloche pattern → `public/images/patterns/guilloche.svg`
A seamless **800×800** tile of banknote-style guilloche engraving: interlacing fine concentric spirograph lines and rosettes, 1 px strokes in `#2A3036` on transparent, symmetrical and repeatable on all four edges, no text. Write a small script to generate it, and check it tiles with no visible seam. Use it as the background of the dark Vault band (`backgroundImage: url(/images/patterns/guilloche.svg)`, `backgroundSize: 400px`, over the existing `var(--bg)` colour). **Done when:** it is barely visible behind the text and the text stays readable.

### 3.3 Favicon and app icon
Copy `public/images/logos/favicon.svg` to `app/icon.svg`. Generate `app/apple-icon.png` (180×180) from it with `sharp`. Remove any older favicon files that conflict. **Done when:** the browser tab shows the H with the vermilion doorway.

### 3.4 Social share image
Create `app/opengraph-image.tsx` using Next's built-in `ImageResponse` (`next/og`), **1200×630**, `contentType: 'image/png'`: Ink background, the guilloche pattern at 6% opacity, the reversed horizontal logo at the top left, the headline "Banking built on 138 years of trust." in large white type (use the site display font if it can be loaded, otherwise a system sans), and "Member FDIC" in small caps at the bottom. Add a matching `twitter-image.tsx` or re-export. **Done when:** `/opengraph-image` loads in the browser and renders cleanly.

### 3.5 Personal Banking icons (6 SVGs) → `public/images/icons/`
`icon-vault.svg`, `icon-fraud-shield.svg`, `icon-hours.svg`, `icon-wellness.svg`, `icon-instant.svg`, `icon-rewards.svg` · same spec as 3.1, with exactly one vermilion arched-doorway accent each:
1. **Vault digital banking:** smartphone outline; the arch sits on its screen.
2. **Fraud Shield:** shield outline with a scan line; the arch at its centre.
3. **Extended branch hours:** clock face; the arch replaces the 12 o'clock mark.
4. **Financial wellness:** rising line chart; the last data point sits inside the arch.
5. **Instant account opening:** document page with a lightning bolt; the arch at the top of the page.
6. **Relationship rewards:** rosette with two ribbon tails; the arch at its centre.

**Phase 3 report, then wait for "go".**

---

# PHASE 4 — Personal Banking page

**Page:** `/personal-banking` (find the page file in Phase 0). **Page structure:** hero (sand panel, dark text), stats row, five product sections (Checking, Savings, Rewards Visa®, Personal Loan, Mortgages), six-card "More than a bank account" section, disclosures, footer.

**Design intent:** this page is **light**. The hero is a two-column split (text left, photo right); photography is the same look as the homepage but brighter. **Vary the people** across images (age, background, setting). Do not reuse homepage faces.

### 4.1 Images to generate

| ID | Output file (in `public/images/personal/`) | Size | Ratio to request | Max weight |
|---|---|---|---|---|
| PB-H1 | `pb-hero-desktop.webp` | 1280×1600 | 4:5, 2K | 180 KB |
| PB-H1m | `pb-hero-mobile.webp` | 1200×900 | 4:3, 1K | 110 KB |
| PB-S1 | `pb-checking.webp` | 1200×900 | 4:3, 1K | 110 KB |
| PB-S2 | `pb-savings.webp` | 1200×900 | 4:3, 1K | 110 KB |
| PB-S3 | `pb-card.webp` | 1200×900 | 4:3, 1K | 100 KB |
| PB-S4 | `pb-loan.webp` | 1200×900 | 4:3, 1K | 110 KB |
| PB-S5 | `pb-mortgage.webp` | 1200×900 | 4:3, 1K | 110 KB |
| PB-C1 | `pb-cta-desktop.webp` | 2560×900 | 21:9, 2K | 200 KB |
| PB-C1m | `pb-cta-mobile.webp` | 1200×1000 | 5:4, 1K | 120 KB |

#### PB-H1 — hero photo
Keep the **lower-left 30%** and **upper-right 20%** calm: small UI chips are overlaid there in code.
```
[MASTER STYLE] [LIGHT-PAGE MODIFIER]
Portrait 4:5 editorial photograph, mid-morning. A woman in her early 30s stands at a sunlit kitchen island in a bright New York apartment, holding a ceramic mug in vermilion glaze in one hand and a smartphone loosely in the other, glancing down at it with a relaxed, quietly pleased expression, three-quarter view; the phone screen faces away from the camera. Behind her: a tall window with soft white curtains, a blurred exposed-brick wall, a small leafy plant, a wooden bowl of lemons. Subject centred slightly right, head to waist, filling about 55% of the frame width. The lower-left 30% and upper-right 20% of the frame are calm, low-detail (soft wall and window light). Light from the left, creamy shadows.
[NEGATIVE]
```

#### PB-H1m — mobile hero
Pass the accepted PB-H1 as a **reference image**:
```
[MASTER STYLE] [LIGHT-PAGE MODIFIER]
Using the attached image as the exact source, recompose it as landscape 4:3. Keep the same woman, clothing, kitchen, light and mood unchanged. Place her in the right 55% of the frame; keep the left third calm and low-detail. Do not crop her head or hands.
[NEGATIVE]
```

#### PB-S1 — Heritage Checking
```
[MASTER STYLE] [LIGHT-PAGE MODIFIER]
Candid photograph on a bright morning street lined with brownstones in lower Manhattan. A man in his mid-30s in a navy overcoat with a vermilion scarf pauses at a coffee cart, tapping his phone against a hand-held card reader to pay; the phone and reader screens face away or are blank, and the cart has no lettering. The vendor's hand passes him a paper cup. Three-quarter angle, shallow depth of field, street softly blurred. Everyday, easy, in motion.
[NEGATIVE]
```

#### PB-S2 — Heritage Savings
```
[MASTER STYLE] [LIGHT-PAGE MODIFIER]
Close editorial still life on a pale oak windowsill in bright morning light: a woman's hands gently watering a young green seedling in a small terracotta pot with a brass watering can; beside it an open notebook with blank cream pages and a pencil. Fresh green plant against paper-white and sand tones, blurred bright window behind. Calm, patient, quietly optimistic: growth over time.
[NEGATIVE]
```

#### PB-S3 — Heritage Rewards Visa®
```
[MASTER STYLE] [LIGHT-PAGE MODIFIER]
Studio product photograph of a premium credit card: matte ink-black body (#14181C) with a fine guilloche line pattern in dark grey, a thin vermilion edge stripe, a brushed gold-toned chip and a contactless symbol. The card rests at a three-quarter angle on a pale linen surface with a soft natural shadow. Beside it: tortoiseshell sunglasses, a small brass key, and a blank cream paper card with no printing. NO text, no card number, no cardholder name and NO network logo anywhere; leave the bottom-right of the card blank. Sand and paper background, crisp, premium.
[NEGATIVE]
```
**Compliance:** never generate the Visa® mark. The owner's design team adds it from official Visa assets.

#### PB-S4 — Personal Loan
```
[MASTER STYLE] [LIGHT-PAGE MODIFIER]
Candid photograph of a couple in their late 30s in a bright, half-renovated living room: she holds two blank paint colour chips against a pale wall, he stands on a low step stool with a paint roller; a drop cloth on the floor, tall windows, an arched doorway behind them painted a soft warm vermilion. Faces in profile, smiling naturally at the wall. A shared project in progress.
[NEGATIVE]
```

#### PB-S5 — Mortgages
```
[MASTER STYLE] [LIGHT-PAGE MODIFIER]
A young couple in their late 20s, seen from behind and slightly to the side, stepping through an open front door into an empty sunlit apartment. She carries a single cardboard box, he holds a ring of keys on a leather tag. Warm afternoon light across hardwood floors; a tall arched window glows at the far end of the room. Calm negative space, a quiet moment of arrival.
[NEGATIVE]
```

#### PB-C1 — closing banner (dark)
```
[MASTER STYLE]
Wide cinematic photograph at dusk. A woman in her 40s sits at a wooden dining table in a warm lamplit room, using a slim laptop whose screen faces away from the camera (the lid back is plain, no logo), a ceramic mug beside her, relaxed and unhurried, seen in three-quarter profile. Subject in the right 40% of the frame. The left 55% falls to deep soft-focus shadow (out-of-focus bookshelf, near-black ink #14181C) with very little detail for a headline overlay. A tall arched window at the right shows blue-hour light. One small vermilion accent (a book spine or the mug). Generous headroom and footroom (the image will be cropped to a wide strip). Aspect 21:9.
[NEGATIVE]
```
**PB-C1m:** pass PB-C1 as a reference; recompose as 5:4 with the subject in the right 55% and lower half; top 40% and left third dark and calm.

### 4.2 Page changes (implement after the images are accepted)

Inspect the page file first. **Keep all existing copy, data and anchors** (`#checking`, `#savings`, `#card`, `#loans`, `#mortgages`).

1. **Hero:** two columns on desktop (`md:grid-cols-2`): existing text left, photo right in a rounded 4:5 frame (`rounded-lg overflow-hidden`). On mobile, the photo sits **below the buttons**, using the 4:3 file. Use a `<picture>` with a `(min-width: 768px)` source for the desktop file. Give the hero image `priority` (or `fetchPriority="high"`). **Remove the placeholder device mockup** (grey frame with skeleton bars and the red dot). Overlay two small chips on the photo (lower-left: "Savings APY" with the APY from facts; upper-right: "Monthly fee $0"), built in code from existing data, not baked into the image.
2. **Product sections:** add each photo beside the text in a two-column layout, **alternating** sides (left, right, left, right, left) and background (paper, sand, paper, sand, paper). On mobile the photo goes above the text. Add `width`/`height`, `loading="lazy"`, rounded corners. Keep the stat panel and bullet list in their current order.
3. **"More than a bank account" cards:** add the six icons (3.5) above each card title, in the same order as the cards.
4. **Closing banner:** new section after the "More than a bank account" section and before Disclosures: Ink background with the guilloche pattern, headline "Open an account in under 5 minutes.", one primary button linking to `ROUTES.apply`, and the banner photo (`pb-cta-desktop`/`pb-cta-mobile`) filling the right side behind a left-to-right Ink scrim (`linear-gradient(90deg, rgba(20,24,28,.92) 0%, rgba(20,24,28,.6) 50%, rgba(20,24,28,0) 100%)`).
5. **Alt text:** write factual alts for every photo; decorative icons use `aria-hidden="true"` and `alt=""`.

**Phase 4 report, then wait for "go".**

---

# PHASE 5 — Optional homepage improvements (implement only the ones the owner approves)

Each is a separate commit. Use existing facts and constants (`FACTS`, `RATES`, `ROUTES`); do not hard-code numbers that already exist there.

| # | Improvement | Spec |
|---|---|---|
| 5.1 | **Outcome metrics** | Add a large monospace figure to each outcome card: **60%** "faster payment processing" and **34%** "lower payment processing costs". Keep the existing paragraph. |
| 5.2 | **Closing banner** | New section before the footer: Ink + guilloche + `home-cta-desktop/mobile` image (task 2.4), headline "Open an account in under 5 minutes.", primary button to `ROUTES.apply`, secondary link "Sign in to Heritage Vault". |
| 5.3 | **Vault features** | Under the Vault headline add three short feature lines: "Deposit checks and pay bills", "Send wires and manage cards", "Real-time alerts, 24/7". |
| 5.4 | **App store badges** | Do NOT draw or generate badges. Only add if the owner supplies the official Apple and Google badge files in `public/images/badges/`. Otherwise skip and report. |
| 5.5 | **ATM and branch strip** | Sand band under the proof strip or above the footer: "55,000+ surcharge-free ATMs" (from `FACTS.atms`) and a link "Find an ATM or branch" to the Locations route. |
| 5.6 | **Trust marks** | FDIC and Equal Housing Lender marks near the footer or Security section. Only use official files supplied by the owner in `public/images/badges/`; never recreate official logos. If none supplied, keep the existing text line. |
| 5.7 | **Rates snapshot** | Small row: Savings 4.85% APY, Personal Loan from 6.49% APR, Rewards Visa 2.5% cash back. Read from `RATES`; if a value is missing, add it to the facts file and tell the owner. Include the existing disclosure footnotes. |

---

# PHASE 6 — Other pages (plan first, then wait)

Pages without imagery: **Business, Wealth, About, Locations, Contact, Security, Careers, Press, Apply, Enroll, Status, Rates & Fees.**

For each of **Business** and **Wealth** first, then the rest in order of the owner's choice:
1. Inspect the page and list its sections.
2. Propose an asset list in the same format as section 4.1 (ID, file, size, ratio, weight), with a one-line scene description for each image, **without generating anything yet**.
3. Wait for the owner's approval, then follow the same process as Phases 2–4.

**Starting guidance (not final prompts):**
- **Business:** light page like Personal Banking. Scenes: a shop owner at her counter, a small workshop, a payroll or bookkeeping desk, a loading dock. One image per product section (Checking, Merchant Services, Lending, Payroll, Treasury).
- **Wealth:** dark and quiet, like the Wealth card. Scenes: a private office, an estate-planning table with blank documents, three generations walking in a park, a study.
- **About:** use the real building photo and an **engraved-style illustration** of the 1888 building. **Never generate fake "historical photographs" presented as real.** For leadership, use initials-only placeholders unless the owner supplies photos.
- **Locations:** map built in code, plus one branch-interior photo.
- **Security:** code-authored illustrations and icons, no photos.
- **Careers:** a small set of candid team photos (varied people).
- **Press, Apply, Enroll, Status, Rates & Fees:** no new imagery.

---

# 6. QA checklist (use for every generated image)

- [ ] No readable text, numbers, logos or watermarks; phone and laptop screens face away or are blank
- [ ] Faces, hands and fingers look natural; no warped or duplicated features
- [ ] Subjects are not cut off awkwardly in any crop (check the mobile version too)
- [ ] Dark images: the text-safe zone is dark and calm enough for white text at contrast ≥ 4.5:1 once the scrim is applied
- [ ] Light images: bright and airy, no heavy shadows
- [ ] Vermilion appears only as one small accent
- [ ] People vary across the set; nobody reuses a face from another image
- [ ] The image matches the target dimensions and stays under its weight budget
- [ ] The site still builds (`npm run build`) and the page looks right at 390 px, 768 px and 1440 px wide

---

# 7. Final report (after the last approved phase)

Give the owner:
1. A table of every file added, changed or deleted.
2. Before-and-after page weight for the homepage and Personal Banking page.
3. A "what to check in the browser" list, step by step.
4. Open items: anything marked `NEEDS REVIEW`, `CROPPED FALLBACK`, or waiting on official assets (store badges, FDIC and Equal Housing marks, Visa® mark).
5. The branch name and the exact commands to preview and publish:

```bash
npm run dev          # preview at http://localhost:3000
npm run build        # must finish without errors
git push             # publishes via Vercel if the repo is connected
```
