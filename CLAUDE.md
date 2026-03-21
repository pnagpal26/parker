# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Parker Landing Page

Luxury rental landing page for **Parker at Yonge + Eglinton**, Toronto.
Presented by **Garima Nagpal · Team Nagpal · RE/MAX Hallmark Realty**.

---

## Commands

```bash
npm run dev      # Start dev server (Turbopack) on port 3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

> Scripts use `node node_modules/next/dist/bin/next` directly — the `.bin/next` symlink has a broken require path in this install.

### Deployment

Git repo: `https://github.com/pnagpal26/parker` (branch: `main`)

```bash
git add <files>
git commit -m "..."
git push
vercel --prod --yes
```

Live URL: **https://parker.affordablecondos.ca**
Vercel project: `pauls-projects-c6c6e753/parker`
Always commit + push to GitHub before deploying to Vercel.

---

## Stack

- **Next.js 16.1.6** — App Router, TypeScript, Turbopack
- **Tailwind CSS v4** — `@import "tailwindcss"` syntax, NO `tailwind.config.ts`
- **`@anthropic-ai/sdk`** — Claude streaming (`claude-sonnet-4-6`)
- **`ai` (Vercel AI SDK)** — streaming utilities used in chat route
- **`resend`** — transactional email to garima@teamnagpal.ca
- **Follow Up Boss (FUB)** — CRM lead creation + transcript note

---

## Page Structure (`app/page.tsx`)

Client component. Owns `chatOpen: boolean` state.

```
Nav          ← receives onOpenChat
Hero         ← receives onOpenChat; full-screen hero + incentives overlay
Stats        ← 4 animated counters (Location, Area, Storeys, Suites)
Incentives   ← pricing cards (net effective hero) + perks list + "Chat with Emma" CTA
About        ← 2-col text + exterior photo
Amenities    ← numbered list + image carousel
Gallery      ← full-width image carousel with thumbnails
Footer       ← logo + address + Garima's contact only
Chatbot      ← controlled: open={chatOpen} setOpen={setChatOpen}
```

Both `Nav` and `Hero` call `onOpenChat()` from their CTAs.

> **Note:** `components/LeadForm.tsx` exists (static contact form → `/api/lead`) but is not rendered on the page. It posts with `source: "Parker Contact Form"` instead of `"Parker Chatbot"`.

---

## Data Layer (`lib/parker-data.ts`)

**Single source of truth** — update content here, not in components.

| Export | Contents |
|--------|----------|
| `PARKER_INFO` | Building name, address, tagline, stats, amenities list, suite types |
| `PARKER_PRICING` | 4 suite tiers with list price, net effective, free months badge |
| `PARKER_INCENTIVES` | 6 incentive items with icon key + text (used by Incentives.tsx "What's Included" list — **not** Hero) |
| `PARKER_IMAGES` | All image URLs (fitzrovia.ca CDN) |
| `PARKER_SYSTEM_PROMPT` | Full Claude system prompt for Emma |

---

## AI Chatbot — Emma

**Persona:** Emma, leasing rep for Parker working with Garima Nagpal (Team Nagpal / RE/MAX Hallmark Realty).

**Behaviour:**
- Warm, conversational, never pushy
- One question at a time
- 1–3 sentences per response
- 2500ms artificial delay before fetch (human-like pacing)
- Input auto-refocuses after every Emma response (via `useEffect` on `loading`)
- Collects 6 fields: name, email, phone, move-in date, suite type, budget
- On collecting all 6, outputs `<lead_data>{...}</lead_data>` which auto-fires lead capture
- Signs off: *"I'll pass your details along to our team — Garima will reach out personally to confirm your tour time."*

**Writing guardrails:** Keep rules behavioural, not prescriptive. Overly mechanical rules (e.g. "prefix every rent with X") cause robotic repetition. Write intent + example of natural usage instead.

**Guardrails (in system prompt):**
1. Stay on topic — Parker only
2. Never fabricate — defer to Garima if unsure
3. No pressure tactics or false urgency
4. Handle personal data with care
5. No legal/financial/investment advice
6. Escalation → Garima: 416-312-5282 / Garima@TeamNagpal.ca
7. Never argue or be defensive
8. No competitor comparisons

