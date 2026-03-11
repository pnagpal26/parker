# External Integrations

**Analysis Date:** 2025-03-11

## APIs & External Services

**AI / Chatbot:**
- Claude (Anthropic) - AI assistant Emma for lease inquiries
  - SDK/Client: `@anthropic-ai/sdk` 0.78.0
  - Model: `claude-sonnet-4-6`
  - Auth: `ANTHROPIC_API_KEY` (Bearer token)
  - Endpoint: `POST /api/chat` (streaming)
  - System prompt: `PARKER_SYSTEM_PROMPT` from `lib/parker-data.ts`

**CRM / Lead Management:**
- Follow Up Boss (FUB) - Prospect tracking and lead management
  - Base URL: `https://api.followupboss.com/v1`
  - Auth: Basic auth with `FUB_API_KEY` (Base64-encoded `{apiKey}:`)
  - Endpoints used:
    - `POST /v1/events` - Create/update person + initial note (`lib/fub.ts:createFUBLead`)
    - `POST /v1/notes` - Add transcript note (`lib/fub.ts:createFUBNote`)
  - Headers: `X-System: Parker Website`, `X-System-Key: {FUB_API_KEY}`
  - Env var: `FUB_API_KEY`

**Email / Notifications:**
- Resend - Transactional email service
  - SDK/Client: `resend` 6.9.3
  - Auth: `RESEND_API_KEY` (API key)
  - Endpoint: `emails.send()` via Resend SDK
  - Recipient: `garima@teamnagpal.ca` (hardcoded in `lib/resend.ts:sendLeadEmail`)
  - Sender: `RESEND_FROM_EMAIL` env var (default: `noreply@teamnagpal.ca`)
  - Purpose: Formatted HTML email with lead details (name, email, phone, moveIn, suiteType, budget, message)

## Data Storage

**Databases:**
- Not applicable - stateless application
- All data ephemeral (chat transcript, lead info processed inline)
- No persistent database

**File Storage:**
- Local filesystem: Not used
- Remote CDN: fitzrovia.ca (image hosting only, read-only)
  - All images from `https://fitzrovia.ca/app/uploads/2021/05/`
  - Paths defined in `PARKER_IMAGES` object in `lib/parker-data.ts`

**Caching:**
- None - stateless per-request processing
- Next.js client-side caching for static assets
- Chat messages stored only in browser client-side state

## Authentication & Identity

**Auth Provider:**
- Custom (none) - No user accounts or authentication system
- API-to-service authentication only:
  - Claude API: API key in headers
  - FUB: Basic auth + X-System header
  - Resend: API key in client initialization
- Contact info (phone/email) obscured via base64 encoding in source, decoded client-side only

## Monitoring & Observability

**Error Tracking:**
- None detected - errors logged to console only

**Logs:**
- Console only (via `console.error`, `console.warn`)
- Errors in `/api/chat`: rate limit violations, bot UA blocks, message validation failures
- Errors in `/api/lead`: Resend/FUB failures logged but don't block response
- Chat streaming errors caught and displayed to user

## Analytics & Tracking

**Google Analytics 4:**
- Measurement ID: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (env var, e.g., `G-XXXXXXXX`)
- Injected via `<Script>` in `app/layout.tsx` (strategy: `afterInteractive`)
- Tag Manager: `https://www.googletagmanager.com/gtag/js?id={GA_ID}`
- Conditional: script skipped if env var unset, no build errors

**Google Ads (Remarketing):**
- Remarketing tag ID: `NEXT_PUBLIC_GADS_ID` (env var, e.g., `AW-XXXXXXXX`)
- Conversion label: `NEXT_PUBLIC_GADS_CONVERSION_LABEL`
- Injected via GA4 config in `app/layout.tsx`
- Conversion fired on `lead_captured` event

**Chatbot GA4 Funnel Events** (`components/Chatbot.tsx`):
- `chat_opened` - Any "Chat with Emma" CTA clicked (builds intent audience)
- `chat_started` - User sends first message (engaged audience)
- `lead_captured` - `<lead_data>` detected in Claude response (conversion event)
- All events fire via `window.gtag?.("event", ...)` with category `"Parker Chatbot"`

