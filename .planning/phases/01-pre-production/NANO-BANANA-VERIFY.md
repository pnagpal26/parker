# nano-banana CLI Verification

**Status:** FAIL — gemini CLI not installed
**Date verified:** 2026-03-15
**Requirement ID:** PRE-02

## Setup Check Results

| Check | Result |
|-------|--------|
| gemini in PATH | NO — `which gemini` returns "gemini not found"; binary not present at any standard location |
| nano-banana extension | UNKNOWN — cannot check extensions without gemini CLI installed |
| GEMINI_API_KEY | SET — `$GEMINI_API_KEY` is configured in the environment |

## Test Generation

**Command that would be used (from SKILL.md canonical form):**
```
gemini --yolo "/generate 'dark luxury interior architecture, vertical portrait orientation, deep shadows, no text, no people, no logos, no watermarks'" --aspect=9:16
```

**Result:** NOT ATTEMPTED — gemini CLI binary is not installed. The GEMINI_API_KEY is set, but the CLI itself (`gemini`) is not available in PATH or at any standard binary location (`/usr/local/bin`, `/opt/homebrew/bin`, `~/.local/bin`, `~/.bun/bin`).

**Output file(s):** None — `./nanobanana-output/` directory does not exist.

## Dimension Check

| File | Width | Height | Aspect | Pass/Fail |
|------|-------|--------|--------|-----------|
| (no output produced) | — | — | — | FAIL |

## Production Command (Phase 2 Reference)

Canonical command pattern confirmed from SKILL.md (to be used once gemini CLI is installed):

```
gemini --yolo "/generate '[PROMPT]'" --aspect=9:16
```

For multiple variations:
```
gemini --yolo "/generate '[PROMPT]'" --aspect=9:16 --count=3
```

Key flags:
- `--yolo` — required, auto-approves all tool actions (no confirmation prompts)
- `--aspect=9:16` — requests vertical portrait 9:16 output (correct flag for Instagram Story format)
- `--count=N` — optional, generates N variations (1–8)

Output always lands in: `./nanobanana-output/` (relative to working directory)

## Installation Instructions (for human)

To install the Gemini CLI before Phase 2 begins:

**Option A — npm global install:**
```bash
npm install -g @google/generative-ai-cli
```

**Option B — follow official docs:**
https://github.com/google-gemini/gemini-cli

After installing, verify CLI is in PATH:
```bash
which gemini
gemini --version
```

Then install the nano-banana extension:
```bash
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana
gemini extensions list | grep nanobanana
```

Then re-run this verification:
```bash
cd /Users/puneetnagpal/development/parker
[ -n "$GEMINI_API_KEY" ] && echo "API key OK" || echo "Missing GEMINI_API_KEY"
gemini --yolo "/generate 'dark architectural interior, vertical portrait, no text, no people' " --aspect=9:16
ls nanobanana-output/
sips -g pixelWidth -g pixelHeight nanobanana-output/*.png
```

## Fallback Path

**Because gemini CLI is unavailable, Phase 2 will use Fitzrovia CDN photos exclusively as background layers.**

- Fitzrovia photo rights for paid ads must be confirmed in writing before using CDN photos (see PHOTO-RIGHTS.md)
- If Fitzrovia authorization is received: use `PARKER_IMAGES` CDN URLs from `lib/parker-data.ts` as background source; download full-res and place in Figma as background layer within the 1080×1920 frame
- If Fitzrovia authorization is NOT received before Phase 2: use solid dark gradient backgrounds only (no photography, no AI), composited in Figma
- Figma compositing workflow is unchanged — only the background source changes
- Specific failure: `gemini` binary not found in PATH on macOS (Darwin 25.2.0); GEMINI_API_KEY is set

Once gemini CLI is installed by the human operator, run the verification steps above to unlock AI-generated background option for remaining ads.

## Status Gate

- [ ] Gemini CLI in PATH — FAIL (not installed)
- [ ] nano-banana extension installed — UNKNOWN (cannot check without CLI)
- [x] GEMINI_API_KEY configured — PASS
- [ ] Test generation produced at least one file — FAIL (not attempted)
- [ ] Output has correct 9:16 aspect ratio — FAIL (no output)
