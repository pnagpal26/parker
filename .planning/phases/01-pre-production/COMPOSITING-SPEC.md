# Playwright HTML/CSS Compositing Pipeline Spec

**Replaces:** FIGMA-TEMPLATE-SPEC.md (Figma not used — no Figma in this workflow)
**Date:** 2026-03-15
**Used by:** All 5 Phase 2 ad plans
**Requirement:** PRE-02 (background generation) + Phase 2 compositing pipeline

## Overview

The compositing pipeline has four stages. All stages run in code — no design
tool required.

```
Stage 1: nano-banana generates background PNG (768×1376 near-9:16)
Stage 2: sharp upscales/crops to exactly 1080×1920
Stage 3: HTML/CSS template applies Parker brand overlay
Stage 4: Playwright screenshots at 1080×1920 → final PNG export
```

---

## Stage 1: Background Generation (nano-banana)

**Tool:** Gemini CLI with nanobanana extension v1.0.12
**CLI path:** `~/.local/bin/gemini` (v0.33.1)
**Extension:** nanobanana v1.0.12 (already installed)

**Canonical command** (confirmed working — no --aspect flag; use `--yolo` with
the 9:16 constraint in the prompt text):

```bash
gemini --yolo "/generate '[PROMPT] vertical portrait 9:16 ratio no text no people'"
```

**Example for Ad 2 (lifestyle background):**
```bash
cd /Users/puneetnagpal/development/parker
gemini --yolo "/generate 'luxury Toronto condominium rooftop infinity pool overlooking midtown skyline at golden hour, compositional negative space upper third for text overlay, warm amber light on still water, deep charcoal shadows foreground, editorial architectural photography style, vertical portrait 9:16 ratio no text no people no logos no watermarks'"
```

**Output location:** `./nanobanana-output/` relative to current working directory.

**Expected output dimensions:** ~768×1376 (nano-banana native near-9:16 output).
Stage 2 upscales to 1080×1920.

**Important — no --aspect flag:** The confirmed canonical command does NOT use
`--aspect=9:16` as a top-level flag. The 9:16 constraint is passed inside the
`/generate` prompt string as natural language ("vertical portrait 9:16 ratio").

---

## Stage 2: Upscale/Crop to 1080×1920 (sharp)

**Tool:** `sharp` npm package (already in project or install as dev dependency)

**Script pattern** (create as `scripts/upscale.mjs` in Phase 2):

```javascript
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import path from 'path';

const INPUT_DIR = './nanobanana-output';
const OUTPUT_DIR = './ad-backgrounds';

// upscale a single PNG to 1080x1920, covering the full canvas
async function upscale(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1080, 1920, {
      fit: 'cover',        // crop to fill, maintain aspect ratio
      position: 'centre',  // center the crop
      kernel: 'lanczos3',  // high-quality resampling
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`Upscaled: ${outputPath}`);
}
```

**Verification after upscale:**
```bash
sips -g pixelWidth -g pixelHeight ad-backgrounds/*.png
# Expected: pixelWidth: 1080 / pixelHeight: 1920
```

---

## Stage 3: HTML/CSS Template

Each ad is rendered from a single-file HTML template. The template:
- Loads Cormorant Garamond + Plus Jakarta Sans via Google Fonts CDN
- Positions the upscaled background as a full-bleed `<img>` base layer
- Applies a gradient overlay via CSS
- Renders Parker brand elements (logo, headline, CTA button, attribution)
- Uses exact hex values — no color variation between ads