---

## Lead Capture Flow

```
Chatbot → /api/chat (streaming, Claude)
              ↓ client detects <contact_captured> (name+email confirmed)
         /api/lead (POST, partial:true) → FUB person created early, no email, no note
              ↓ returns personId → stored in fubPersonIdRef + localStorage parker_transcript

              ↓ transcript snapshot saved to localStorage after every assistant message

              ↓ client detects <lead_data> (all 6 fields)
         /api/lead (POST, full) → parallel:
              Resend email → garima@teamnagpal.ca
              FUB POST /v1/events → updates person
              FUB POST /v1/notes → "[Captured at lead collection]" note (fire-and-forget)

Panel hide (visibilitychange) / page unload (beforeunload) / panel close
         sendBeacon → /api/transcript (POST)
              ↓ reads personId from fubPersonIdRef, falls back to localStorage
              FUB POST /v1/notes → full conversation transcript
```

> **Two FUB notes per full capture:** `/api/lead` writes `[Captured at lead collection]` immediately; `/api/transcript` writes the full transcript on close. This is intentional — guarantees at least one note even if sendBeacon fails.
>
> **`/api/lead` partial flag:** `{ partial: true }` skips Resend email and transcript note. Only name + email are required. Phone bogus check is skipped (phone not yet collected).
>
> The `/api/chat` route does **not** call `/api/lead` — only the client does. A server-side fetch was removed (2026-03-14) as it caused double `/api/lead` calls on every lead capture.

**`/api/lead` body:**
```json
// Full capture
{ "name": "", "email": "", "phone": "", "moveIn": "", "suiteType": "", "budget": "",
  "source": "Parker Chatbot", "transcript": "=== Parker Chatbot Transcript ===\n\n..." }

// Partial capture (name+email only — fires on <contact_captured>)
{ "name": "", "email": "", "source": "Parker Chatbot", "partial": true }
```

**`/api/lead` response:** `{ success, email, fub, fubPersonId }`

**`/api/lead` validation (before hitting FUB/Resend):**
- Missing email → 400
- Bogus email (disposable domain, all-same-char local part) → 422 `{ reason: "bogus_email" }`
- Bogus phone (all-same digit, sequential, < 7 digits) → 422 `{ reason: "bogus_phone" }` (skipped for partial)

**FUB notes written per session (up to 2):**
1. `[Captured at lead collection]` — written by `/api/lead` on full capture, synchronously
2. Full transcript — written by `/api/transcript` via sendBeacon on close/unload

---

## Emma's XML Tags (stream output)

| Tag | When emitted | Client action |
|-----|-------------|---------------|
| `<contact_captured>{name,email}</contact_captured>` | Name + email confirmed | Fire partial `/api/lead`; `cleanContent()` strips from display |
| `<lead_data>{all 6 fields}</lead_data>` | All 6 fields collected | Fire full `/api/lead`; `cleanContent()` strips from display |

`partialLeadFiredRef` prevents `<contact_captured>` from firing multiple times (same pattern as `leadCapturedRef` for `<lead_data>`).

---

## LocalStorage Keys

| Key | Contents | Expires |
|-----|----------|---------|
| `parker_chat_session` | Full lead data + fubPersonId (set after full capture) | 24h |
| `parker_transcript` | `{ version, expiresAt, personId, messages[] }` — snapshot after every assistant response | 24h |

`parker_transcript` is the sendBeacon fallback — `flushTranscript()` reads personId from it if `fubPersonIdRef` is not yet set (async race on quick tab close). Do NOT clear it after sendBeacon — let 24h expiry handle cleanup.

---

## Analytics & Tracking

Traffic strategy is dual: **organic search (Google)** + **paid social (Instagram/Facebook ads)**.

### Meta Pixel (`app/layout.tsx`)

Injected via `<Script strategy="afterInteractive">` when `NEXT_PUBLIC_META_PIXEL_ID` is set.

| Event | When |
|-------|------|
| `PageView` | Every page load (automatic) |
| `ViewContent` | User opens the chatbot |
| `Lead` | `<lead_data>` detected — lead fully captured |

