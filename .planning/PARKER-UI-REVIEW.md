# Parker Landing Page — UI Review

**Audited:** 2026-03-19
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md — luxury real estate / property rental context)
**Screenshots:** Captured — desktop (1440x900), mobile (375x812), tablet (768x1024)
**Screenshot dir:** `.planning/ui-reviews/00-20260319-224351/`

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Purpose-driven CTAs, specific error fallbacks, no generic labels |
| 2. Visuals | 3/4 | Strong hero hierarchy; amenity carousel lacks manual prev/next on mobile |
| 3. Color | 3/4 | Orange well-contained; ~10 hardcoded hex values bypass the token system |
| 4. Typography | 4/4 | Two-font system used correctly; clamp scales are disciplined |
| 5. Spacing | 3/4 | Standard Tailwind scale used throughout; a few inline padding overrides break the pattern |
| 6. Experience Design | 3/4 | Loading/error states present; FloorPlans filter shows no "no results" state |

**Overall: 20/24**

---

## Top 3 Priority Fixes

1. **Hardcoded `#0A0A0A`, `#c94d2f`, `#2ecc71`, `#27ae60` bypass the brand token system** — If the brand palette shifts, these values will drift silently and create inconsistency. Map `#0A0A0A` to `var(--dark)` (or define a new `--near-black` token), `#c94d2f` to a `--orange-dark` hover token, and the green pair to a `--success` token. Affects `Hero.tsx:61,96`, `Chatbot.tsx:428,490`, `Incentives.tsx:215`, `FloorPlans.tsx:91,96`.

2. **FloorPlans filter has no empty-state** — When a category has zero plans, the grid silently collapses to nothing with no message. This is particularly risky if floor plan data changes. Add a short empty state: "No [category] floor plans are currently listed — chat with Emma for availability." inside the grid container when `filtered.length === 0`.

3. **Amenity carousel has no manual navigation controls on desktop** — The auto-rotating carousel (`3500ms` interval) in `Amenities.tsx` only shows dot indicators; desktop users cannot click previous/next arrows to control pace. The Gallery section gets full arrow navigation, but Amenities does not. Users who want to study a specific amenity image are stuck waiting. Add left/right arrow buttons consistent with the Gallery pattern.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

The copy is notably strong for a luxury rental context. No generic "Submit", "Click Here", or "OK" labels were found in any rendered component. Every CTA is purpose-specific:

- Hero mobile: "Book Tour" / "Chat with Emma to confirm availability →" (`Hero.tsx:86,126`)
- Hero desktop: "Book a Private Tour" / "Chat with Emma to book your tour →" (`Hero.tsx:192,241`)
- Nav: "Book a Tour" (`Nav.tsx:97,159`)
- Incentives: "Chat with Emma" with "Typically replies in under a minute" social proof underneath (`Incentives.tsx:218,224`)
- Chatbot error fallback: specific escalation copy with direct phone and email (`Chatbot.tsx:359`)

The LeadForm (not rendered on page) has "Submit another inquiry" and a generic "Something went wrong — please try again" which would score lower, but since this component is not rendered, it does not affect the live experience.

Section headlines demonstrate strong editorial voice: "Life Beyond the Suite" (Amenities), "Find Your Layout" (FloorPlans), "Reimagining What Rental Living Means" (About). The tagline "Forget what you know about rental living" (`PARKER_INFO.tagline`) is punchy and brand-appropriate.

Minor note: the Hero mobile CTA label is "Book Tour" (truncated) while desktop is "Book a Private Tour". The truncation is intentional for space but creates minor copy inconsistency across breakpoints.

### Pillar 2: Visuals (3/4)

**Strengths:**

- Desktop hero is compositionally excellent: full-bleed lifestyle photo, large editorial PARKER wordmark in Cormorant Garamond, frosted glass incentives panel on the right. Clear focal hierarchy. Screenshot confirms the layout reads correctly at 1440px.
- Mobile hero (375px screenshot) splits the viewport 48/52 between the hero image and a dark incentives panel — a deliberate two-panel approach that avoids the "shrunk desktop" problem. The PARKER wordmark reads clearly against the image.
- Scroll-triggered animations (`.reveal`, `.clip-reveal`, `.hero-text-animate`) are present and graduated with delay classes, creating a staged reveal appropriate for luxury presentation.
- Left editorial accent bar on desktop (vertical address text, `Hero.tsx:151–158`) adds architectural sophistication without clutter.
- Gallery thumbnail strip with orange active outline is a clean, discoverable pattern.
- The FloorPlans lightbox is a good interaction pattern: keyboard navigation (Escape, ArrowLeft, ArrowRight), dot indicators, info bar with price.

