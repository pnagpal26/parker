# Phase 2: Ad Generation - Research

**Researched:** 2026-03-15
**Domain:** Playwright HTML/CSS compositing pipeline, nano-banana background generation, Parker brand layer
**Confidence:** HIGH — all critical technical decisions locked in Phase 1 spec documents

---

## Summary

Phase 2 produces five fully-composited Instagram Story ad PNGs (1080×1920 px) using a
four-stage automated pipeline: nano-banana background generation → sharp upscale → HTML/CSS
brand template → Playwright screenshot export. Every technical decision was locked during
Phase 1; this phase is pure execution of a fully-specified pipeline.

The pipeline is entirely code-driven and requires no design tool. Each of the five ads
follows an identical template structure with per-ad variable substitution (eyebrow, headline,
subhead, CTA text, background path). The brand layer constants — fonts, colors, safe zones,
attribution string, button style — are identical across all five ads.

The single open constraint is background source: Fitzrovia CDN photo rights are verbally
confirmed but written confirmation is still pending. Until written confirmation is received,
all five ads MUST use nano-banana AI-generated backgrounds. This does not block Phase 2.

**Primary recommendation:** Execute all five ad plans sequentially (Wave 1 = Wave 5), each plan
following the same four-task pattern: generate background → upscale → write HTML template →
Playwright export + QA. Share `scripts/upscale.mjs` and `scripts/composite.mjs` across all five
plans by creating them in the first plan (02-01) and referencing them in 02-02 through 02-05.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SPEC-01 | All ads output at 1080×1920px, PNG format, sRGB color space, ≤30MB | Sharp `png({ compressionLevel: 9 })` produces ≤5MB. sRGB is default PNG color space. Playwright clip at 1080×1920. |
| SPEC-02 | All critical content lives within safe zone (y=250px to y=1536px) | CSS `.safe-zone { top: 250px; height: 1286px }`. Attribution at `bottom: 384px`. Both within safe bounds. |
| SPEC-03 | Every ad includes RECO attribution at minimum 22pt, legible | Attribution CSS: 19px at 1080px canvas ≈ 14–15pt on phone. RECO-ATTRIBUTION.md specifies 18–20px as compliant. Note: REQUIREMENTS.md says "22pt" — resolve to 19px per spec (see Open Questions). |
| SPEC-04 | Every ad includes Parker logo (white version) in top-left of safe zone | `<img class="logo">` at safe-zone top, `object-position: left center`. Logo URL: `https://fitzrovia.ca/app/uploads/2021/05/02_parker_logo.svg`. |
| SPEC-05 | CTA button uses `#E85B3A` orange, sharp corners, white label text | CSS `.cta-button { background: #E85B3A; border-radius: 0; color: #FFFEFB }`. |
| SPEC-06 | Headline uses Cormorant Garamond, 72–96pt | CSS `.headline { font-family: 'Cormorant Garamond'; font-size: 108px }`. 108px at 1080px canvas is ~72pt at phone-screen size. |
| SPEC-07 | Subhead and CTA label use Plus Jakarta Sans | CSS: `.subhead { font-family: 'Plus Jakarta Sans' }`, `.cta-button { font-family: 'Plus Jakarta Sans' }`. |
| SPEC-08 | Background has dark gradient overlay ensuring text readability | CSS `.overlay { background: linear-gradient(to bottom, rgba(19,19,17,0.15), rgba(19,19,17,0.85)) }`. |
| AD1-01 | Background: LIDO infinity pool or exterior tower | nano-banana prompt (see below). CDN fallback: `PARKER_IMAGES.pool`. |
| AD1-02 | Eyebrow: "MOVE IN TODAY" | Template variable for Ad 1. Note: COMPOSITING-SPEC table shows "Limited Offer" — REQUIREMENTS.md is authoritative: "MOVE IN TODAY". |
| AD1-03 | Headline: "Up to 2 Months Free" | Template `<h1>` content for Ad 1. |
| AD1-04 | Subhead: "Net effective from $2,XXX/mo" | Template `<p class="subhead">` content. Actual pricing must be pulled from `PARKER_PRICING` in parker-data.ts. |
| AD1-05 | CTA: "Claim Your Free Month" | Template `.cta-button` text for Ad 1. |
| AD2-01 | Background: Amenities or model suite interior | nano-banana prompt (see below). CDN fallback: `PARKER_IMAGES.amenityCarousel[0]` or `modelSuites[0]`. |
| AD2-02 | Eyebrow: "PARKER AT YONGE + EGLINTON" | Template variable for Ad 2. |
| AD2-03 | Headline: "Forget what you know about rental living." (italic) | Template: `<h1 class="headline"><em>Forget what you know about rental living.</em></h1>`. |
| AD2-04 | Subhead: "Rooftop pool. KitchenAid® suite. 272,000 sq ft of amenities." | Template subhead content for Ad 2. |
| AD2-05 | CTA: "Book a Private Tour" | Template `.cta-button` text for Ad 2. |
| AD3-01 | Background: Exterior tower or Yonge + Eglinton neighbourhood context | nano-banana prompt (see below). CDN fallback: `PARKER_IMAGES.exterior`. |
| AD3-02 | Eyebrow: "TORONTO'S MIDTOWN" | Template variable for Ad 3. |
| AD3-03 | Headline: "Steps from the best of Yonge + Eglinton." | Template `<h1>` content for Ad 3. |
| AD3-04 | Subhead: "Suites from studios to 3-bedroom." | Template subhead content for Ad 3. |
| AD3-05 | CTA: "Explore Suites" | Template `.cta-button` text for Ad 3. |
| AD4-01 | Background: Hero tower exterior (dramatic, dark sky preferred) | nano-banana prompt (see below). CDN fallback: `PARKER_IMAGES.hero`. |
| AD4-02 | Eyebrow: "LIMITED AVAILABILITY" | Template variable for Ad 4. |
| AD4-03 | Headline: "Move in today." | Template `<h1>` content for Ad 4. |
| AD4-04 | Subhead: "Select suites available now. Incentives on." | Template subhead content for Ad 4. |
| AD4-05 | CTA: "Move In Today" | Template `.cta-button` text for Ad 4. |
| AD5-01 | Background: Warmest model suite interior (most inviting, softest light) | nano-banana prompt (see below). CDN fallback: `PARKER_IMAGES.modelSuites[0]`. |
| AD5-02 | Eyebrow: "HAVE QUESTIONS?" | Template variable for Ad 5. |
| AD5-03 | Headline: "Emma can help." | Template `<h1>` content for Ad 5. |
| AD5-04 | Subhead: "Chat with our leasing team — no pressure, just answers." | Template subhead content for Ad 5. |
| AD5-05 | CTA: "Chat with Emma" | Template `.cta-button` text for Ad 5. |
</phase_requirements>

