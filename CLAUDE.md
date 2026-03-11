# CLAUDE.md — Parker Landing Page

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
No git repo. Deploy via Vercel CLI:
```bash
vercel --prod --yes
```
Live URL: **https://parker-wine.vercel.app**
Vercel project: `pauls-projects-c6c6e753/parker`
Always set up git first before deploying — `git commit` then push, then `vercel --prod`.

---

## Stack

- **Next.js 16.1.6** — App Router, TypeScript, Turbopack
- **Tailwind CSS v4** — `@import "tailwindcss"` syntax, NO `tailwind.config.ts`
- **`@anthropic-ai/sdk`** — Claude streaming (`claude-sonnet-4-6`)
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

## Hero Component (`components/Hero.tsx`)

Two completely separate layouts — no shared markup:

**Mobile (`lg:hidden`):**
- Top 48%: hero image with PARKER wordmark + tagline + CTA button
- Bottom 52%: dark panel with "Move In Today" headline, 2-column incentives grid, "Chat with Emma" CTA bar pinned at bottom

**Desktop (`hidden lg:block/flex`):**
- Full-screen hero image
- Left: PARKER wordmark + tagline + "Book a Private Tour" button
- Right: frosted glass panel — "Move In / Today" + 6 incentives list + "Chat with Emma to book your tour →"

---

## Nav Component (`components/Nav.tsx`)

- Logo: `h-[42px] w-36` (50% larger than original)
- "Presented by / Garima Nagpal" text to the right of logo with divider
- Both adapt colour based on `scrolled` state (white on hero, dark on scroll)
- "Book a Tour" button → calls `onOpenChat()`
- Mobile menu: "Book a Tour" → calls `onOpenChat()` + closes menu

---

## Incentives Component (`components/Incentives.tsx`)

Displayed between Stats and About. Contains:
- 4 pricing cards — net effective is the hero number, list price is secondary fine print
- "What's Included" list with 6 perks + icons
- "Book a Private Tour" CTA panel → "Chat with Emma" button

---

## Footer (`components/Footer.tsx`)

3-column grid:
1. Parker logo + tagline
2. Building address only (no phone/email for Parker)
3. Garima Nagpal · RE/MAX Hallmark Realty · Direct: 416-312-5282 · Office: 416-494-7653 · Garima@TeamNagpal.ca

Bottom bar: copyright + "Presented by Garima Nagpal · RE/MAX Hallmark Realty"

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
ANTHROPIC_API_KEY=        # Claude API (required for chat)
RESEND_API_KEY=           # Resend email (required for lead emails)
FUB_API_KEY=              # Follow Up Boss (required for CRM)
RESEND_FROM_EMAIL=noreply@teamnagpal.ca
```

Copy `.env.local.example` → `.env.local`. Resend is lazy-initialized inside functions to avoid build-time errors when key is absent.

All 4 vars are already set in Vercel production.

---

## API Routes

| Route | Method | Body | Returns |
|-------|--------|------|---------|
| `/api/chat` | POST | `{ messages }` | Streaming `text/plain` (Claude) |
| `/api/lead` | POST | lead fields + transcript | `{ success, email, fub }` |

---

## Tailwind v4 Notes

- Uses `@import "tailwindcss"` — **not** `@tailwind base/components/utilities`
- No `tailwind.config.ts`
- Custom utilities in `@layer utilities` in `globals.css`
- Turbopack does not auto-scan components — explicit `@source` directives in `globals.css`
