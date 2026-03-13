# Architecture

**Analysis Date:** 2026-03-13

## Pattern Overview

**Overall:** Server-side streaming chatbot with client-driven page composition and lead capture pipeline.

**Key Characteristics:**
- Next.js 16 App Router with TypeScript for type safety
- Claude AI streaming via `/api/chat` with automatic lead detection
- Client-side state management for chatbot visibility (`page.tsx`)
- Content stored in centralized data layer (`lib/parker-data.ts`)
- Three-way lead validation before external service calls (email, CRM)

## Layers

**Presentation Layer:**
- Purpose: Render responsive UI components and handle user interactions
- Location: `components/`
- Contains: Page sections (Hero, Nav, Stats, Amenities, Gallery, Footer), Chatbot interface, form inputs
- Depends on: Data from `lib/parker-data.ts`, client-side state
- Used by: `app/page.tsx` (main layout orchestration)

**Data Layer:**
- Purpose: Single source of truth for all static content, pricing, images, and AI system prompt
- Location: `lib/parker-data.ts`
- Contains: `PARKER_INFO`, `PARKER_PRICING`, `PARKER_INCENTIVES`, `PARKER_IMAGES`, `PARKER_SYSTEM_PROMPT`
- Depends on: None
- Used by: Components, API routes, metadata generation

**API Layer:**
- Purpose: External request handling, streaming, validation, and service orchestration
- Location: `app/api/`
- Routes:
  - `/api/chat` - POST: Claude streaming with lead detection
  - `/api/lead` - POST: Lead validation and capture (Resend + FUB)
- Depends on: Anthropic SDK, Resend client, FUB API, rate limiting
- Used by: Client-side Chatbot via fetch

**Service Layer:**
- Purpose: Encapsulate external integrations (email, CRM)
- Location: `lib/resend.ts`, `lib/fub.ts`
- Contains: `sendLeadEmail()`, `createFUBLead()`, `createFUBNote()`
- Depends on: API credentials from environment
- Used by: `/api/lead` route

**Metadata & SEO:**
- Purpose: OG tags, JSON-LD structured data, analytics script injection
- Location: `app/layout.tsx`
- Depends on: `PARKER_IMAGES`, `PARKER_INFO`, `PARKER_PRICING`
- Used by: Search engines, social platforms, analytics services

## Data Flow

**Chatbot Conversation Flow:**

1. User clicks "Chat with Emma" / "Book a Tour" CTA
2. `app/page.tsx` sets `chatOpen: true` → `<Chatbot open={true} setOpen={setChatOpen} />`
3. User types message → `Chatbot` component sends POST to `/api/chat` with `{ messages }`
4. `/api/chat` validates message (array, length, content) and IP rate limit
5. `/api/chat` calls Anthropic `messages.create()` with `PARKER_SYSTEM_PROMPT`
6. Claude response streams back as `text/plain` chunked response
7. `Chatbot` component renders streaming text in real-time
8. `/api/chat` detects `<lead_data>` block in full stream response
9. If detected, `/api/chat` extracts JSON + builds transcript, fires async POST to `/api/lead` (fire-and-forget)
10. User sees Emma's sign-off: *"I'll pass your details along..."*

**Lead Capture Pipeline:**

1. `/api/chat` detects `<lead_data>{...}</lead_data>` block → async fetch to `/api/lead`
2. `/api/lead` receives: `{ name, email, phone, moveIn, suiteType, budget, source, transcript }`
3. **Validation before external calls:**
   - Check email: not empty → not in bogus domain list → not all-same-char local part
   - Check phone: if provided → min 7 digits → not all-same digit → not sequential
4. If validation fails → return 422 with `{ reason: "bogus_email" | "bogus_phone" }`
5. If valid → parallel execute via `Promise.allSettled()`:
   - `sendLeadEmail(lead)` → Resend email to garima@teamnagpal.ca
   - `createFUBLead(lead)` → POST to FUB /v1/events, get `personId` back
6. If FUB succeeds and transcript exists:
   - `await createFUBNote(personId, transcript)` → POST to FUB /v1/notes (AWAITED, not fire-and-forget)
7. Return `{ success: true, email: boolean, fub: boolean }`

**Page Rendering Flow:**

1. `app/layout.tsx` loads metadata, JSON-LD, and analytics scripts (if env vars set)
2. `app/page.tsx` renders `<main>` with all section components in sequence
3. Each component reads data from `lib/parker-data.ts` (pricing, images, amenities)
4. `<Chatbot>` is controlled by `chatOpen` state in `<Page>`, receives callbacks to manage state