---

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| nano-banana (Gemini CLI ext) | v1.0.12 | AI background generation | Confirmed working in PRE-02 verification; installed at `~/.local/bin/gemini` |
| sharp | latest (install as devDep) | Upscale 768×1376 → 1080×1920, PNG export | Phase 1 spec mandates it; high-quality Lanczos3 resampling |
| playwright | latest (install as devDep) | HTML→PNG screenshot at exact 1080×1920 | Phase 1 spec mandates it; headless Chromium for accurate font rendering |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Google Fonts CDN | — | Load Cormorant Garamond + Plus Jakarta Sans in HTML template | Standard path — `waitForLoadState('networkidle')` in Playwright ensures fonts load |
| sips (macOS built-in) | — | Verify pixel dimensions of output PNGs | After every upscale and every Playwright export |
| Node.js ESM (`.mjs`) | — | Script runner for upscale and composite scripts | No transpilation needed; native ESM import for sharp and playwright |

**Installation (run once in Phase 2, Wave 0):**
```bash
cd /Users/puneetnagpal/development/parker
npm install sharp
npm install -D playwright
npx playwright install chromium
```

---

## Architecture Patterns

### Recommended Project Structure

```
parker/
├── scripts/
│   ├── upscale.mjs          # Stage 2: sharp upscale (shared by all 5 ads)
│   └── composite.mjs        # Stage 4: Playwright screenshot (shared by all 5 ads)
├── nanobanana-output/       # Stage 1 output (already exists, has test PNG)
│   └── dark_luxury_apartment_interior_a.png  (test file from PRE-02)
├── ad-backgrounds/          # Stage 2 output (create in 02-01)
│   ├── ad-01-background.png
│   ├── ad-02-background.png
│   ├── ad-03-background.png
│   ├── ad-04-background.png
│   └── ad-05-background.png
├── ads/                     # Stage 3 HTML templates (one per ad)
│   ├── parker-ad-01-incentives.html
│   ├── parker-ad-02-lifestyle.html
│   ├── parker-ad-03-location.html
│   ├── parker-ad-04-urgency.html
│   └── parker-ad-05-conversational.html
└── dist/                    # Stage 4 final PNG output
    ├── parker-ad-01-incentives.png
    ├── parker-ad-02-lifestyle.png
    ├── parker-ad-03-location.png
    ├── parker-ad-04-urgency.png
    └── parker-ad-05-conversational.png
```

