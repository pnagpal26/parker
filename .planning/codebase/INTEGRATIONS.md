# External Integrations

**Analysis Date:** 2025-03-13

## APIs & External Services

**AI & Chat:**
- Anthropic Claude API - AI chatbot responses for "Emma" leasing representative
  - SDK: `@anthropic-ai/sdk` v0.78.0
  - Model: `claude-sonnet-4-6`
  - Auth: `ANTHROPIC_API_KEY` (environment variable)
  - Endpoint: `POST https://api.anthropic.com/v1/messages`
  - Used in: `app/api/chat/route.ts` (streaming responses)
  - System prompt: `PARKER_SYSTEM_PROMPT` from `lib/parker-data.ts` (193 lines, instructs Emma behavior, lead collection)

## Data Storage

**Databases:**
- None (fully serverless, no persistent backend database)

**File Storage:**
- Fitzrovia CDN - Serves all building/suite photography
  - Provider: Custom domain (`fitzrovia.ca`)
  - Allowed path pattern: `https://fitzrovia.ca/app/uploads/2021/05/*`
  - Configured in `next.config.ts` via `remotePatterns`
  - All URLs maintained in `PARKER_IMAGES` object in `lib/parker-data.ts`
  - 19 total images (hero, logo, exterior, amenities carousel, model suites, amenity details)

**Caching:**
- None detected (no Redis, Memcached, or CDN caching logic)

## Authentication & Identity

**Auth Provider:**
- Custom form + API validation
  - No third-party auth (no Auth0, Firebase, Clerk, etc.)
  - Lead capture via chat conversation → POST `/api/lead` with email/phone/name
  - Bogus data validation in `app/api/lead/route.ts`: email domain + phone pattern checks

**Contact Info Scrape Protection:**
- Phone numbers and email in `components/Footer.tsx` stored as **base64-encoded constants**
- Decoded client-side via `<ContactLink>` component (`useEffect` + `atob()`)
- Server-rendered HTML contains only placeholder `<span>` elements — prevents bot scraping

## Email & Communications

**Email Service:**
- Resend v6.9.3 - Transactional email for lead notifications
  - Auth: `RESEND_API_KEY` (environment variable)
  - Recipient: `garima@teamnagpal.ca` (hard-coded in `lib/resend.ts`)
  - From: `noreply@teamnagpal.ca` (via `RESEND_FROM_EMAIL` env var)
  - Trigger: POST `/api/lead` (after chatbot detects `<lead_data>` block)
  - Email template: HTML-formatted lead card with prospect details
  - Lazy-initialization in `lib/resend.ts` to avoid build-time errors when key absent
  - Implementation: `sendLeadEmail(lead)` function in `lib/resend.ts`

## CRM & Lead Management

**Follow Up Boss (FUB) - CRM Integration:**
- API endpoint: `https://api.followupboss.com/v1`
- Auth method: Basic Auth (API key as username, empty password)
  - Credentials: `Authorization: Basic ${base64(apiKey + ':')}`
  - Header: `FUB_API_KEY` (environment variable)
  - Custom headers: `X-System: Parker Website`, `X-System-Key: ${apiKey}`

**Lead Creation:**
- Endpoint: `POST /v1/events`
- Triggered: In `/api/lead` route after email sent (via `createFUBLead()`)
- Payload includes:
  - Person: first name, last name, email (type: work), phone (type: mobile)
  - Source: "Parker Website"
  - Type: "Registration"
  - Tags: `["parker", "parker-website"]`
  - Note: Structured summary (move-in, suite type, budget, message, source)
- Response: Returns `personId` for later transcript linking
- Implementation: `createFUBLead(lead)` in `lib/fub.ts`

**Transcript/Note Creation:**
- Endpoint: `POST /v1/notes`
- Triggered: After lead created (if `personId` present and `transcript` exists)
- Payload:
  - `personId`: from lead creation response
  - `body`: full chat transcript (formatted as `=== Parker Chatbot Transcript ===\n\nProspect: ...\nEmma: ...`)
  - `isHtml`: false
- CRITICAL: `await`ed before response returned — fire-and-forget causes Vercel to kill request before completion
- Implementation: `createFUBNote(personId, transcript)` in `lib/fub.ts`
- Used in: `app/api/lead/route.ts` (awaited on line 72)

## Analytics & Tracking

**Meta Pixel (Facebook/Instagram):**
- Pixel ID: `NEXT_PUBLIC_META_PIXEL_ID` (env var, production: `1928979144653218`)
- Injected: `app/layout.tsx` via `<Script strategy="afterInteractive">` (only if env var set)
- Events fired:
  - `PageView` (automatic on every page load)
  - `ViewContent` (fired when user opens chatbot) — in `components/Chatbot.tsx`
  - `Lead` (fired when `<lead_data>` detected) — in `components/Chatbot.tsx`
- Implementation: Inline fbq pixel script, conditionally rendered