**State Management:**
- `chatOpen: boolean` in `app/page.tsx` (root level)
- Passed as `open={chatOpen} setOpen={setChatOpen}` to `<Chatbot>`
- All callbacks from Nav, Hero, Incentives propagate `onOpenChat()` → `setChatOpen(true)`
- No global state provider (React Context or Redux) — single source of truth in page component

## Key Abstractions

**PARKER_INFO, PARKER_PRICING, PARKER_INCENTIVES, PARKER_IMAGES:**
- Purpose: Centralized content repository to avoid hardcoding strings in components
- Examples: `lib/parker-data.ts`
- Pattern: Exported constants read by components and API routes; JSON-LD schema sources live data from these exports

**PARKER_SYSTEM_PROMPT:**
- Purpose: Embed Emma chatbot personality, guardrails, and lead-collection logic in one multi-line string
- Examples: `lib/parker-data.ts` (lines 114–191)
- Pattern: Passed directly to Anthropic `messages.create()` system parameter; defines conversation rules and lead data XML format

**Rate Limiter (IP-based):**
- Purpose: Prevent abuse of `/api/chat` endpoint by limiting requests per IP per 10-minute window
- Examples: `app/api/chat/route.ts` (lines 9–38)
- Pattern: In-memory `Map<string, { count, resetAt }>`, checked on every request, pruned every 5 minutes

**Validation Functions:**
- Purpose: Reject obviously fake/test data before hitting external services
- Examples: `isBogusEmail()`, `isBogusPhone()` in `app/api/lead/route.ts`
- Pattern: Regex + domain blacklist checks; reused by Emma in system prompt for conversational double-check

**ContactLink Component:**
- Purpose: Prevent email/phone scraping by storing contact info as base64, decoded client-side only
- Examples: `components/ContactLink.tsx`
- Pattern: Server renders placeholder `<span>`, `useEffect` calls `atob()` and renders actual `<a href="tel:|mailto:">`, ensuring contact details never in server HTML

## Entry Points

**Web Page:**
- Location: `app/page.tsx`
- Triggers: User navigates to https://parker.affordablecondos.ca
- Responsibilities: Render full landing page, manage chatbot visibility state, compose all section components

**Chat API:**
- Location: `app/api/chat/route.ts`
- Triggers: POST request from `<Chatbot>` component with message array
- Responsibilities: Rate limit by IP, validate message structure, stream Claude response, detect and trigger lead capture

**Lead API:**
- Location: `app/api/lead/route.ts`
- Triggers: Async POST from `/api/chat` when `<lead_data>` block detected
- Responsibilities: Validate email/phone, send Resend email, create FUB lead + note, return status

**Sitemap & Robots:**
- Location: `app/sitemap.ts`, `app/robots.ts`
- Triggers: GET /sitemap.xml, GET /robots.txt
- Responsibilities: Serve XML sitemap, disallow /api/, allow root

**Root Layout (Metadata & Analytics):**
- Location: `app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Inject `<head>` metadata, JSON-LD, Meta Pixel script, GA4 + Google Ads scripts (conditional on env vars)

## Error Handling

**Strategy:** Three-tier validation with progressive fallback; external service errors logged, response still returned.

**Patterns:**
- `/api/chat`: Rejects requests at entry (bot UA, rate limit) before processing; returns 403/429; validates message structure before Anthropic call
- `/api/lead`: Rejects bogus data (422) before hitting Resend/FUB; uses `Promise.allSettled()` so partial failures don't block response
- Components: No error boundaries; streaming failures logged to console; timeouts handled by Chatbot UI (artificial 2500ms delay)
- FUB note: `await createFUBNote()` ensures note completes before response sent; fire-and-forget would be killed by Vercel

## Cross-Cutting Concerns

**Logging:** Console.error/warn in API routes only; no structured logging framework; caught errors in try/catch blocks.

**Validation:**
- Chat API: Message count, structure, length; bot UA detection
- Lead API: Email domain blacklist + local part check; phone digit patterns

**Authentication:**
- Chat API: Implicit (bot UA + IP rate limit); no user login required
- Lead API: No auth; POST accepts any origin (implicit CORS)
- External services: API keys in environment variables, never exposed client-side

**Analytics Integration:**
- Meta Pixel: `fbq('init')` + `fbq('track', 'PageView')` on load; `ViewContent` on chat opened; `Lead` on lead captured (via Chatbot component)
- GA4: `gtag('config')` on load; custom events in Chatbot (chat_opened, chat_started, lead_captured) for funnel tracking
- Google Ads: Conversion pixel fires on `lead_captured` event with conversion label

---

*Architecture analysis: 2026-03-13*
