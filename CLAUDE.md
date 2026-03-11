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

---

## Data Layer (`lib/parker-data.ts`)

**Single source of truth** — update content here, not in components.

| Export | Contents |
|--------|----------|
| `PARKER_INFO` | Building name, address, tagline, stats, amenities list, suite types |
| `PARKER_PRICING` | 4 suite tiers with list price, net effective, free months |
| `PARKER_INCENTIVES` | 6 incentive items with icon key + text |
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
- Collects 6 fields: name, email, phone, move-in date, suite type, budget
- On collecting all 6, outputs `<lead_data>{...}</lead_data>` which auto-fires lead capture
- Signs off: *"I'll pass your details along to our team — Garima will reach out personally to confirm your tour time."*

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
              ↓ detects <lead_data>
         /api/lead (POST)
              ↓ parallel
         Resend email → garima@teamnagpal.ca
         FUB POST /v1/events → creates/updates person
              ↓ on success, get personId
         FUB POST /v1/notes → full chat transcript
```

**`/api/lead` body:**
```json
{
  "name": "", "email": "", "phone": "",
  "moveIn": "", "suiteType": "", "budget": "",
  "source": "Parker Chatbot",
  "transcript": "=== Parker Chatbot Transcript ===\n\nProspect: ...\nEmma: ..."
}
```

**FUB note format:**
```
=== Parker Chatbot Transcript ===

Prospect: Hi there
Emma: Welcome to Parker...
```

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
- "What's Included" list with 6 perks + icons
- "Book a Private Tour" CTA panel → "Chat with Emma" button

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
| `--cream` | `#FAF9F7` |
| `--ink-muted` | `#6B6560` |

**Fonts:**
- Display/headings: Cormorant Garamond → `--font-cormorant` → `.display` / `.display-italic`
- Body: Plus Jakarta Sans → `--font-jakarta`

---

## Images

All from `https://fitzrovia.ca/app/uploads/2021/05/`.
Allowed via `remotePatterns` in `next.config.ts`.
All paths in `PARKER_IMAGES` in `lib/parker-data.ts`.

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
