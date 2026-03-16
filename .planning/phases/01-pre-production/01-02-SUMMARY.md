---
phase: 01-pre-production
plan: 02
subsystem: infra
tags: [nano-banana, gemini-cli, playwright, sharp, meta-ads, reco, instagram-stories, compositing]

requires:
  - phase: 01-pre-production plan 01
    provides: PHOTO-RIGHTS.md and RECO-ATTRIBUTION.md (PRE-01, PRE-03 gates)

provides:
  - NANO-BANANA-VERIFY.md: CLI verification record, confirmed working, exact production command
  - META-HOUSING-BRIEF.md: Meta Housing Special Ad Category campaign handoff doc (PRE-04)
  - COMPOSITING-SPEC.md: Playwright HTML/CSS compositing pipeline spec for all 5 ads

affects:
  - phase-02 (all ad generation plans depend on NANO-BANANA-VERIFY.md and COMPOSITING-SPEC.md)
  - phase-03 (campaign handoff uses META-HOUSING-BRIEF.md as PRE-04 gate)

tech-stack:
  added:
    - gemini CLI v0.33.1 (~/.local/bin/gemini) — nano-banana background generation
    - nanobanana extension v1.0.12 — Gemini CLI extension for image generation
    - sharp (planned Phase 2 install) — PNG upscale/crop to 1080x1920
    - playwright (planned Phase 2 install) — Playwright Chromium for HTML/CSS screenshot export
  patterns:
    - "Background-first generation: nano-banana generates background PNG, all brand elements composited in code"
    - "Four-stage pipeline: generate → upscale → HTML/CSS template → Playwright screenshot"
    - "Safe zone enforcement: x=90–990, y=250–1536 coded into CSS template"
    - "RECO attribution verbatim in every HTML template — never optional"

key-files:
  created:
    - .planning/phases/01-pre-production/NANO-BANANA-VERIFY.md
    - .planning/phases/01-pre-production/META-HOUSING-BRIEF.md
    - .planning/phases/01-pre-production/COMPOSITING-SPEC.md
  modified: []

key-decisions:
  - "Playwright HTML/CSS compositing replaces Figma — user does not use Figma, code pipeline is fully automated"
  - "nano-banana canonical command confirmed: gemini --yolo '/generate [PROMPT] vertical portrait 9:16 ratio no text no people' (NO --aspect flag)"
  - "Four-stage pipeline: nano-banana → sharp → HTML/CSS template → Playwright screenshot at 1080x1920"
  - "Google Fonts CDN in HTML template for Cormorant Garamond + Plus Jakarta Sans; local TTF fallback documented for offline/CI"
  - "CTA button: border-radius 0 (sharp corners) — matches Parker brand, no border-radius anywhere"

patterns-established:
  - "COMPOSITING-SPEC.md is the single source of truth for all Phase 2 HTML/CSS template values"
  - "META-HOUSING-BRIEF.md is the campaign manager handoff — do not configure targeting before reading it"
  - "Attribution string is immutable: 'Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage'"

requirements-completed: [PRE-02, PRE-04]

duration: 10min
completed: 2026-03-15
---

# Phase 1 Plan 02: Pre-Production Setup Summary

**nano-banana CLI verified working + Playwright HTML/CSS four-stage compositing pipeline spec + Meta Housing ad category handoff doc — all Phase 2 production gates cleared**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-15T23:48:28Z
- **Completed:** 2026-03-15T23:58:00Z
- **Tasks:** 3 (Tasks 1 and 2 completed in prior session; Task 3 completed this session)
- **Files modified:** 3 created

## Accomplishments

- nano-banana CLI verified end-to-end: gemini v0.33.1 at `~/.local/bin/gemini`, nanobanana extension v1.0.12 installed, test image generated successfully
- Meta Housing Special Ad Category brief (PRE-04) written — campaign manager has step-by-step instructions and cannot miss the Housing category selector
- COMPOSITING-SPEC.md written with full Playwright HTML/CSS four-stage pipeline: nano-banana background → sharp upscale → HTML/CSS brand template → Playwright 1080×1920 PNG export