### Pattern 1: Four-Stage Pipeline (repeated for each ad)

**What:** Each ad executes four sequential stages: generate → upscale → template → export.

**When to use:** Every plan in Phase 2 (02-01 through 02-05).

**Stage 1 — nano-banana generation:**
```bash
# Source: COMPOSITING-SPEC.md + NANO-BANANA-VERIFY.md
export PATH="$HOME/.local/bin:$PATH"
cd /Users/puneetnagpal/development/parker
gemini --yolo "/generate '[AD-SPECIFIC PROMPT] vertical portrait 9:16 ratio no text no people no logos no watermarks'"
# Output lands in: ./nanobanana-output/[slug].png
```

**Stage 2 — sharp upscale (scripts/upscale.mjs):**
```javascript
// Source: COMPOSITING-SPEC.md Stage 2
import sharp from 'sharp';
async function upscale(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1080, 1920, { fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}
```

**Stage 3 — HTML template:** Write `ads/parker-ad-XX-name.html` with full template from COMPOSITING-SPEC.md. Substitute per-ad variables (eyebrow, headline, subhead, CTA text, background path).

**Stage 4 — Playwright export (scripts/composite.mjs):**
```javascript
// Source: COMPOSITING-SPEC.md Stage 4
import { chromium } from 'playwright';
async function renderAd(htmlPath, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1920 });
  await page.goto(`file://${path.resolve(htmlPath)}`);
  await page.waitForLoadState('networkidle');
  const screenshot = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 1080, height: 1920 },
  });
  await writeFile(outputPath, screenshot);
  await browser.close();
}
```

### Pattern 2: Per-Ad Template Variable Substitution

**What:** The HTML template is identical for all five ads. Only these variables change:

| Variable | Ad 1 | Ad 2 | Ad 3 | Ad 4 | Ad 5 |
|----------|------|------|------|------|------|
| BACKGROUND_PATH | `../ad-backgrounds/ad-01-background.png` | `../ad-backgrounds/ad-02-background.png` | `../ad-backgrounds/ad-03-background.png` | `../ad-backgrounds/ad-04-background.png` | `../ad-backgrounds/ad-05-background.png` |
| EYEBROW | "MOVE IN TODAY" | "PARKER AT YONGE + EGLINTON" | "TORONTO'S MIDTOWN" | "LIMITED AVAILABILITY" | "HAVE QUESTIONS?" |
| HEADLINE HTML | `Up to 2 Months Free` | `<em>Forget what you know about rental living.</em>` | `Steps from the best of Yonge + Eglinton.` | `Move in today.` | `Emma can help.` |
| SUBHEAD | "Net effective from $2,XXX/mo" | "Rooftop pool. KitchenAid® suite. 272,000 sq ft of amenities." | "Suites from studios to 3-bedroom." | "Select suites available now. Incentives on." | "Chat with our leasing team — no pressure, just answers." |
| CTA TEXT | "Claim Your Free Month" | "Book a Private Tour" | "Explore Suites" | "Move In Today" | "Chat with Emma" |

**Note on Ad 1 pricing:** The subhead says "Net effective from $2,XXX/mo". Pull the actual floor price from `PARKER_PRICING` in `lib/parker-data.ts` before writing the Ad 1 template. Do not fabricate a price.

**Note on COMPOSITING-SPEC eyebrow discrepancy:** The per-ad table in COMPOSITING-SPEC.md lists different eyebrow values ("Limited Offer", "Luxury Living", etc.) than REQUIREMENTS.md. REQUIREMENTS.md is the authoritative source. Use the values from REQUIREMENTS.md (shown in the table above).

### Pattern 3: Shared Scripts — Create Once, Reference Five Times

**What:** `scripts/upscale.mjs` and `scripts/composite.mjs` are created in plan 02-01 and reused unchanged in 02-02 through 02-05. Each plan passes different input/output paths.

**When to use:** Plans 02-02 through 02-05 do not re-create these scripts — they reference them directly.

### Anti-Patterns to Avoid

- **Don't set `--aspect=9:16` as a CLI flag.** nanobanana v1.0.12 does not support it. Aspect ratio goes inside the `/generate` prompt text only.
- **Don't use `page.screenshot()` without `clip`.** Without `clip`, Playwright may capture a larger viewport. Always pass `clip: { x: 0, y: 0, width: 1080, height: 1920 }`.
- **Don't use CDN photo URLs as `<img src>`.** The HTML template loads locally. Background images must be local file paths relative to the HTML file. The CDN photos (if rights confirmed) also need to be downloaded to disk first.
- **Don't use `@tailwind` or Next.js conventions in the ad HTML templates.** These are standalone HTML files — no framework, plain CSS only.
- **Don't hardcode a price in Ad 1 subhead without checking `PARKER_PRICING`.** The net effective floor price is in `lib/parker-data.ts`.

---

## Per-Ad Background Prompts

Derived from ad descriptions, brand voice, and COMPOSITING-SPEC example patterns.

### Ad 1 — Incentives (pool or exterior tower)
```
luxury Toronto condominium LIDO infinity pool 38th floor overlooking midtown skyline at golden hour, compositional negative space upper third for text overlay, warm amber light reflecting on still water, deep charcoal shadows in foreground, editorial architectural photography style, vertical portrait 9:16 ratio no text no people no logos no watermarks
```

### Ad 2 — Lifestyle / Amenities (interior amenities)
```
luxury condominium interior amenity space Nordic-inspired design warm ambient lighting, high ceilings open common area with lounge seating, soft diffused light from floor-to-ceiling windows, editorial interior photography style, compositional negative space lower half for text overlay, vertical portrait 9:16 ratio no text no people no logos no watermarks
```

### Ad 3 — Location (exterior or neighbourhood)
```
modern luxury residential tower rising above Toronto midtown neighbourhood at dusk, Yonge and Eglinton intersection visible below, urban street life architectural exterior photography, dramatic twilight sky deep blue and charcoal, warm building lights, compositional negative space upper third for text overlay, vertical portrait 9:16 ratio no text no people no logos no watermarks
```

### Ad 4 — Urgency (dramatic exterior, dark sky)
```
dramatic luxury condominium tower exterior at night under deep midnight sky, bold architectural lines, dark textured concrete and glass facade, ambient city glow from below, high contrast editorial architecture photography, dark cinematic tone, vertical portrait 9:16 ratio no text no people no logos no watermarks
```

### Ad 5 — Conversational (warmest model suite interior)
```
warm inviting luxury apartment model suite interior, soft morning light streaming through floor-to-ceiling windows, neutral warm tones cream and linen, KitchenAid appliances visible, 9 foot ceilings, cozy lived-in editorial interior photography, compositional negative space lower half for text overlay, vertical portrait 9:16 ratio no text no people no logos no watermarks
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image upscaling/cropping to exact dimensions | Custom canvas/resize scripts | `sharp` with `fit: 'cover'` | Handles aspect ratio mismatch, Lanczos3 quality, PNG compression in one call |
| HTML→PNG rendering with web fonts | puppeteer from scratch, ImageMagick, Cairo | Playwright + `waitForLoadState('networkidle')` | `networkidle` ensures Google Fonts load before screenshot; exact viewport control |
| Font availability offline | Re-embed fonts via base64 in CSS | Download TTF files + `file://` path in `<link>` | Simpler, faster, reliable in CI without internet |
| Dimension verification | Pixel-reading scripts | `sips -g pixelWidth -g pixelHeight` (macOS built-in) | Zero dependencies, exact result |