### Template Structure (1080×1920 canvas)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background: #131311;
      position: relative;
    }

    /* Background image — full bleed base layer */
    .bg {
      position: absolute;
      inset: 0;
      width: 1080px;
      height: 1920px;
      object-fit: cover;
    }

    /* Gradient overlay — adjust per ad */
    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(19, 19, 17, 0.15) 0%,
        rgba(19, 19, 17, 0.55) 55%,
        rgba(19, 19, 17, 0.85) 100%
      );
    }

    /* Safe zone: x=90–990, y=250–1536 */
    .safe-zone {
      position: absolute;
      left: 90px;
      top: 250px;
      width: 900px;       /* 990 - 90 */
      height: 1286px;     /* 1536 - 250 */
      display: flex;
      flex-direction: column;
    }

    /* Parker logo — top of safe zone */
    .logo {
      margin-top: 20px;
      height: 40px;
      width: auto;
      object-fit: contain;
      object-position: left center;
    }

    /* Content block — vertically centered or positioned lower */
    .content {
      margin-top: auto;
      margin-bottom: 120px; /* leaves room for attribution at bottom */
    }

    /* Orange accent rule above eyebrow */
    .accent-rule {
      width: 40px;
      height: 2px;
      background: #E85B3A;
      margin-bottom: 16px;
    }

    /* Eyebrow text */
    .eyebrow {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      font-size: 26px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 20px;
    }

    /* Headline — Cormorant Garamond */
    .headline {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 400;
      font-size: 108px;
      line-height: 1.0;
      letter-spacing: -0.01em;
      color: #FFFEFB;
      margin-bottom: 28px;
    }

    .headline em {
      font-style: italic;
    }

    /* Supporting copy */
    .subhead {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 300;
      font-size: 30px;
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.80);
      margin-bottom: 48px;
      max-width: 780px;
    }

    /* CTA button — sharp corners, Parker orange */
    .cta-button {
      display: inline-block;
      background: #E85B3A;
      color: #FFFEFB;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 26px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 22px 48px;
      border-radius: 0;          /* sharp corners — no border-radius */
      text-decoration: none;
      width: fit-content;
    }

    /* Attribution — bottom of safe zone */
    .attribution {
      position: absolute;
      left: 90px;
      bottom: 384px;             /* 1920 - 1536 = 384px from bottom */
      width: 900px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      font-size: 19px;
      letter-spacing: 0.15em;
      color: rgba(255, 255, 255, 0.50);
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- Stage 1: Background (upscaled by sharp in Stage 2) -->
  <img class="bg" src="[AD_BACKGROUND_PATH]" alt="">

  <!-- Stage 2: Gradient overlay -->
  <div class="overlay"></div>

  <!-- Safe zone content -->
  <div class="safe-zone">
    <!-- Parker logo (white SVG) -->
    <img class="logo" src="[PARKER_LOGO_PATH]" alt="Parker">

    <!-- Ad-specific content block -->
    <div class="content">
      <div class="accent-rule"></div>
      <div class="eyebrow">[EYEBROW TEXT]</div>
      <h1 class="headline">[HEADLINE HTML]</h1>
      <p class="subhead">[SUBHEAD TEXT]</p>
      <div class="cta-button">[CTA TEXT]</div>
    </div>
  </div>

  <!-- RECO attribution — always present, always same wording -->
  <div class="attribution">
    Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage
  </div>
</body>
</html>
```

### Per-Ad Template Variables

Each Phase 2 plan defines these values for its ad:

| Variable | Ad 1 (Incentives) | Ad 2 (Lifestyle) | Ad 3 (Location) | Ad 4 (Urgency) | Ad 5 (Conversational) |
|----------|-------------------|------------------|-----------------|----------------|----------------------|
| EYEBROW | "Limited Offer" | "Luxury Living" | "Yonge + Eglinton" | "Available Now" | "Talk to Emma" |
| CTA TEXT | "Claim Your Free Month" | "Book a Private Tour" | "Explore Suites" | "Move In Today" | "Chat with Emma" |

Headlines and subheads are defined in each ad's Phase 2 plan.

---

## Stage 4: Playwright Screenshot Export

**Tool:** `playwright` (install as dev dependency: `npm install -D playwright`)

**Script pattern** (create as `scripts/composite.mjs` in Phase 2):

```javascript
import { chromium } from 'playwright';
import path from 'path';
import { writeFile } from 'fs/promises';

async function renderAd(htmlPath, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to exact canvas dimensions
  await page.setViewportSize({ width: 1080, height: 1920 });

  // Load the HTML file (use file:// URL for local assets)
  await page.goto(`file://${path.resolve(htmlPath)}`);

  // Wait for Google Fonts to load
  await page.waitForLoadState('networkidle');

  // Screenshot at 1x (no device pixel ratio scaling)
  const screenshot = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 1080, height: 1920 },
  });

  await writeFile(outputPath, screenshot);
  await browser.close();
  console.log(`Exported: ${outputPath}`);
}