### Google Analytics 4 + Google Ads (`app/layout.tsx`)

Injected via `<Script strategy="afterInteractive">` when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
Google Ads remarketing tag also loaded if `NEXT_PUBLIC_GADS_ID` is set.

### Chatbot Funnel Events (`components/Chatbot.tsx`)

Three events fire at distinct points for audience segmentation:

| GA4 Event | When fired | Builds this audience |
|-----------|-----------|----------------------|
| `chat_opened` | Any "Chat with Emma" / "Book a Tour" CTA clicked | Everyone who showed intent |
| `chat_started` | User sends their first message | Engaged but didn't convert |
| `lead_captured` | `<lead_data>` detected in stream | Converted — suppress from retargeting |

Google Ads conversion fires at `lead_captured` via `send_to: GADS_ID/GADS_CONVERSION_LABEL`.

**Retargeting strategy:**
- Warm audience: `chat_opened` fired, `lead_captured` NOT fired → retarget with "pick up where you left off" ad
- Hot audience: `chat_started` fired, `lead_captured` NOT fired → higher-value retarget
- Suppression list: `lead_captured` fired → exclude from all ads

All scripts are conditionally rendered — if the env var is absent, the script is silently skipped. No errors in dev.

### Live Tracking IDs (Production)

| Service | ID |
|---------|----|
| Meta Pixel | `1928979144653218` |
| GA4 | `G-3EFNE69Y89` |
| Google Ads | `AW-860175244` |
| Google Ads Conversion Label | `zFHzCN6Q0IYcEIz3lJoD` |
| Google Ads Conversion Action | Parker Lead (Submit lead form, Count: One, 30-day window) |

All four are set as Vercel environment variables in production. See `ADS-TRACKING-BRIEF.md` for the full brief to share with the ads team.

---

## SEO

### Metadata (`app/layout.tsx`)

Set via Next.js `Metadata` API:
- `og:image` → `PARKER_IMAGES.hero` (fitzrovia.ca CDN, 1920×1080)
- `og:type` → `"website"`, `og:url`, `og:locale: "en_CA"`
- `twitter:card` → `"summary_large_image"`
- `canonical` → `https://parker.affordablecondos.ca`
- `robots` → `index, follow`

### JSON-LD Structured Data (`app/layout.tsx`)

Injected as `<script type="application/ld+json">` in `<head>`. Two schema types:

- **`LocalBusiness` + `ApartmentComplex`** — name, address, geo, phone, amenities, broker (Garima Nagpal / RE/MAX Hallmark Realty)
- **`AggregateOffer`** — price range sourced from `PARKER_PRICING`, currency CAD

Data is sourced live from `PARKER_INFO` and `PARKER_PRICING` — update the data file and structured data updates automatically.

### Sitemap + Robots

- `app/sitemap.ts` → serves `/sitemap.xml` (Next.js App Router native)
- `app/robots.ts` → serves `/robots.txt`, allows `/`, disallows `/api/`

### Verification URLs

| Check | URL |
|-------|-----|
| OG tags | https://developers.facebook.com/tools/debug/ |
| Structured data | https://validator.schema.org/ |
| Sitemap | https://parker.affordablecondos.ca/sitemap.xml |
| Robots | https://parker.affordablecondos.ca/robots.txt |

---

## Components

### Hero (`components/Hero.tsx`)

Two completely separate layouts — no shared markup:

**Mobile (`lg:hidden`):**
- Top 48%: hero image with PARKER wordmark + tagline + CTA button
- Bottom 52%: dark panel with "Move In Today" headline, 2-column incentives grid, "Chat with Emma" CTA bar pinned at bottom

**Desktop (`hidden lg:block/flex`):**
- Full-screen hero image
- Left: PARKER wordmark + tagline + "Book a Private Tour" button
- Right: frosted glass panel — "Move In / Today" + 6 incentives list + "Chat with Emma to book your tour →"

> **Note:** Hero uses a **local** `INCENTIVES` array (top of `Hero.tsx`) with `{ label, sub }` fields — it does **not** import `PARKER_INCENTIVES`. Update Hero and `lib/parker-data.ts` separately when incentive copy changes.