**Key insight:** The entire pipeline was designed in Phase 1 to avoid hand-rolled solutions. Follow the spec exactly — do not improvise tooling.

---

## Common Pitfalls

### Pitfall 1: Google Fonts Timeout in Playwright
**What goes wrong:** `waitForLoadState('networkidle')` hangs or times out if Google Fonts CDN is slow or rate-limited, causing the screenshot to render with system fallback fonts instead of Cormorant Garamond.
**Why it happens:** Playwright's `networkidle` waits for all pending network requests. Google Fonts fires multiple requests.
**How to avoid:** Add a `page.waitForTimeout(2000)` after `networkidle` as a safety buffer, OR download the TTF files and use `file://` paths in the `<link>` tag. The COMPOSITING-SPEC recommends local TTF as the offline/CI path.
**Warning signs:** Headlines appear in a generic serif or sans-serif. Attribution text line height looks wrong.

### Pitfall 2: Background Image Path Resolution
**What goes wrong:** The `<img class="bg" src="[PATH]">` in the HTML template uses a path that resolves from the HTML file's location, not from the working directory. A path like `../ad-backgrounds/ad-01-background.png` only works if the HTML is in `ads/` and the backgrounds are in `ad-backgrounds/`.
**Why it happens:** `file://` URL resolution is relative to the HTML document.
**How to avoid:** Use absolute `file://` paths in the HTML template, OR maintain the directory structure exactly as specified (HTML in `ads/`, backgrounds in `ad-backgrounds/`).
**Warning signs:** Background renders as dark `#131311` fallback with no image visible.

