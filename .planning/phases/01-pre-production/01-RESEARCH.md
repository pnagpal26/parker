# Phase 1: Pre-Production — Research

**Researched:** 2026-03-15
**Domain:** Ontario RECO advertising compliance, Meta Housing Special Ad Category, nano-banana Gemini CLI, Figma safe-zone template setup
**Confidence:** HIGH (RECO rules), MEDIUM (Meta targeting specifics), HIGH (nano-banana — confirmed from project skill)

---

## Summary

Phase 1 is a gate phase: four blockers must be documented or cleared before any creative production begins. PRE-01 (Fitzrovia photo rights) has been verbally confirmed by Garima — the plan just needs to lock in that confirmation as a written record. PRE-02 (nano-banana CLI flags) is fully resolved — the project has a `nano-banana` skill that specifies the exact Gemini CLI invocation for 9:16 story output. PRE-03 (RECO attribution wording) is governed by RECO Bulletins 5.1 and 5.3 (both issued January 2024 under TRESA): every ad must show the registered brokerage name "clearly and prominently," and the correct wording for this project is "Garima Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage." PRE-04 (Meta Housing Special Ad Category) requires the campaign manager to select "Housing" at the campaign level in Ads Manager before any targeting is configured — this restricts age, gender, and location targeting and blocks lookalike audiences.

The output of this phase is a single document: a Campaign Readiness Checklist that the ads team (or Garima) can hold and use as the handoff record proving all gates were passed before production began. No images are created in Phase 1.

**Primary recommendation:** Produce one consolidated "Pre-Production Sign-Off" document covering all four PRE requirements, get Garima's email confirmation on the photo rights item, then mark this phase complete.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PRE-01 | Fitzrovia CDN photography rights confirmed for paid social ads | Garima has verbally confirmed authorization. Plan documents this confirmation and flags the need for a written record (email reply is sufficient). |
| PRE-02 | nano-banana CLI flags verified for 1080×1920px output | Fully resolved: project skill at `/Users/puneetnagpal/.claude/skills/nano-banana/SKILL.md` documents the exact command: `gemini --yolo "/generate 'prompt'" --aspect=9:16`. |
| PRE-03 | RECO-compliant attribution line wording confirmed | Resolved via RECO Bulletins 5.1 + 5.3 (January 2024). Required wording documented below. |
| PRE-04 | Meta Housing Special Ad Category requirements noted in campaign handoff doc | Requirements documented below. Campaign manager must set "Housing" at campaign level in Ads Manager. |
</phase_requirements>

---

## Standard Stack

### Tools Used in This Phase

| Tool | Purpose | Confidence |
|------|---------|------------|
| Email / written record | Document Garima's Fitzrovia photo authorization | HIGH |
| RECO Bulletins 5.1 + 5.3 (January 2024, TRESA) | Source of truth for Ontario advertising compliance | HIGH — official RECO source |
| Meta Ads Manager — Special Ad Category: Housing | Campaign-level setting required for all rental ads | HIGH — confirmed mandatory since December 2020 |
| Gemini CLI with nano-banana extension | 9:16 background image generation | HIGH — documented in project skill |

### Nano-banana — Exact CLI Invocation (HIGH confidence)

Source: `/Users/puneetnagpal/.claude/skills/nano-banana/SKILL.md`

The project uses the **Gemini CLI with the nanobanana extension** — not a standalone `nano-banana` binary. The correct invocation pattern:

```bash
# Primary generate command for story backgrounds
gemini --yolo "/generate 'prompt here' --aspect=9:16"

# With count variations
gemini --yolo "/generate 'prompt here'" --count=3

# Edit an existing background
gemini --yolo "/edit background.png 'instruction'"
```

**Key flags:**

| Flag | Effect | Required for this project |
|------|--------|--------------------------|
| `--yolo` | Auto-approve all tool actions (no confirmation prompts) | YES — required flag |
| `--aspect=9:16` | Requests vertical portrait 9:16 output | YES — for story format |
| `--count=N` | Generate N variations (1–8) | Optional — use `--count=3` when exploring compositions |
| `--preview` | Auto-opens images after generation | Optional |

