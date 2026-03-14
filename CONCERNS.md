# Codebase Concerns

## Tech Debt

1. **In-memory rate limiter** (`app/api/chat/route.ts`) — module-level `Map` is reset on every cold start/serverless invocation. Ineffective in production serverless environments (Vercel). Should use Redis/KV store for distributed rate limiting.

2. **Hardcoded artificial delay** (`components/Chatbot.tsx`) — 2500ms `setTimeout` before each fetch is hardcoded. Not configurable, not skippable in tests.

3. **Incomplete error handling** — Lead capture in `components/Chatbot.tsx` uses fire-and-forget `fetch('/api/lead', ...)` with no retry logic. If the POST fails, the lead is silently lost. *(Note: the `/api/lead` route itself awaits all downstream calls — the fire-and-forget here is only the client→API leg.)*

4. **Regex-based lead extraction** — `<lead_data>{...}</lead_data>` parsing in the chat stream relies on regex string matching. Fragile if Claude's output deviates slightly from expected format.

5. **No lead persistence** — Leads are sent to FUB/email but not stored anywhere locally. If both integrations fail, the lead is permanently lost with no fallback.

## Known Bugs

1. **Invalid base64 handling** (`components/ContactLink.tsx`) — `atob()` in `useEffect` has no try/catch. A malformed base64 string would throw an uncaught error.

2. **Redundant transcript cleaning** — Transcript is formatted twice: once in `Chatbot.tsx` before POSTing, and potentially again in `/api/lead`. Could cause double-processing or subtle formatting inconsistencies.

~~**Input focus lost after Emma responds**~~ — *Fixed 2026-03-11. `useEffect` on `loading` now re-focuses the input after each response.*

~~**FUB note not received (fire-and-forget killed by Vercel)**~~ — *Fixed 2026-03-11. `createFUBNote()` is now `await`ed before the `/api/lead` response is returned.*

~~**Duplicate FUB notes on lead capture**~~ — *Fixed 2026-03-14. `createFUBNote()` removed from `/api/lead`. Notes are now created solely via `sendBeacon → /api/transcript` on panel close, guaranteeing exactly one note per session with the most complete transcript.*

~~**Double `/api/lead` call on every lead capture**~~ — *Fixed 2026-03-14. Both `/api/chat/route.ts` (server-side) and `Chatbot.tsx` (client-side) were independently calling `/api/lead` on `<lead_data>` detection, firing within 50–250ms of each other. Removed the redundant server-side fetch; client-side call is the single source of truth.*

## Security Considerations

1. **Bot UA filter is weak** — Regex pattern in `app/api/chat/route.ts` can be easily bypassed by setting a browser-like UA. Provides minimal real protection.

2. **No request signing** — `/api/lead` endpoint has no authentication. Any actor who discovers the endpoint can POST fake leads directly. *(Bogus data validation — 2026-03-11 — partially mitigates spam leads, but doesn't prevent targeted abuse.)*

3. **Base64 obfuscation** — Contact info in `components/Footer.tsx` uses `atob()` for scrape protection, not encryption. Determined scrapers running JS will still extract it.

4. **API credentials in environment** — `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `FUB_API_KEY` in `.env.local`. Standard practice, but any accidental commit or Vercel misconfiguration would expose them.

5. **Potential XSS in email** — Transcript content from user chat messages is included verbatim in Resend email HTML. If not sanitized, could allow HTML injection in email clients.

6. **Google Ads conversion label in env** — `NEXT_PUBLIC_GADS_CONVERSION_LABEL` is public — exposed to client. This is by design (needed for gtag), but worth noting it's visible in page source.

## Performance Bottlenecks

1. **Large Chatbot component** — `components/Chatbot.tsx` handles state, streaming, lead detection, analytics, and rendering in a single component. Heavy re-renders on every streamed token.

2. **Message re-renders** — No `useMemo`/`React.memo` on message list items. Each streamed character triggers a full message list re-render.

3. **Image loading** — All carousel images use `fitzrovia.ca` CDN without explicit `priority` hints beyond the hero. No blur placeholders on gallery images.

4. **No caching** — `/api/chat` and `/api/lead` have no response caching (appropriate for POST, but no cache headers set on static assets either).

## Fragile Areas

1. **System prompt string** (`lib/parker-data.ts`) — `PARKER_SYSTEM_PROMPT` is a long inline template literal. Easy to accidentally break formatting or introduce subtle instruction conflicts.

2. **FUB integration** (`lib/fub.ts`) — No retry, no circuit breaker. If FUB API is down, the lead note silently fails without affecting the email path.

3. **Deployment dependency** — Must run `vercel --prod --yes` manually after `git push`. No CI/CD pipeline. Human step required for every deploy.

4. **External image CDN** (`fitzrovia.ca`) — All product images served from a third-party domain not under project control. If CDN goes down or URL structure changes, all images break.

5. **TypeScript strictness** — No `tsconfig.json` strict mode flags noted. Type coverage may have gaps in API response handling.

## Scaling Limits

1. **Rate limiter** — 20 req/10min per IP via in-memory map. Resets on cold start; won't work across multiple Vercel instances.

2. **Anthropic API limits** — No queue or backpressure. High traffic would hit rate limits without graceful degradation.

3. **Resend email quota** — No checks against Resend sending limits. High lead volume could exhaust quota silently.

4. **Image carousel** — `components/Gallery.tsx` and `components/Amenities.tsx` load all images upfront with no lazy loading strategy beyond Next.js defaults.

## At-Risk Dependencies

- `@anthropic-ai/sdk` — Pinned to `^0.78`. Breaking changes in streaming API format would require immediate update.
- `resend` — Pinned to `^6.9`. Email delivery depends entirely on this third-party service.
- Tailwind CSS v4 — Still relatively new; `@import "tailwindcss"` syntax and no config file is v4-specific. Upgrading or downgrading is non-trivial.
- Next.js 16 — Very recent version. Some ecosystem tooling (ESLint plugins, etc.) may lag.

## Missing Features / Future Risk

1. **No conversion funnel analytics persistence** — GA4/Meta Pixel events fire client-side only. No server-side event logging for funnel analysis.

2. **No retry mechanism** — Both `/api/chat` (Anthropic) and `/api/lead` (FUB/Resend) lack retry logic on transient failures.

3. **No A/B testing infrastructure** — Single Hero layout variant. Conversion optimization would require adding feature flag/experiment framework.

4. **Test coverage gaps** — No tests for: `/api/chat` streaming logic, `/api/lead` parallel integrations, `Chatbot` component stream handling, `ContactLink` base64 decode, E2E lead capture flow, or performance regression.
