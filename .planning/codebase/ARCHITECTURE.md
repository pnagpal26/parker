# Architecture

**Analysis Date:** 2026-03-11

## Pattern Overview

**Overall:** Single-Page Application (Next.js App Router) with server-side lead capture and external CRM/email integration.

**Key Characteristics:**
- Client-rendered landing page (client component root in `app/page.tsx`)
- Stateless API routes for streaming chat and lead capture
- Content-driven data model (single source of truth in `lib/parker-data.ts`)
- Parallel processing of lead data to Resend (email) and Follow Up Boss (CRM)

## Layers

**Presentation:**
- Purpose: Render interactive landing page sections (Hero, Stats, Gallery, Chatbot)
- Location: `components/`
- Contains: React client components with inline styles and Tailwind utilities
- Depends on: `lib/parker-data.ts` for content; `lib/hooks.ts` for scroll/animation logic
- Used by: `app/page.tsx` (root layout orchestrator)

**State Management & Interaction:**
- Purpose: Manage chat UI state, lead capture state, analytics event firing
- Location: `components/Chatbot.tsx`, `components/Nav.tsx`, `app/page.tsx`
- Contains: `useState`, `useEffect` hooks; event listeners (GA4, Meta Pixel tracking)
- Depends on: Analytics window APIs; `/api/chat` for streaming messages
- Used by: Chat FAB and page-level chat state coordination

**Data Layer (Content):**
- Purpose: Single source of truth for all building info, pricing, images, system prompt
- Location: `lib/parker-data.ts`
- Contains: Exported constants (`PARKER_INFO`, `PARKER_PRICING`, `PARKER_IMAGES`, `PARKER_SYSTEM_PROMPT`)
- Depends on: None (pure data)
- Used by: Components, API routes, metadata generation

**API Routes (Backend):**
- Purpose: Handle chat streaming and lead capture workflows
- Location: `app/api/chat/route.ts`, `app/api/lead/route.ts`
- Contains: Request validation, rate limiting, external API calls
- Depends on: Anthropic SDK, Resend SDK, Follow Up Boss REST API
- Used by: Client-side fetch calls from Chatbot component

**External Integrations:**
- Purpose: Connect to third-party services for email, CRM, analytics
- Location: `lib/resend.ts`, `lib/fub.ts`; scripts in `app/layout.tsx`
- Contains: API client initialization, request building, error handling
- Depends on: Service API keys (environment variables)
- Used by: `/api/lead` route

## Data Flow

**Chat & Lead Capture Flow:**

1. User clicks "Book a Tour" / "Chat with Emma" CTA
2. `app/page.tsx` state: `chatOpen = true`
3. `components/Chatbot.tsx` initializes: sends welcome message to `/api/chat`
4. `/api/chat/route.ts` receives `{ messages: [...] }`, validates, streams response from Claude
5. Claude response is streamed back as `text/plain` chunk by chunk
6. Chatbot UI updates progressively; detects `<lead_data>` XML tag in response
7. On `<lead_data>` detection:
   - `Chatbot.tsx` fires GA4 `lead_captured` event + Google Ads conversion
   - `Chatbot.tsx` fires Resend `Lead` event
   - Response stream completes
8. `/api/chat/route.ts` detects `<lead_data>` in fullText, auto-fires POST to `/api/lead`
9. `/api/lead/route.ts` receives lead object + transcript:
   - Sends email via Resend (parallel)
   - Creates person in FUB (parallel)
   - On FUB success, creates transcript note on person (sequential)
10. Success response returned to client
11. Chatbot shows "Your info has been sent to our team" confirmation badge

**State Management:**
- Chat state: `chatOpen` (boolean) owned by `app/page.tsx`, passed to `Chatbot.tsx` as controlled component
- Chatbot internal state: `messages[]`, `input`, `loading`, `leadCaptured`
- Nav state: `scrolled` (page scroll position), `menuOpen` (mobile menu toggle)
- Analytics state: Fired on specific user actions, sent to external services (no local state)

## Key Abstractions