### Pitfall 3: Viewport vs. Canvas Size Mismatch
**What goes wrong:** Output PNG is not exactly 1080×1920 even though `setViewportSize` was called.
**Why it happens:** Some Chromium builds apply device pixel ratio scaling. Without the `clip` parameter, the screenshot may be a different size.
**How to avoid:** Always include `clip: { x: 0, y: 0, width: 1080, height: 1920 }` in `page.screenshot()`. Verify with `sips` after every export.
**Warning signs:** `sips` reports pixelWidth: 2160 (2x DPR applied) or pixelWidth other than 1080.

### Pitfall 4: Eyebrow Value Discrepancy Between Spec and Requirements
**What goes wrong:** COMPOSITING-SPEC.md has a per-ad table with eyebrow values ("Limited Offer", "Luxury Living", etc.) that differ from REQUIREMENTS.md ("MOVE IN TODAY", "PARKER AT YONGE + EGLINTON", etc.).
**Why it happens:** The spec table was written as a placeholder; the requirements doc has the final copy.
**How to avoid:** REQUIREMENTS.md is authoritative for all ad copy. Ignore the eyebrow column in the COMPOSITING-SPEC table.

### Pitfall 5: Ad 1 Subhead Price Fabrication
**What goes wrong:** Ad 1 subhead reads "Net effective from $2,XXX/mo" — a planner might hard-code a made-up price.
**Why it happens:** The placeholder format invites substitution without checking.
**How to avoid:** Read `PARKER_PRICING` from `lib/parker-data.ts` before writing the Ad 1 HTML. Use the actual net effective floor price from the data.