**Output location:** All generated images land in `./nanobanana-output/` in the current working directory.

**Default model:** `gemini-2.5-flash-image` (~$0.04/image). For higher quality: `export NANOBANANA_MODEL=gemini-3-pro-image-preview`.

**Setup check (run before any generation):**

```bash
# Verify extension is installed
gemini extensions list | grep nanobanana

# Verify API key
[ -n "$GEMINI_API_KEY" ] && echo "API key configured" || echo "Missing GEMINI_API_KEY"
```

**Important:** The SKILL.md documents `--aspect=9:16` as the flag for Vertical story (1080×1920). There is no separate `--width`/`--height` flag documented. The aspect ratio flag is the correct way to request 9:16 output. Always verify output dimensions immediately after generation:

```bash
# macOS — no extra tools needed
sips -g pixelWidth -g pixelHeight nanobanana-output/filename.png
```

If the output is not 1080×1920 (the tool may output a proportionally correct but differently-sized image), do not stretch — use it as the background layer anyway since Figma will place it within the 1080×1920 frame.

---

## Architecture Patterns

### PRE-01: Photo Rights — Documentation Pattern

Garima has confirmed Fitzrovia photography is authorized for paid Instagram ad use. The plan task is:

1. Draft a one-sentence confirmation request to Garima (email): "Can you confirm by reply that Fitzrovia has authorized Team Nagpal to use Parker photography in paid Instagram ads?"
2. Log her reply (forward or screenshot) with the Pre-Production Sign-Off doc.
3. If no reply is received before production begins, use only nano-banana generated backgrounds for the first batch — the Fitzrovia CDN photos can be swapped in once authorization is in writing.

The verbal confirmation from the additional context means production can proceed, but the plan should include documenting it.

### PRE-02: nano-banana CLI Verification

The plan task is to run one test generation to confirm the extension is installed and the API key is working:

```bash
gemini --yolo "/generate 'architectural test image, dark background, no text, no people, no logos, vertical portrait orientation' --aspect=9:16"
```

Then verify the output dimensions and confirm the file appears in `./nanobanana-output/`. This takes < 2 minutes and clears PRE-02 definitively.

### PRE-03: RECO-Compliant Attribution Wording

**Source:** RECO Bulletins 5.1 + 5.3, issued January 2024, under TRESA (Trust in Real Estate Services Act, 2002).

**What is required on every ad:**

1. **Registrant's name** as registered with RECO: "Garima Nagpal"
2. **Registrant's permitted title**: One of — "salesperson," "real estate salesperson," "sales representative," or "real estate sales representative." For this project: **"Sales Representative"** (matches how Garima is registered with RE/MAX Hallmark Realty).
3. **Brokerage name** as registered with RECO, accompanied by "brokerage" or "real estate brokerage": **"RE/MAX Hallmark Realty, Brokerage"**
4. Both must be "clearly and prominently" displayed.
5. "Team Nagpal" is a team name only — it does not satisfy the brokerage disclosure requirement and must appear alongside (not instead of) the brokerage name.

**Confirmed attribution line for all 5 ads:**

```
Garima Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage
```

Optionally add "Team Nagpal" for brand recognition:

```
Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage
```

**Placement:** Attribution line goes in the bottom of the safe zone (y=1480–1520px), Plus Jakarta Sans 400, 18–20px, `rgba(255,255,255,0.5)` color. The brokerage name must be no smaller or less readable than the agent name — they can be the same size.

**No minimum point size is specified by RECO** — the standard is "clearly legible to the intended audience." At 1080px canvas width, 18–20px equates to approximately 14–15pt when printed at 96dpi, which is well within standard legibility thresholds for phone screens.

**RECO does not require the "RE/MAX" logo to appear** — the text name is sufficient. However, including the logo improves brand recognition and meets the "clearly and prominently" standard more easily.

### PRE-04: Meta Housing Special Ad Category