**ContactLink Component (`components/ContactLink.tsx`):**
- Purpose: Securely display phone/email without exposing to scrapers
- Implementation: Receives base64-encoded contact string, decodes client-side via `atob()` in `useEffect`
- Pattern: Server renders placeholder `<span>` with no contact data; client replaces with `<a href="tel:|mailto:">`
- Used by: `components/Footer.tsx` for Garima's phone/email

**useCountUp Hook (`lib/hooks.ts`):**
- Purpose: Animate numeric counters when section enters viewport
- Pattern: Observes element with IntersectionObserver, triggers easing animation via `requestAnimationFrame`
- Used by: `components/Stats.tsx` for stat numbers (Location, Area, Storeys, Suites)

**useScrollReveal Hook (`lib/hooks.ts`):**
- Purpose: Trigger CSS animations (`.in` class) when elements enter viewport
- Pattern: IntersectionObserver on all `.reveal`, `.clip-reveal` children; adds `.in` class on intersection
- Used by: `components/Stats.tsx`, `components/Gallery.tsx`, `components/Incentives.tsx`

**Leasing Representative Prompt (`PARKER_SYSTEM_PROMPT`):**
- Purpose: Multi-turn conversational AI instructions for Emma chatbot
- Contains: Property facts, current pricing/incentives, guardrails, lead collection instructions
- Pattern: Pre-built system prompt with embedded `<lead_data>` XML template; Claude fills in blanks
- Updated via: `lib/parker-data.ts` (single edit location)

## Entry Points

**Homepage (`app/page.tsx`):**
- Location: `app/page.tsx`
- Triggers: Direct navigation to `/` or deployed domain
- Responsibilities: Render full page layout; own `chatOpen` state; coordinate Chatbot open/close

**Root Layout (`app/layout.tsx`):**
- Location: `app/layout.tsx`
- Triggers: Every request (wraps all routes)
- Responsibilities: Set metadata/OG tags, inject JSON-LD structured data, conditionally load analytics scripts (Meta Pixel, GA4, Google Ads)

**Chat API (`app/api/chat/route.ts`):**
- Location: `app/api/chat/route.ts`
- Triggers: POST from Chatbot component (on user message)
- Responsibilities: Validate request, check rate limit, stream Claude response, detect lead capture trigger

**Lead Capture API (`app/api/lead/route.ts`):**
- Location: `app/api/lead/route.ts`
- Triggers: Auto-fire from `/api/chat` on `<lead_data>` detection; also callable directly
- Responsibilities: Validate lead fields, send Resend email, create FUB person, append transcript note

## Error Handling

**Strategy:** Graceful degradation with fallback contact info (Garima's phone/email).

**Patterns:**

- **Chat API errors:** Returns 403 (bot), 429 (rate limit), 400 (validation), 500 (internal). Client UI shows fallback: "I'm having trouble connecting right now. Please call 416-312-5282 or email Garima@TeamNagpal.ca"
- **Lead capture errors:** Resend and FUB calls use `Promise.allSettled()` to allow one to fail without blocking the other. Error logged, success status returned to client.
- **Rate limiting:** In-memory map of IP → request count/window. Stale entries pruned every 5 minutes.
- **Validation:** All messages validated before Claude call (array, non-empty, max 30 messages, max 1000 chars each).

## Cross-Cutting Concerns

**Logging:**
- Server: `console.error()` in API routes for validation, API failures, JSON parse errors
- Client: Browser console only (no remote logging integrated)

**Validation:**
- API messages: Checked in `/api/chat/route.ts` (structure, length, content type)
- Lead data: Email required in `/api/lead/route.ts`; FUB name split into first/last

**Authentication:**
- Chat API: No user auth; protected via bot UA block + IP rate limit
- Lead API: No auth required; relies on rate limiting in chat API
- External services: Anthropic, Resend, FUB all use API keys from environment; Resend lazy-initialized in function scope

**Security:**
- Contact info (phone/email) encoded as base64, decoded client-side only
- Bot user-agent block on `/api/chat` (403 response)
- Rate limiting: 20 requests per IP per 10 minutes
- Content Security Policy: Not explicitly set (browser defaults apply)
- HTTPS: Enforced on Vercel deployment

---

*Architecture analysis: 2026-03-11*