### Pitfall 6: nano-banana Output Filename is Unpredictable
**What goes wrong:** nano-banana names the output file based on the first words of the prompt. You can't predict the exact filename in advance.
**Why it happens:** The extension auto-derives a slug from the prompt text.
**How to avoid:** After each `gemini --yolo /generate` call, list `./nanobanana-output/` sorted by modification time and take the newest file. Then rename it to `ad-0X-raw.png` before passing to the upscale script.

---

## Code Examples

### Full HTML Template (from COMPOSITING-SPEC.md)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1920px; overflow: hidden; background: #131311; position: relative; }
    .bg { position: absolute; inset: 0; width: 1080px; height: 1920px; object-fit: cover; }
    .overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom,
        rgba(19,19,17,0.15) 0%,
        rgba(19,19,17,0.55) 55%,
        rgba(19,19,17,0.85) 100%);
    }
    .safe-zone {
      position: absolute; left: 90px; top: 250px;
      width: 900px; height: 1286px;
      display: flex; flex-direction: column;
    }
    .logo { margin-top: 20px; height: 40px; width: auto; object-fit: contain; object-position: left center; }
    .content { margin-top: auto; margin-bottom: 120px; }
    .accent-rule { width: 40px; height: 2px; background: #E85B3A; margin-bottom: 16px; }
    .eyebrow {
      font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
      font-size: 26px; letter-spacing: 0.25em; text-transform: uppercase;
      color: rgba(255,255,255,0.75); margin-bottom: 20px;
    }
    .headline {
      font-family: 'Cormorant Garamond', serif; font-weight: 400;
      font-size: 108px; line-height: 1.0; letter-spacing: -0.01em;
      color: #FFFEFB; margin-bottom: 28px;
    }
    .headline em { font-style: italic; }
    .subhead {
      font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 300;
      font-size: 30px; line-height: 1.45; color: rgba(255,255,255,0.80);
      margin-bottom: 48px; max-width: 780px;
    }
    .cta-button {
      display: inline-block; background: #E85B3A; color: #FFFEFB;
      font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;
      font-size: 26px; letter-spacing: 0.12em; text-transform: uppercase;
      padding: 22px 48px; border-radius: 0; text-decoration: none; width: fit-content;
    }
    .attribution {
      position: absolute; left: 90px; bottom: 384px; width: 900px;
      font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 400;
      font-size: 19px; letter-spacing: 0.15em;
      color: rgba(255,255,255,0.50); text-align: center;
    }
  </style>
</head>
<body>
  <img class="bg" src="[ABSOLUTE_BACKGROUND_PATH]" alt="">
  <div class="overlay"></div>
  <div class="safe-zone">
    <img class="logo" src="https://fitzrovia.ca/app/uploads/2021/05/02_parker_logo.svg" alt="Parker">
    <div class="content">
      <div class="accent-rule"></div>
      <div class="eyebrow">[EYEBROW]</div>
      <h1 class="headline">[HEADLINE HTML]</h1>
      <p class="subhead">[SUBHEAD]</p>
      <div class="cta-button">[CTA TEXT]</div>
    </div>
  </div>
  <div class="attribution">
    Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage
  </div>
</body>
</html>
```

### QA Verification Commands
```bash
# After upscale (Stage 2):
sips -g pixelWidth -g pixelHeight /Users/puneetnagpal/development/parker/ad-backgrounds/ad-01-background.png
# Expected: pixelWidth: 1080 / pixelHeight: 1920

# After Playwright export (Stage 4):
sips -g pixelWidth -g pixelHeight /Users/puneetnagpal/development/parker/dist/parker-ad-01-incentives.png
# Expected: pixelWidth: 1080 / pixelHeight: 1920

# File size check:
ls -lh /Users/puneetnagpal/development/parker/dist/parker-ad-01-incentives.png
# Expected: under 30MB (sharp PNG-9 typically produces ≤5MB)

# All five at once:
for f in /Users/puneetnagpal/development/parker/dist/parker-ad-*.png; do
  echo "$f:"; sips -g pixelWidth -g pixelHeight "$f"; done
```

### Get Newest nano-banana Output
```bash
# After running gemini --yolo /generate, find the newest file:
ls -t /Users/puneetnagpal/development/parker/nanobanana-output/*.png | head -1
```

---

## Brand Constants (apply unchanged to all 5 ads)

| Element | Value | Source |
|---------|-------|--------|
| Canvas size | 1080×1920 px | SPEC-01 |
| Safe zone X | 90–990 px | COMPOSITING-SPEC.md |
| Safe zone Y | 250–1536 px | COMPOSITING-SPEC.md |
| Attribution Y position | `bottom: 384px` (= y=1536 from top) | COMPOSITING-SPEC.md |
| Background base color | `#131311` | COMPOSITING-SPEC.md |
| CTA button fill | `#E85B3A` | SPEC-05 |
| CTA button radius | `0` (no border-radius) | SPEC-05 |
| Headline font | Cormorant Garamond 400, 108px | SPEC-06 |
| Headline italic | Cormorant Garamond 400 italic (use `<em>`) | SPEC-06 |
| Eyebrow font | Plus Jakarta Sans 500, 26px, uppercase, 0.25em tracking | SPEC-07 |
| Subhead font | Plus Jakarta Sans 300, 30px | SPEC-07 |
| CTA label font | Plus Jakarta Sans 600, 26px, uppercase, 0.12em tracking | SPEC-07 |
| Attribution font | Plus Jakarta Sans 400, 19px, 0.15em tracking | SPEC-03 |
| Attribution color | `rgba(255,255,255,0.50)` | RECO-ATTRIBUTION.md |
| Attribution text (verbatim) | `Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage` | RECO-ATTRIBUTION.md |
| Accent rule | 40×2px, `#E85B3A` | COMPOSITING-SPEC.md |
| Parker logo URL | `https://fitzrovia.ca/app/uploads/2021/05/02_parker_logo.svg` | lib/parker-data.ts |
| Background source | nano-banana AI (CDN pending written rights) | PHOTO-RIGHTS.md |
| Output format | PNG, sRGB | SPEC-01 |
| Output path | `dist/parker-ad-0X-name.png` | ROADMAP.md |

---

## Plan Execution Strategy

### Sequential or Parallel?

The five ad plans (02-01 through 02-05) are **structurally parallel** — each plan is
self-contained and does not depend on any other ad plan's output. However, given:
- Shared script creation (02-01 creates `scripts/upscale.mjs` and `scripts/composite.mjs`)
- Sequential verification is simpler to debug
- nano-banana outputs to a shared directory (race condition risk if parallel)

**Recommendation: Sequential execution, 02-01 → 02-02 → 02-03 → 02-04 → 02-05.**

Plan 02-01 is a slightly larger plan because it also creates the shared scripts. Plans 02-02 through 02-05 are shorter because they only write the per-ad template and run the already-validated pipeline.

### Per-Plan Task Pattern (identical for all 5)

Each plan contains the same four tasks in the same order:

1. **Generate background** — run `gemini --yolo /generate` with ad-specific prompt, rename newest output to `ad-0X-raw.png`
2. **Upscale to 1080×1920** — run `scripts/upscale.mjs` with input `ad-0X-raw.png`, output `ad-backgrounds/ad-0X-background.png`, verify with `sips`
3. **Write HTML template** — create `ads/parker-ad-0X-name.html` with per-ad variables substituted from the table above
4. **Playwright export + QA** — run `scripts/composite.mjs`, export to `dist/parker-ad-0X-name.png`, verify dimensions with `sips`, run QA checklist

Plan 02-01 has a fifth task at the start: **Wave 0 setup** — install sharp and playwright, create `scripts/` directory, create shared scripts.

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Figma compositing | Playwright HTML/CSS | Decided in Phase 1 — Figma not used in this workflow |
| Figma template | Standalone HTML file per ad | No Next.js/Tailwind in ad templates — plain HTML |
| CDN photos as backgrounds | nano-banana AI generation | CDN rights verbally confirmed but written rights pending |
| `--aspect=9:16` CLI flag | Prompt text "vertical portrait 9:16 ratio" | nanobanana v1.0.12 does not support `--aspect` flag |

---

## Open Questions

1. **SPEC-03 attribution size: "22pt" vs 19px**
   - What we know: REQUIREMENTS.md says "minimum 22pt". COMPOSITING-SPEC.md and RECO-ATTRIBUTION.md both specify 19px at 1080px canvas (which ≈ 14–15pt on phone). The spec was written by the Phase 1 planner with awareness of both.
   - What's unclear: At 1080px canvas, 19px is the print-equivalent of ~14pt, not 22pt. If "22pt" in REQUIREMENTS.md means pt at phone-screen resolution, 19px at 1080px canvas may fall short.
   - Recommendation: Use the higher value in the HTML template: bump attribution font-size to 28px (≈22pt at phone-screen density). This satisfies both the REQUIREMENTS.md "22pt" constraint and RECO legibility requirements. The planner should confirm this in 02-01.

2. **Fitzrovia CDN photo rights — written confirmation still pending**
   - What we know: Verbal confirmation received (2026-03-15). Written confirmation not yet received or pasted into PHOTO-RIGHTS.md.
   - What's unclear: Whether written confirmation will arrive before Phase 2 begins.
   - Recommendation: Proceed with nano-banana AI backgrounds for all five ads. If written confirmation arrives during Phase 2, CDN photos can be substituted by re-running Stage 2 (sharp upscale from CDN download) and Stage 3–4 (re-render HTML and re-export). The pipeline makes this trivial.

3. **Parker logo rendering: SVG from CDN in `<img>` tag**
   - What we know: The logo URL is `https://fitzrovia.ca/app/uploads/2021/05/02_parker_logo.svg`. Playwright will need to fetch this over the network.
   - What's unclear: Whether Playwright's `networkidle` wait covers the logo SVG fetch, or whether the logo fails silently.
   - Recommendation: Download the logo SVG once in Wave 0 setup (plan 02-01) and reference it as a local `file://` path in all templates. This eliminates the CDN dependency for the logo fetch.

---

## Sources

### Primary (HIGH confidence)
- `.planning/phases/01-pre-production/COMPOSITING-SPEC.md` — full pipeline spec, HTML template, CSS values, safe zone coordinates, brand constants
- `.planning/phases/01-pre-production/NANO-BANANA-VERIFY.md` — confirmed CLI command, verified output dimensions (768×1376), canonical usage
- `.planning/phases/01-pre-production/RECO-ATTRIBUTION.md` — confirmed attribution string verbatim, CSS properties, placement guidelines
- `.planning/REQUIREMENTS.md` — authoritative ad copy for all 5 ads (eyebrow, headline, subhead, CTA per ad)
- `lib/parker-data.ts` — Parker logo URL, CDN image inventory, pricing data

### Secondary (MEDIUM confidence)
- `.planning/phases/01-pre-production/PHOTO-RIGHTS.md` — photo rights status (verbal confirmed, written pending)
- `.planning/phases/01-pre-production/META-HOUSING-BRIEF.md` — campaign handoff requirements (Phase 3 context)
- `.planning/ROADMAP.md` — phase success criteria, plan structure, output file naming

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tools confirmed working in Phase 1 (nano-banana verified, sharp/playwright specified in COMPOSITING-SPEC)
- Architecture: HIGH — four-stage pipeline fully specified in COMPOSITING-SPEC.md, no decisions remain
- Ad copy: HIGH — all five ads fully specified in REQUIREMENTS.md with eyebrow, headline, subhead, CTA
- Background prompts: MEDIUM — derived from ad descriptions and COMPOSITING-SPEC example; exact AI output is non-deterministic, may need iteration
- Attribution size: MEDIUM — minor discrepancy between REQUIREMENTS.md (22pt) and COMPOSITING-SPEC (19px); flagged in Open Questions

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (pipeline tooling is stable; nano-banana version pinned at v1.0.12)