**Issues:**

- The Amenities carousel (`Amenities.tsx`) has only dot indicators for navigation — no prev/next arrow buttons on desktop. The dots at 4px × 4px (active: 24px × 4px) are quite small tap targets for a mouse interaction. Gallery correctly implements arrow buttons (`Gallery.tsx:53–87`); Amenities should match.
- The mobile menu (`Nav.tsx:133–161`) uses `display-italic` 5xl text for navigation labels (Amenities, Floor Plans, Gallery). This is visually bold and on-brand, but the menu lacks a visual close affordance beyond the hamburger toggle — no ✕ icon appears in the overlay itself, requiring the user to re-tap the hamburger.
- The chatbot FAB (`Chatbot.tsx:377`) shows an open-chat SVG icon. The button has `aria-label="Open chat"` but the label does not update to "Close chat" when the panel is open, reducing accessibility.

### Pillar 3: Color (3/4)

**Token system:**

The brand palette is well-defined in `globals.css` and exposed as Tailwind color tokens via `@theme inline`. Nine semantic tokens cover the full palette:

`--dark`, `--ink`, `--orange`, `--orange-light`, `--cream`, `--cream-mid`, `--warm-white`, `--ink-muted`, `--border`

**Orange (accent) usage:**

68 `orange` references across all components — high count, but justified: it is used consistently as the brand accent on section labels, price highlights, CTA buttons, icon backgrounds, active states (carousel dots, thumbnail outlines, filter tabs), and the orange-rule line divider. This is intentional brand immersion, not accent overuse, and the 60/30/10 cream/dark/orange proportion reads well in screenshots.

**Hardcoded hex values found (bypassing token system):**

| Value | Location | Issue |
|-------|----------|-------|
| `#0A0A0A` | `Hero.tsx:61,96` | Near-black panel; should be `var(--dark)` or a new token |
| `#c94d2f` | `Hero.tsx:83,189`, `Incentives.tsx:215`, `LeadForm.tsx:228` | Orange hover darken; no token defined |
| `#fff` | `FloorPlans.tsx:71,91,257,179` | Pure white; should be `var(--warm-white)` or `white` via token |
| `#f5f5f3` | `FloorPlans.tsx:96,186` | Light gray floor plan background; not in palette |
| `#2ecc71` | `Chatbot.tsx:428` | Online status green dot; no success token |
| `#27ae60` | `Chatbot.tsx:490` | Lead-captured banner text; no success token |
| `#c0392b` | `LeadForm.tsx:212` | Error red (LeadForm, not rendered) |

The most impactful fixes are the `#0A0A0A` → `var(--dark)` alignment in Hero and defining a `--orange-hover: #c94d2f` token for consistent button hover states.

### Pillar 4: Typography (4/4)

The two-font system is applied correctly and consistently throughout:

- `--font-display` (Cormorant Garamond): headings (`h1`, `h2`, section heroes, pricing numbers, floor plan card names) via the `.display` and `.display-italic` utility classes
- `--font-body` (Plus Jakarta Sans): all UI text, labels, captions, button copy, applied via inline `fontFamily: "var(--font-body)"` declarations

**Font sizes in use (Tailwind utility classes):**

`text-xs`, `text-sm`, `text-base`, `text-lg` — a 4-step scale, which is appropriately restrained.

**Weight distribution:**

`font-medium`, `font-semibold`, `font-normal` — three weights. Display text relies on the `.display` class (weight 400) and `.display-italic` (weight 300). Body text uses `fontWeight: 300` for secondary/supporting text, creating clear hierarchy through weight contrast. This is disciplined and intentional.

**Inline `clamp()` sizes** are used consistently for all display headings:
- Section h2: `clamp(2.4rem, 5vw, 3.8rem)` — uniform across Amenities, FloorPlans, Gallery, Incentives
- Hero h1 desktop: `clamp(4.5rem, 14vw, 11rem)` — appropriate editorial scale
- Stats: `clamp(2.8rem, 6vw, 4.5rem)`

Minor: `Nav.tsx` uses inline `fontSize: "0.62rem"` and `"0.72rem"` for the "Presented by / Garima Nagpal" sub-caption — these sub-pixel values are not on the standard Tailwind scale but are contextually justified (nav requires very compact text).

### Pillar 5: Spacing (3/4)

**Standard scale usage:**

The project uses the Tailwind scale for the vast majority of spacing. The `globals.css` `@layer utilities` block explicitly defines every utility used (Turbopack scan limitation), all mapped to standard `rem` increments.