### Nav (`components/Nav.tsx`)

- Logo: `h-[42px] w-36` (50% larger than original), `sizes="144px"` on the Image
- "Presented by / Garima Nagpal" text to the right of logo with divider — visible on **all** screen sizes (not just `sm:`)
- Adapts colour based on `scrolled` state (white on hero, dark on scroll)
- "Book a Tour" button → calls `onOpenChat()`
- Mobile menu: "Book a Tour" → calls `onOpenChat()` + closes menu

### Stats (`components/Stats.tsx`)

- Wrapped in `<section aria-label="Building Overview">` with sr-only `<h2>` for accessibility/SEO
- 4 animated count-up stats: Location, Area, Storeys, Suites

### Incentives (`components/Incentives.tsx`)

Displayed between Stats and About. `id="incentives"` for anchor linking. Contains:
- 4 pricing cards — net effective is the hero number, list price is secondary fine print
- "What's Included" list with 6 perks + icons (sourced from `PARKER_INCENTIVES`)
- "Book a Private Tour" CTA panel → "Chat with Emma" button

**Current incentive offer (as of 2026-03-20):** Two lease-term options — 1 month free on a 12-month lease, or 2 months free on a 14-month lease — available on all suite types. NER is calculated as `list × 12 ÷ 14` for the 2-month offer.

### Gallery (`components/Gallery.tsx`)

- Full-width image carousel with thumbnail strip
- Thumbnail `alt` text: `"Parker — {LABELS[i]} thumbnail"` (descriptive for SEO/a11y)

### Footer (`components/Footer.tsx`)

3-column grid:
1. Parker logo + tagline (`alt="Parker at Yonge + Eglinton — Luxury Rentals Toronto"`)
2. Building address only (no phone/email for Parker)
3. Garima Nagpal · RE/MAX Hallmark Realty · Direct · Office · Email

Contact info (phone numbers, email) is **base64-encoded** in the source and decoded client-side via `<ContactLink>`. This keeps contact details out of server-rendered HTML to prevent scraping.

### ContactLink (`components/ContactLink.tsx`)

Client component. Takes a `base64`-encoded phone/email string, decodes it with `atob()` in `useEffect`, and renders an `<a href="tel:...">` or `<a href="mailto:...">`. Server renders a placeholder `<span>` — no contact data in initial HTML.

---

## Brand

| Token | Value |
|-------|-------|
| `--dark` | `#131311` |
| `--ink` | `#0E0E0C` |
| `--orange` | `#E85B3A` |
| `--orange-light` | `#F5EAE7` |
| `--cream` | `#FAF9F7` |
| `--cream-mid` | `#F2EFE9` |
| `--warm-white` | `#FFFEFB` |
| `--ink-muted` | `#6B6560` |
| `--border` | `#E8E3DC` |

**Fonts:**
- Display/headings: Cormorant Garamond → `--font-cormorant` → CSS var `--font-display` → utility classes `.display` / `.display-italic`
- Body: Plus Jakarta Sans → `--font-jakarta` → CSS var `--font-body`

## Animation Utilities (`lib/hooks.ts` + `app/globals.css`)

Two scroll-triggered animation hooks used across sections:

- **`useScrollReveal()`** — attach `ref` to a `<section>`. All `.reveal` and `.clip-reveal` children start hidden; `IntersectionObserver` adds `.in` class when 8% visible. Supports `.delay-1` through `.delay-4` for staggered entry.
- **`useCountUp(target, duration?)`** — attach `ref` to a `<span>`. Animates from 0 to `target` using cubic-ease when scrolled into view (fires once). Used by Stats.

CSS: `.reveal` fades + slides up; `.clip-reveal` uses `clip-path: inset()` for a left-to-right wipe.

---

## Images

All from `https://fitzrovia.ca/app/uploads/2021/05/`.
Allowed via `remotePatterns` in `next.config.ts`.
All paths in `PARKER_IMAGES` in `lib/parker-data.ts`.

When adding images from a **new domain**, add it to `remotePatterns` in `next.config.ts` first.
Floor plan images are hosted on `https://assets.rentsync.com` (already added).