**What it is:** A mandatory campaign-level designation for any ad promoting housing (sales, rentals, mortgages, etc.) on Meta platforms (Facebook + Instagram). Required in Canada since December 2020.

**How to set it:** In Meta Ads Manager, at the Campaign level (not Ad Set or Ad level), there is a "Special Ad Categories" field. Select **"Housing"** before configuring any other settings.

**What it restricts (confirmed targeting limitations):**

| Restriction | Detail |
|-------------|--------|
| Age targeting | Fixed at 18–65+ (cannot narrow to e.g. 25–45) |
| Gender targeting | Must include all genders |
| ZIP/postal code targeting | Not allowed |
| Geographic radius | Minimum radius applies (approximately 15 miles / 25 km) |
| Lookalike audiences | Standard Lookalike Audiences blocked; use "Special Ad Audiences" instead |
| Detailed interest targeting | Demographic, behavioral, and most interest-based options are removed |
| Audience exclusions | Exclusion targeting is not allowed |

**What it does not restrict:**
- Custom audiences from first-party data (website visitors via Meta Pixel, email list uploads)
- Province/city-level location targeting (Ontario, Toronto)
- Retargeting audiences (website visitors, chat_opened / chat_started events from GA4/Meta Pixel)
- Creative format and copy (no content restrictions beyond standard Meta ad policies)

**Practical impact for this campaign:** Since Garima's ads target Toronto renters broadly, the radius minimum is not a practical constraint. The retargeting audiences (warm: `chat_opened`, hot: `chat_started`) are first-party data via Meta Pixel — these remain available under the Housing category. The only meaningful loss is demographic narrowing (age, gender) and postal-code-level precision — neither of which was required for this campaign's strategy.

**What to document in the handoff:** A one-paragraph note to whoever sets up the campaign in Ads Manager explaining: "These are Housing ads. At the Campaign level in Ads Manager, select Special Ad Categories → Housing. Do not attempt to target by age range, gender, or postal code — these fields are locked by Meta policy for housing ads. Use the pre-built retargeting audiences from the Meta Pixel (chat_opened, chat_started events) which are first-party data and available under Housing category."

### Figma Safe-Zone Template Setup

For Phase 2 production reference (set up now, used in Phase 2):

**Frame setup:**
- Canvas: 1080 × 1920 px
- Frame name: "Parker Story Ad — TEMPLATE"

**Guides to create:**
- Horizontal guide at y=250 (top safe line — below UI chrome)
- Horizontal guide at y=1536 (bottom safe line — above CTA bar)
- Vertical guide at x=90 (left margin)
- Vertical guide at x=990 (right margin — 1080 − 90)

**Safe zone fill layer (for QA visibility only, delete before export):**
- Top unsafe zone: red fill rectangle, y=0 to y=250, 50% opacity
- Bottom unsafe zone: red fill rectangle, y=1536 to y=1920, 50% opacity
- Label: "DO NOT PLACE CRITICAL CONTENT IN RED ZONES"

**Effective safe canvas:** 900 × 1286 px (x=90 to x=990, y=250 to y=1536)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Attribution compliance check | Custom RECO rules lookup | This research document — wording is locked | Already resolved |
| Image dimension verification | Custom script | `sips -g pixelWidth -g pixelHeight filename.png` | Built into macOS, zero setup |
| 9:16 image generation | Manual Figma background creation | `gemini --yolo "/generate 'prompt'" --aspect=9:16` | 30 seconds vs. 30 minutes |
| Campaign compliance documentation | Separate legal research | Use PRE-04 findings in handoff note | Already resolved by this research |

---

## Common Pitfalls

### Pitfall 1: Treating PRE-01 as Fully Cleared Without a Written Record

**What goes wrong:** Verbal confirmation ("Garima said it's fine") is not documentation. If there is ever a dispute with Fitzrovia, there is no paper trail.

**How to avoid:** The plan task asks Garima to confirm by email reply — a 10-second action. Log the reply in the Pre-Production Sign-Off doc.