// Example usage:
await renderAd('./ads/parker-ad-01-incentives.html', './dist/parker-ad-01-incentives.png');
```

**Verification after export:**
```bash
sips -g pixelWidth -g pixelHeight dist/parker-ad-01-incentives.png
# Expected: pixelWidth: 1080 / pixelHeight: 1920

# All five ads:
for f in dist/parker-ad-*.png; do
  echo "$f:"; sips -g pixelWidth -g pixelHeight "$f"; done
```

---

## Brand Constants (apply to every ad)

| Element | Value |
|---------|-------|
| Background base | `#131311` (--dark) |
| CTA button fill | `#E85B3A` (--orange) |
| CTA button radius | `0` (sharp corners — no border-radius) |
| Headline font | Cormorant Garamond 400, ~108px |
| Headline italic | Cormorant Garamond 400 italic |
| Eyebrow font | Plus Jakarta Sans 500, 26px, uppercase, 0.25em tracking |
| Subhead font | Plus Jakarta Sans 300, 30px |
| CTA label font | Plus Jakarta Sans 600, 26px, uppercase, 0.12em tracking |
| Attribution font | Plus Jakarta Sans 400, 19px, 0.15em tracking, rgba(255,255,255,0.50) |
| Accent rule | 40×2px, `#E85B3A` |

## Safe Zone Reference

| Zone | X | Y | Width | Height |
|------|---|---|-------|--------|
| Top unsafe (Instagram UI chrome) | 0 | 0 | 1080 | 250 |
| Bottom unsafe (link bar) | 0 | 1536 | 1080 | 384 |
| Left margin | 0 | — | 90 | — |
| Right margin | 990 | — | 90 | — |
| **Safe content area** | **90** | **250** | **900** | **1286** |

All critical content (logo, headline, CTA, attribution) must land inside the
safe content area (x: 90–990, y: 250–1536).

## Attribution String (RECO-Compliant — Do Not Modify)

Use this exact string on every ad, verbatim:

```
Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage
```

Full compliance source: `.planning/phases/01-pre-production/RECO-ATTRIBUTION.md`

## Fonts

Both fonts load from Google Fonts CDN in the HTML template. For offline/CI use,
download and commit the TTF files:

- `CormorantGaramond-Regular.ttf`
- `CormorantGaramond-Italic.ttf`
- `CormorantGaramond-SemiBold.ttf`
- `PlusJakartaSans-Light.ttf`
- `PlusJakartaSans-Regular.ttf`
- `PlusJakartaSans-Medium.ttf`
- `PlusJakartaSans-SemiBold.ttf`

Source: https://fonts.google.com/specimen/Cormorant+Garamond

Reference by `file://` URL path in `<link>` if running without internet access.

## QA Checklist (run for every ad before final export)

- [ ] Background fills full 1080×1920 canvas (no white edges)
- [ ] Gradient overlay present — background image is darkened, not blown out
- [ ] Logo visible in top of safe zone (y > 250px from top)
- [ ] Eyebrow text, headline, subhead all within safe zone (y < 1536px from top)
- [ ] CTA button sharp corners (border-radius: 0), orange fill (#E85B3A)
- [ ] Attribution line visible (rgba(255,255,255,0.50) on dark bg) — readable at arm's length
- [ ] Attribution string matches verbatim: "Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage"
- [ ] Export PNG dimensions verified: 1080×1920
- [ ] File size under 5 MB (PNG-9 compression from sharp)

## Checkpoint Before Phase 2 Production

Before Phase 2 ad generation begins, confirm:
- [ ] nano-banana generates backgrounds (verified in NANO-BANANA-VERIFY.md)
- [ ] `sharp` is installed (`npm install sharp`)
- [ ] `playwright` is installed (`npm install -D playwright && npx playwright install chromium`)
- [ ] Google Fonts load correctly in Playwright (or local TTF files committed)
- [ ] One test composite renders at 1080×1920 with correct fonts and brand colors
- [ ] Attribution string renders legibly at arm's length on a phone screen