**Google Analytics 4 (GA4):**
- Measurement ID: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (env var, production: `G-3EFNE69Y89`)
- Injected: `app/layout.tsx` via `<Script strategy="afterInteractive">` (only if env var set)
- gtag initialization with dataLayer
- Events fired (from `components/Chatbot.tsx`):
  - `chat_opened` - Any "Chat with Emma" / "Book a Tour" CTA clicked (intent audience)
  - `chat_started` - User sends first message (engagement audience)
  - `lead_captured` - `<lead_data>` detected (conversion audience)
- Implementation: Google Tag Manager gtag.js library, custom event tracking

**Google Ads (Google Ads Conversion):**
- Remarketing Tag ID: `NEXT_PUBLIC_GADS_ID` (env var, production: `AW-860175244`)
- Conversion Label: `NEXT_PUBLIC_GADS_CONVERSION_LABEL` (env var, production: `zFHzCN6Q0IYcEIz3lJoD`)
- Injected: Part of GA4 script in `app/layout.tsx` (configured via gtag)
- Conversion fires: When `lead_captured` event fires (via `send_to: GADS_ID/GADS_CONVERSION_LABEL`)
- Implementation: Google Ads conversion tracking pixels loaded as part of GA4 setup
- Conversion action: "Parker Lead" — Submit lead form, Count: One, 30-day attribution window

**Retargeting Strategy:**
- Warm audience: `chat_opened` fired, `lead_captured` NOT fired → "pick up where you left off" ads
- Hot audience: `chat_started` fired, `lead_captured` NOT fired → higher-value retargeting
- Suppression list: `lead_captured` fired → exclude from all ads (converted leads)

**Analytics Scripts Behavior:**
- All analytics scripts are **conditionally rendered** — if env var absent, script silently skipped
- No errors in development when vars unset
- Implementation: Ternary operators in `app/layout.tsx` and `components/Chatbot.tsx` check env var presence before rendering `<Script>` tags

## Webhooks & Callbacks

**Incoming:**
- `/api/chat` - POST endpoint for chatbot messages
  - Accepts: `{ messages: Array<{ role, content }> }`
  - Returns: Streaming text/plain (Claude response)
  - Rate limited: 20 requests per 10 minutes per IP
  - Bot UA blocked: Returns 403 if User-Agent matches bot patterns

- `/api/lead` - POST endpoint for lead capture
  - Accepts: Lead object + transcript from `/api/chat` streaming detection
  - Validation: Bogus email/phone rejected (422) before hitting FUB/Resend
  - Trigger: Auto-detected when Claude outputs `<lead_data>...</lead_data>` block
  - Implementation: `app/api/lead/route.ts`

**Outgoing:**
- Email to `garima@teamnagpal.ca` (Resend) — triggered by `/api/lead`
- FUB event POST to `https://api.followupboss.com/v1/events` — triggered by `/api/lead`
- FUB note POST to `https://api.followupboss.com/v1/notes` — triggered by `/api/lead` (awaited)
- Analytics events to Meta Pixel, GA4, Google Ads — triggered by user interactions + lead capture

## Environment Configuration

**Required env vars (core functionality):**
- `ANTHROPIC_API_KEY` - Claude API authentication
- `RESEND_API_KEY` - Email service authentication
- `FUB_API_KEY` - Follow Up Boss CRM authentication
- `RESEND_FROM_EMAIL` - Email sender address (default: `noreply@teamnagpal.ca`)

**Optional env vars (analytics — scripts silently skipped if unset):**
- `NEXT_PUBLIC_META_PIXEL_ID` - Meta Pixel tracking
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4 measurement ID
- `NEXT_PUBLIC_GADS_ID` - Google Ads remarketing tag
- `NEXT_PUBLIC_GADS_CONVERSION_LABEL` - Google Ads conversion label
- `NEXT_PUBLIC_SITE_URL` - Canonical URL (default: `https://parker.affordablecondos.ca`)

**Secrets location:**
- `.env.local` (local development) — template: `.env.local.example`
- Vercel project settings (production) — all vars set in Environment Variables dashboard

**Never committed:**
- `.env.local` (ignored via `.gitignore`)
- No `.env` files in repo (secrets managed via Vercel)

## Data Flow Summary

```
User opens chatbot
  ↓
POST /api/chat with messages
  ↓
Claude streams response via @anthropic-ai/sdk
  ↓
[Client detects <lead_data> block, fires analytics events]
  ↓
fetch POST /api/lead (auto-triggered on lead_data detection)
  ↓
[Validation: email + phone bogus check]
  ↓
[Parallel dispatch]
  ├─ Resend email → garima@teamnagpal.ca
  └─ FUB event POST → /v1/events
       ↓ (on success, extract personId)
       └─ FUB note POST → /v1/notes (AWAITED)
  ↓
Response: { success, email, fub }
```

---

*Integration audit: 2025-03-13*