**Warning signs:** If this step is skipped and the project proceeds to Phase 2 using Fitzrovia photos, all five ads may need to be regenerated with AI-generated backgrounds if Fitzrovia disputes the usage.

### Pitfall 2: "Team Nagpal" as the Only Brokerage Identifier

**What goes wrong:** An ad shows "Team Nagpal" prominently and "RE/MAX Hallmark Realty" is absent or very small. This fails RECO's "clearly and prominently" standard for brokerage identification under TRESA.

**How to avoid:** The attribution line on every ad must include the registered brokerage name. "Team Nagpal" can appear, but it does not replace the brokerage disclosure.

**Warning signs:** If anyone suggests removing "RE/MAX Hallmark Realty" from the ad to keep the design clean — this is a RECO violation.

### Pitfall 3: Missing "Brokerage" Designator After RE/MAX Hallmark Realty

**What goes wrong:** The attribution reads "RE/MAX Hallmark Realty" without the word "Brokerage" — technically the RECO standard requires "brokerage" or "real estate brokerage" to accompany the name.

**How to avoid:** Use the full form: "RE/MAX Hallmark Realty, Brokerage" in all attribution lines.

**Note:** This is a nuance that many practitioners overlook. It is low-risk in practice but the correct form per Bulletin 5.1 is with the designator.

### Pitfall 4: Setting Up Meta Campaign Without Housing Category First

**What goes wrong:** Campaign manager creates the campaign as a standard "Awareness" or "Traffic" campaign, configures all the targeting and audiences, then realizes at publishing that Housing category is required. Meta forces a restart — all ad set configuration may be lost.

**How to avoid:** The first thing the campaign manager does in Ads Manager is set Special Ad Categories → Housing, before configuring any ad sets. Document this as step 1 in the handoff note.

### Pitfall 5: nano-banana Extension Not Installed

**What goes wrong:** `gemini extensions list | grep nanobanana` returns nothing. Generation commands fail with "unknown extension" error.

**How to avoid:** PRE-02 includes a verification step — run the setup check before any generation attempt. If missing: `gemini extensions install https://github.com/gemini-cli-extensions/nanobanana`.

---

## Code Examples

### Nano-banana: Test Generation for PRE-02 Verification

```bash
# Step 1: verify extension
gemini extensions list | grep nanobanana

# Step 2: verify API key
[ -n "$GEMINI_API_KEY" ] && echo "OK" || echo "Missing GEMINI_API_KEY"

# Step 3: test generation (one image, minimal prompt)
gemini --yolo "/generate 'dark architectural interior, vertical portrait, no text, no people, no logos'" --aspect=9:16

# Step 4: verify output
ls nanobanana-output/
sips -g pixelWidth -g pixelHeight nanobanana-output/*.png
```

### Nano-banana: Full Story Ad Background (Phase 2 reference)

```bash
# Ad 2 — LIDO Pool background (if Fitzrovia not authorized)
gemini --yolo "/generate 'luxury Toronto condominium rooftop infinity pool overlooking midtown city skyline at golden hour, compositional negative space in the upper third of the frame for text overlay, warm amber and cream light reflecting on still water, deep charcoal shadow in the foreground, editorial architectural photography style, wide-angle lens, no text, no watermarks, no people, no logos'" --aspect=9:16 --count=3
```

### Attribution Line: Confirmed RECO-Compliant Wording

```
Garima Nagpal · Team Nagpal · Sales Representative · RE/MAX Hallmark Realty, Brokerage
```