## Task Commits

Each task was committed atomically:

1. **Task 1: Run nano-banana test generation and write NANO-BANANA-VERIFY.md** - `cef1a09` + `d29a398` (docs)
2. **Task 2: Verify nano-banana output (checkpoint)** — human confirmed: `figma-ready — CLI works`
3. **Task 3a: Write META-HOUSING-BRIEF.md** - `8901d8c` (docs)
3. **Task 3b: Write COMPOSITING-SPEC.md** - `db7871b` (docs)

## Files Created/Modified

- `.planning/phases/01-pre-production/NANO-BANANA-VERIFY.md` — CLI verification record (PRE-02 gate, confirmed PASS)
- `.planning/phases/01-pre-production/META-HOUSING-BRIEF.md` — Meta Housing Special Ad Category handoff (PRE-04 gate)
- `.planning/phases/01-pre-production/COMPOSITING-SPEC.md` — Playwright HTML/CSS compositing pipeline spec for all 5 Phase 2 ads

## Decisions Made

- **Playwright replaces Figma:** User confirmed no Figma in workflow. FIGMA-TEMPLATE-SPEC.md renamed to COMPOSITING-SPEC.md and redesigned as a fully automated four-stage code pipeline. No manual design tool steps.
- **nano-banana canonical command locked:** `gemini --yolo "/generate '[PROMPT] vertical portrait 9:16 ratio no text no people'"` — no `--aspect` flag (prompt language only). User confirmed from direct CLI testing.
- **sharp for upscaling:** Lanczos3 resampling from ~768×1376 native output to 1080×1920 exact canvas size.
- **Playwright Chromium for screenshot export:** `page.setViewportSize({ width: 1080, height: 1920 })` + `page.screenshot()` — zero external dependencies beyond npm.
- **CTA button: border-radius 0:** Sharp corners throughout, matching Parker brand.

## Deviations from Plan

### Architecture Deviation (Rule 4 — User Decision)

**FIGMA-TEMPLATE-SPEC.md replaced with COMPOSITING-SPEC.md (Playwright HTML/CSS pipeline)**
- **Found during:** Task 3 (user response before execution)
- **User decision:** User does not use Figma and prefers a fully automated code pipeline
- **Change:** Replaced Figma canvas setup instructions with a four-stage automated pipeline: nano-banana → sharp → HTML/CSS template → Playwright screenshot export
- **Impact:** Phase 2 plans will call `scripts/upscale.mjs` and `scripts/composite.mjs` instead of requiring manual Figma work. Fully automatable, reproducible, CI-compatible.
- **Files created:** `COMPOSITING-SPEC.md` (instead of `FIGMA-TEMPLATE-SPEC.md`)

---

**Total deviations:** 1 architectural (user-directed)
**Impact on plan:** Significant improvement — pipeline is now fully automated, no human design tool steps required for Phase 2 production.

## Issues Encountered

None — once the Playwright approach was confirmed, execution was straightforward.

## User Setup Required

None for this plan. Phase 2 will require:
- `npm install sharp` (upscaling)
- `npm install -D playwright && npx playwright install chromium` (screenshot export)
- Google Fonts available (or local TTF files if offline)

## Next Phase Readiness

All Phase 1 pre-production gates are now cleared:
- PRE-01: Fitzrovia photo rights — verbal confirmation documented (PHOTO-RIGHTS.md)
- PRE-02: nano-banana CLI — confirmed working (NANO-BANANA-VERIFY.md, Status: PASS)
- PRE-03: RECO attribution string — locked (RECO-ATTRIBUTION.md)
- PRE-04: Meta Housing brief — written (META-HOUSING-BRIEF.md)

Phase 2 can begin immediately. The compositing pipeline (COMPOSITING-SPEC.md) is the implementation reference for all 5 ad generation plans. No blockers.

---
*Phase: 01-pre-production*
*Completed: 2026-03-15*
