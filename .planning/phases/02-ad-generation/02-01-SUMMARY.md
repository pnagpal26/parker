---
phase: 02-ad-generation
plan: "01"
subsystem: infra
tags: [playwright, sharp, html-compositing, instagram-ads, nano-banana]

# Dependency graph
requires:
  - phase: 01-pre-production
    provides: COMPOSITING-SPEC, RECO-ATTRIBUTION, NANO-BANANA-VERIFY, parker-data.ts pricing
provides:
  - scripts/upscale.mjs — Sharp 1080x1920 upscale stage (shared by all 5 ad plans)
  - scripts/composite.mjs — Playwright HTML screenshot stage (shared by all 5 ad plans)
  - ads/parker-logo.svg — local white logo (shared by all 5 HTML templates)
  - ad-backgrounds/ad-01-background.png — upscaled 1080x1920 background for Ad 1
  - ads/parker-ad-01-incentives.html — composited brand template for Ad 1
  - dist/parker-ad-01-incentives.png — final 1080x1920 PNG for Ad 1
affects:
  - 02-02, 02-03, 02-04, 02-05 (all depend on shared scripts + local logo from this plan)

# Tech tracking
tech-stack:
  added: [sharp, playwright, playwright-chromium]
  patterns: [four-stage pipeline (nano-banana → sharp → HTML/CSS → Playwright), absolute file:// paths in HTML for Playwright, Google Fonts via CDN with 2s safety buffer]

key-files:
  created:
    - scripts/upscale.mjs
    - scripts/composite.mjs
    - ads/parker-logo.svg
    - ads/parker-ad-01-incentives.html
    - ad-backgrounds/ad-01-background.png
    - dist/parker-ad-01-incentives.png
  modified:
    - package.json (sharp + playwright added)

key-decisions:
  - "Logo height set to 100px (250% of original 40px) per visual QA feedback"
  - "Attribution font-size: 28px (~22pt at phone density) satisfies SPEC-03 RECO requirement"
  - "Absolute file:// paths for background + logo in HTML templates avoids relative path issues in Playwright"
  - "Google Fonts CDN with waitForTimeout(2000) safety buffer — confirmed rendering correctly in output"

patterns-established:
  - "Pattern 1: All ad HTML templates use absolute file:// paths for local assets (bg image + logo)"
  - "Pattern 2: scripts/composite.mjs renderAd() is the single export used by all 5 ad plans"
  - "Pattern 3: scripts/upscale.mjs upscale() is the single export used by all 5 ad plans"
  - "Pattern 4: dist/ receives final PNGs, ad-backgrounds/ receives upscaled backgrounds, ads/ contains HTML templates"

requirements-completed: [SPEC-01, SPEC-02, SPEC-03, SPEC-04, SPEC-05, SPEC-06, SPEC-07, SPEC-08, AD1-01, AD1-02, AD1-03, AD1-04, AD1-05]

# Metrics
duration: ~45min
completed: 2026-03-15
---

# Phase 2 Plan 01: Ad Generation Pipeline + Ad 1 Incentives Summary

**Four-stage ad production pipeline (nano-banana → Sharp upscale → HTML/CSS → Playwright PNG) installed and validated; Ad 1 Incentives delivered at 1080x1920 with correct copy, RECO attribution, and brand typography**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-15T20:00:00Z
- **Completed:** 2026-03-15T20:51:00Z
- **Tasks:** 4 (Tasks 1–3 auto, Task 4 human-verify with fix iteration)
- **Files modified:** 8

## Accomplishments

- Installed sharp + playwright (chromium) and created shared scripts/upscale.mjs and scripts/composite.mjs used by all 5 ad plans
- Generated AI background (LIDO infinity pool) via nano-banana, upscaled to exactly 1080x1920 using lanczos3 resampling
- Composited full brand layer (logo, eyebrow, headline, subhead, CTA, RECO attribution) over background using HTML/CSS + Playwright screenshot
- Passed visual QA after fixing logo size from 40px to 100px per reviewer feedback (250% increase)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install pipeline deps + shared scripts** - `df6751b` (feat)
2. **Task 2: Generate Ad 1 background + upscale** - `bf755a3` (feat)
3. **Task 3: Write Ad 1 HTML template + Playwright export** - `aa4897b` (feat)
4. **Task 4 fix: Increase Parker logo size 250%** - `eada784` (fix)

## Files Created/Modified

- `scripts/upscale.mjs` — Sharp 1080x1920 upscale with lanczos3, shared by all 5 ad plans
- `scripts/composite.mjs` — Playwright HTML screenshot at 1080x1920 with clip, shared by all 5 ad plans
- `ads/parker-logo.svg` — Local copy of Parker white logo downloaded from fitzrovia.ca CDN
- `ads/parker-ad-01-incentives.html` — Ad 1 composited brand template with absolute file:// paths
- `ad-backgrounds/ad-01-background.png` — AI background upscaled to exactly 1080x1920
- `nanobanana-output/ad-01-raw.png` — Raw nano-banana output before upscaling
- `dist/parker-ad-01-incentives.png` — Final 1080x1920 PNG, 1.8MB, visually approved
- `package.json` — sharp (dependency) + playwright (devDependency) added

## Decisions Made

- Logo height set to 100px (250% increase from 40px) after visual QA reviewer flagged logo was too small
- Attribution rendered at 28px font-size (~22pt at screen density), satisfying SPEC-03 RECO legibility requirement
- Google Fonts CDN used with 2-second waitForTimeout buffer in composite.mjs — fonts confirmed rendering correctly in output PNG

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Parker logo too small for ad dimensions**
- **Found during:** Task 4 (Visual QA — Ad 1 Incentives)
- **Issue:** Logo was 40px tall — barely visible at 1080px ad width; reviewer requested at least 250% larger
- **Fix:** Increased `.logo` height from 40px to 100px in ads/parker-ad-01-incentives.html, re-ran Playwright export
- **Files modified:** ads/parker-ad-01-incentives.html, dist/parker-ad-01-incentives.png
- **Verification:** PNG regenerated at 1080x1920, logo visibly prominent in output
- **Committed in:** eada784 (fix(02-01): increase Parker logo size 250% on Ad 1)

---

**Total deviations:** 1 auto-fixed (1 visual QA fix — logo size)
**Impact on plan:** Fix was required for ad to pass visual QA before approval. No scope creep.

## Issues Encountered

None beyond the logo size fix captured above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Shared pipeline (upscale.mjs, composite.mjs, parker-logo.svg) is proven and ready for Ads 2-5
- Ad 1 (parker-ad-01-incentives.png) is approved and ready for upload to Meta Ads Manager
- Ads 2-5 can proceed using identical pipeline structure — only the HTML template and background differ per ad

## Self-Check: PASSED

All key files verified present:
- ads/parker-ad-01-incentives.html
- dist/parker-ad-01-incentives.png
- scripts/upscale.mjs
- scripts/composite.mjs
- ads/parker-logo.svg

All task commits verified in git log:
- eada784 (logo size fix)
- aa4897b (Task 3 — HTML template + Playwright export)

---
*Phase: 02-ad-generation*
*Completed: 2026-03-15*