Figma text properties:
- Font: Plus Jakarta Sans 400
- Size: 18–20px (at 1080px canvas)
- Color: rgba(255, 255, 255, 0.5)
- Letter spacing: 0.15em
- Placement: y=1480–1520px (bottom of safe zone)

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| REBBA 2002 advertising rules | TRESA (Trust in Real Estate Services Act, 2002, as amended) — bulletins reissued January 2024 | Substantively similar requirements; bulletins 5.1–5.3 are the current governing documents |
| Instagram "Swipe Up" link | Link sticker (business accounts) / Meta Ads destination URL | URL in the ad image is visual only; actual click destination set in Ads Manager ad unit |
| Standard lookalike audiences for real estate | "Special Ad Audiences" (Meta's compliant alternative) | Less precision but still workable for Toronto rental market reach |
| Meta housing policy (US only) | Global rollout — Canada mandatory since December 2020 | Must declare Housing category for any Canadian rental ad |

---

## Open Questions

1. **Garima's RECO-registered title (Sales Representative vs. Broker)**
   - What we know: RECO Bulletin 5.1 requires the exact registered title to appear.
   - What's unclear: Is Garima registered as "Sales Representative" or "Broker"? The landing page and chatbot copy use "Garima Nagpal" without a title. RE/MAX Hallmark Realty profiles typically list agents as "Sales Representative" unless they hold a broker's license.
   - Recommendation: Confirm with Garima or check RECO's public registrant directory at reco.on.ca before finalizing the attribution line. Use "Sales Representative" as the default assumption — it is the more common registration status and is correct unless Garima holds a broker license.

2. **GEMINI_API_KEY availability in this environment**
   - What we know: The nano-banana skill is installed (`/Users/puneetnagpal/.claude/skills/nano-banana/` exists). The Gemini CLI binary was not found in `$PATH` during research (nano-banana binary not present), but the skill invokes it via `gemini` command.
   - What's unclear: Whether `GEMINI_API_KEY` is set in the environment and whether `gemini` CLI is in PATH.
   - Recommendation: PRE-02 task starts with the setup check commands. If `gemini` is not in PATH, install the Gemini CLI before proceeding.

---

## Sources

### Primary (HIGH confidence)
- RECO Bulletin 5.1 (January 17, 2024) — https://www.reco.on.ca/agents-and-brokerages/reco-bulletins/reco-bulletin-5-1-advertising-requirements — brokerage name requirements, "clearly and prominently" standard, team name rules
- RECO Bulletin 5.3 (January 2024) — https://www.reco.on.ca/agents-and-brokerages/reco-bulletins/reco-bulletin-5-3-advertising-online — online/social media advertising requirements, same rules apply as traditional media
- Project nano-banana skill — `/Users/puneetnagpal/.claude/skills/nano-banana/SKILL.md` — exact Gemini CLI commands, `--aspect=9:16` flag, `--yolo` requirement, output location, model pricing
- Elliott Lawyers summary of RECO guidelines — https://elliottlawyers.com/summary-advertising-guidelines-for-real-estate-agents-in-ontario/ — corroborates Bulletin 5.1 requirements including four mandatory elements

### Secondary (MEDIUM confidence)
- Data Axle — Meta Special Ad Categories 2025 — https://www.data-axle.com/resources/blog/meta-special-ad-categories-rules/ — targeting restrictions (age, gender, postal code, lookalikes) confirmed
- Meta advertising compliance overview via WebSearch — Meta Housing Special Ad Category mandatory in Canada since December 2020, confirmed across multiple sources
- PITFALLS.md (prior research, training data) — pitfalls 2, 4, 5, 10 directly inform Phase 1 planning
- STACK.md (prior research) — nano-banana prompt structure and Figma safe-zone template setup corroborated

### Tertiary (LOW confidence — use for orientation only)
- Training knowledge on Meta ad account enforcement behavior — not independently verified beyond search results

---

## Metadata

**Confidence breakdown:**
- RECO attribution wording: HIGH — verified against official RECO Bulletins 5.1 + 5.3 (January 2024)
- nano-banana CLI invocation: HIGH — sourced from the project's own installed skill documentation
- Meta Housing Special Ad Category: MEDIUM — confirmed mandatory, targeting restrictions cross-verified across multiple sources; exact Canadian radius minimum not confirmed (use 25 km as working assumption)
- Fitzrovia photo rights: HIGH — Garima has confirmed; plan just needs to document it

**Research date:** 2026-03-15
**Valid until:** 2026-09-15 (RECO bulletins are stable; Meta policy may update — re-check Meta rules before any new campaign launch)