## Source of Truth for Content

Before implementing floor plans, pricing, or suite data, verify against **https://www.parkerlife.ca/floorplans** (official site). Each floor plan has 2–3 images from `assets.rentsync.com` — always use `images: []` array, never a single `image` field.

---

## Environment Variables

```
# Core (required)
ANTHROPIC_API_KEY=              # Claude API
RESEND_API_KEY=                 # Resend email
FUB_API_KEY=                    # Follow Up Boss CRM
RESEND_FROM_EMAIL=noreply@teamnagpal.ca

# Analytics & Tracking (optional — scripts skipped if unset, no dev errors)
NEXT_PUBLIC_META_PIXEL_ID=              # Meta Business Manager → Events Manager
NEXT_PUBLIC_GA_MEASUREMENT_ID=          # GA4 → Admin → Data Streams (G-XXXXXXXX)
NEXT_PUBLIC_GADS_ID=                    # Google Ads remarketing tag (AW-XXXXXXXX)
NEXT_PUBLIC_GADS_CONVERSION_LABEL=      # Google Ads conversion action label
NEXT_PUBLIC_SITE_URL=                   # Canonical URL (default: https://parker.affordablecondos.ca)
```

Copy `.env.local.example` → `.env.local`. Resend is lazy-initialized inside functions to avoid build-time errors when key is absent.

Core vars + analytics vars are all set in Vercel production.

---

## API Routes

| Route | Method | Body | Returns |
|-------|--------|------|---------|
| `/api/chat` | POST | `{ messages }` | Streaming `text/plain` (Claude) |
| `/api/lead` | POST | lead fields + transcript | `{ success, email, fub }` |
| `/sitemap.xml` | GET | — | XML sitemap (Next.js native) |
| `/robots.txt` | GET | — | Robots file (Next.js native) |

---

## Security

### Chat API bot protection (`app/api/chat/route.ts`)

Three layers, in order:

1. **Bot user-agent block** — Rejects requests where `User-Agent` is absent or matches known scrapers/bots (`bot|crawler|spider|scrapy|python-requests|axios|curl|wget|headless`). Returns 403.

2. **IP rate limiting** — In-memory map keyed by client IP (`x-forwarded-for` → `x-real-ip` → `"unknown"`). Allows 20 requests per 10-minute window per IP. Returns 429 when exceeded. Map is pruned every 5 minutes to prevent unbounded memory growth.

3. **Message validation** — Rejects if:
   - `messages` is not an array or is empty → 400
   - `messages.length > 30` → 400
   - Any message has non-string `role`/`content`, or `content.length > 1000` → 400

### Lead API bogus data rejection (`app/api/lead/route.ts`)

Runs before any external call (FUB / Resend). Returns 422 with a `reason` field.

- **`isBogusEmail`** — rejects known disposable domains (`mailinator.com`, `guerrillamail.com`, `temp-mail.org`, `trashmail.com`, `yopmail.com`, `sharklasers.com`, `throwaway.email`, `test.com`, `fake.com`, `example.com`) and local parts consisting entirely of one repeated character (e.g. `aaa@...`).
- **`isBogusPhone`** — rejects numbers with < 7 digits, all-same-digit patterns (e.g. `4161111111`), and simple sequences (`1234567890` / `0987654321`).

Emma's system prompt also prompts for re-confirmation when it detects these patterns conversationally — the API check is the hard backstop.

### Contact info scrape protection

Phone numbers and email are **never in server-rendered HTML**. They are stored as `base64` constants in `components/Footer.tsx` and decoded by `<ContactLink>` via `atob()` in `useEffect` (client-side only). Bots that don't execute JavaScript see only placeholder `<span>` elements.

---

## Known Issues

See `CONCERNS.md` for full tech debt, security considerations, and fragile areas.

---

## Tailwind v4 Notes

- Uses `@import "tailwindcss"` — **not** `@tailwind base/components/utilities`
- No `tailwind.config.ts`
- Custom utilities in `@layer utilities` in `globals.css`
- Turbopack does not auto-scan components — explicit `@source` directives in `globals.css`