Most-used classes (from component scan): `gap-`, `px-`, `py-`, `p-` — all standard Tailwind. Sections consistently use `py-20 sm:py-28` for vertical rhythm, and `px-6 lg:px-8` for horizontal gutters on `max-w-7xl` containers. This is consistent throughout Stats, About, Amenities, FloorPlans, Gallery, Incentives, Footer.

**Inline padding overrides (non-Tailwind):**

| Location | Value | Issue |
|----------|-------|-------|
| `LeadForm.tsx:225` | `padding: "16px 48px"` | Not on scale; `px-12 py-4` equivalents exist |
| `Chatbot.tsx:463` | `padding: "10px 14px"` | Chat bubble padding; fine as bespoke micro-spacing |
| `Chatbot.tsx:470` | `padding: "10px 14px"` | Same — chat bubble |

The chatbot message bubble paddings are acceptable as bespoke micro-spacing for a custom UI element. The LeadForm CTA button `padding: "16px 48px"` is the most notable deviation from the system.

**Arbitrary bracket values:**

`h-[42px]` (Nav, Footer logo height), `text-[15px]` (About, LeadForm body), `min-h-[320px]`, `min-h-[460px]` — these are reasonable exceptions for specific layout constraints. `text-[15px]` should ideally be `text-sm` (14px) or `text-base` (16px); the 15px value sits between standard steps.

### Pillar 6: Experience Design (3/4)

**Loading states:**

- Chatbot: animated typing dots (`DOTS` component, `Chatbot.tsx:79–99`) shown while awaiting Emma's response. Input disabled during loading (`Chatbot.tsx:516`). Send button disabled when loading or input empty. Input auto-refocuses after each response via `useEffect` on `loading`. Excellent.
- LeadForm (not rendered): has `status === "loading"` → button label changes to loading state (`LeadForm.tsx:231`).
- Amenities carousel: auto-advance with no loading indicator for images — this is fine as images are progressively available.
- FloorPlans cards: no skeleton/placeholder states before images load — images load directly. Acceptable for this content type.

**Error states:**

- Chatbot API failure: graceful fallback message with direct phone + email escalation (`Chatbot.tsx:354–365`). No error boundary, but the fallback catch covers the critical path.
- Lead capture failures: `console.error` only — no user feedback if `/api/lead` fails silently after form submission. The `leadCaptured` banner only fires on API success, so users get no feedback if the submission silently fails (e.g. 422 bogus email). Emma's conversation continues normally without a visible failure state.

**Empty states:**

- FloorPlans filter: no empty state when a category has zero plans. `filtered.length === 0` renders an empty grid with no message. This is the most visible gap.
- Gallery and Amenities carousels: empty state would only occur if `PARKER_IMAGES` arrays are empty — unlikely but not guarded.

**Confirmation for destructive actions:** Not applicable — no destructive user actions exist.

**Disabled states:** Send button correctly disabled (`disabled={loading || !input.trim()}`) with `disabled:opacity-30`. Nav "Book a Tour" has no disabled state (not needed).

**Returning visitor UX:** Chatbot correctly detects a prior session via `localStorage` and routes Emma to greet by first name and skip re-collecting known fields (`Chatbot.tsx:219–228`). This is a strong experience design decision.

**Chatbot accessibility gaps:**

- FAB `aria-label="Open chat"` does not update to "Close chat" when panel is open (`Chatbot.tsx:387`).
- Chat panel is not a `role="dialog"` with `aria-modal="true"` — screen reader users may not understand the panel is a modal overlay.
- Dot indicator buttons in Amenities and Gallery carousels have no `aria-label` (e.g. "Go to slide 3").

---

## Registry Safety

No shadcn `components.json` detected. Registry audit skipped.

---

## Files Audited

- `/Users/puneetnagpal/development/parker/app/page.tsx`
- `/Users/puneetnagpal/development/parker/app/globals.css`
- `/Users/puneetnagpal/development/parker/components/Hero.tsx`
- `/Users/puneetnagpal/development/parker/components/Nav.tsx`
- `/Users/puneetnagpal/development/parker/components/Stats.tsx`
- `/Users/puneetnagpal/development/parker/components/Incentives.tsx`
- `/Users/puneetnagpal/development/parker/components/About.tsx`
- `/Users/puneetnagpal/development/parker/components/Amenities.tsx`
- `/Users/puneetnagpal/development/parker/components/Gallery.tsx`
- `/Users/puneetnagpal/development/parker/components/FloorPlans.tsx`
- `/Users/puneetnagpal/development/parker/components/Footer.tsx`
- `/Users/puneetnagpal/development/parker/components/Chatbot.tsx`
- `/Users/puneetnagpal/development/parker/lib/parker-data.ts`
- `/Users/puneetnagpal/development/parker/CLAUDE.md`