**Meta Pixel (Facebook):**
- Pixel ID: `NEXT_PUBLIC_META_PIXEL_ID` (env var)
- Injected via `<Script>` in `app/layout.tsx` (strategy: `afterInteractive`)
- Script source: `https://connect.facebook.net/en_US/fbevents.js`
- Events:
  - `PageView` - Automatic on page load (via `fbq('track', 'PageView')`)
  - `ViewContent` - Fired when chat opened (`window.fbq?.("track", "ViewContent", {...})`)
  - `Lead` - Fired when lead captured (`window.fbq?.("track", "Lead", {...})`)
- Conditional: script skipped if env var unset

## CI/CD & Deployment

**Hosting:**
- Vercel - Serverless functions, edge runtime
- Project: `pauls-projects-c6c6e753/parker`
- Deploy command: `vercel --prod --yes`
- Git integration: automatic on push to main branch (if configured)

**Environment Variables:**
- Set in Vercel project settings
- Core + analytics vars required for prod

## Webhooks & Callbacks

**Incoming:**
- None - No webhook receivers

**Outgoing:**
- Follow Up Boss: `POST https://api.followupboss.com/v1/events` (lead creation)
- Follow Up Boss: `POST https://api.followupboss.com/v1/notes` (transcript append)
- Resend: `resend.emails.send()` (email dispatch)
- Google Analytics: beaconed via `gtag()` calls
- Meta Pixel: beaconed via `fbq()` calls

## Lead Capture Flow

```
User → Chat input → /api/chat (POST, streaming)
                        ↓ Claude detects <lead_data>{...}</lead_data>
                    /api/lead (POST, internal fetch)
                        ↓ Promise.allSettled([emailPromise, fubPromise])
                   Resend.emails.send() → garima@teamnagpal.ca
                   createFUBLead() → FUB /v1/events
                        ↓ if FUB success and transcript exists
                   createFUBNote() → FUB /v1/notes (appended, not awaited)
```

**Lead Data Structure** (`lib/resend.ts:LeadData`):
```typescript
{
  name: string
  email: string
  phone: string
  moveIn?: string        // Date string
  suiteType?: string     // e.g., "1 Bedroom"
  budget?: string        // e.g., "$2,500/month"
  message?: string
  source: string         // "Parker Chatbot" or custom
  transcript?: string    // Full conversation history
}
```

## Environment Configuration

**Required (Core):**
1. `ANTHROPIC_API_KEY` - Get from api.anthropic.com
2. `RESEND_API_KEY` - Get from resend.com dashboard
3. `FUB_API_KEY` - Get from Follow Up Boss
4. `RESEND_FROM_EMAIL` - Default: `noreply@teamnagpal.ca`

**Recommended (Analytics):**
1. `NEXT_PUBLIC_META_PIXEL_ID` - Meta Business Manager
2. `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4
3. `NEXT_PUBLIC_GADS_ID` - Google Ads
4. `NEXT_PUBLIC_GADS_CONVERSION_LABEL` - Google Ads conversion action

**Development:**
- Copy `.env.local.example` to `.env.local`
- Add actual API keys (never commit `.env.local`)
- Turbopack dev server reloads on env var changes

**Production (Vercel):**
- Set all env vars in Vercel project settings → Environment Variables
- Build-time vars: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `FUB_API_KEY`
- Runtime vars: All `NEXT_PUBLIC_*` vars (injected into JS bundle)
- No `.env.local` needed in CI/CD

## Security

**API Key Protection:**
- `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `FUB_API_KEY` - Server-side only (never exposed to client)
- Lazy Resend initialization in `lib/resend.ts` - Avoids build-time errors when key missing

**Rate Limiting (Chat API):**
- `/api/chat` enforces IP-based rate limit: 20 requests per 10-minute window
- In-memory map keyed by `x-forwarded-for` → `x-real-ip` → `"unknown"`
- Stale entries pruned every 5 minutes
- Returns 429 when exceeded

**Bot Protection (Chat API):**
- Rejects requests with missing or bot-like User-Agent strings
- Regex: `/bot|crawler|spider|scrapy|python-requests|axios|curl|wget|headless/i`
- Returns 403

**Contact Info Protection:**
- Phone numbers and email in `components/Footer.tsx` stored as base64 constants
- Decoded via `atob()` in `<ContactLink>` component (client-side only)
- Server HTML contains no scrapable contact data, only `<span>` placeholders

**Message Validation (Chat API):**
- Max 30 messages per conversation
- Max 1000 characters per message
- Must be array of `{role: string, content: string}` objects
- Returns 400 for invalid input

---

*Integration audit: 2025-03-11*
