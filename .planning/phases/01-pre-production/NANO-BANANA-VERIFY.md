# nano-banana CLI Verification

**Status:** PASS
**Date verified:** 2026-03-15
**Requirement ID:** PRE-02

## Setup Check Results

| Check | Result |
|-------|--------|
| gemini in PATH | PASS — installed at `~/.local/bin/gemini` v0.33.1 |
| nano-banana extension | PASS — nanobanana v1.0.12 installed and enabled |
| GEMINI_API_KEY | PASS — configured in environment |

## Test Generation

**Canonical command (confirmed from SKILL.md — `--aspect` flag NOT supported by this extension version):**
```
gemini --yolo "/generate '[PROMPT describing 9:16 vertical portrait orientation in text]'"
```

**Note:** The `--aspect=9:16` flag is invalid for nanobanana v1.0.12. Aspect ratio is requested via prompt text instead (e.g. "vertical portrait 9:16 ratio").

**Test command run:**
```bash
gemini --yolo "/generate 'dark luxury apartment interior architectural photography no people no text vertical portrait 9:16 ratio moody warm lighting'"
```

**Result:** SUCCESS — 1 image generated
**Output file:** `./nanobanana-output/dark_luxury_apartment_interior_a.png`

## Dimension Check

| File | Width | Height | Aspect | Pass/Fail |
|------|-------|--------|--------|-----------|
| dark_luxury_apartment_interior_a.png | 768px | 1376px | ~9:16 | PASS |

Output is 768×1376 (near-9:16). Phase 2 pipeline will upscale/crop to exact 1080×1920 using `sharp` before export.

## Production Command (Phase 2 Reference)

```bash
export PATH="$HOME/.local/bin:$PATH"
cd /Users/puneetnagpal/development/parker
gemini --yolo "/generate '[PROMPT] vertical portrait 9:16 ratio no text no people'"
```

For multiple variations:
```bash
gemini --yolo "/generate '[PROMPT] vertical portrait 9:16 ratio no text no people' --count=3"
```

Key flags:
- `--yolo` — required, auto-approves all tool actions
- `--count=N` — optional, 1–8 variations
- ~~`--aspect=9:16`~~ — NOT supported in v1.0.12; use prompt text instead

Output lands in: `./nanobanana-output/` (relative to working directory)

## Compositing Approach: Playwright HTML/CSS (replaces Figma)

Since the user does not use Figma, Phase 2 will use **Playwright** to composite ads:
1. nano-banana generates background PNG (~768×1376)
2. `sharp` upscales/crops to 1080×1920
3. HTML/CSS template applies Parker brand (fonts, colors, text, CTA button, logo)
4. Playwright screenshots the HTML at 1080×1920 → final PNG

This is fully automated, requires no GUI, and produces pixel-perfect results.

## Status Gate

- [x] Gemini CLI in PATH — PASS (v0.33.1 at ~/.local/bin/gemini)
- [x] nano-banana extension installed — PASS (v1.0.12)
- [x] GEMINI_API_KEY configured — PASS
- [x] Test generation produced at least one file — PASS
- [x] Output is near 9:16 aspect ratio — PASS (768×1376, upscale to 1080×1920 in pipeline)
