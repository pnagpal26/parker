# Codebase Concerns

**Analysis Date:** 2026-03-13

## Tech Debt

**In-Memory Rate Limiter (Serverless Ineffective):**
- Issue: `/api/chat/route.ts` uses module-level `Map<string, { count, resetAt }>` for IP-based rate limiting. Map resets on every cold start and doesn't persist across Vercel serverless instances.
- Files: `app/api/chat/route.ts` (lines 14-38)
- Impact: Rate limiting is non-functional in production. High traffic can trigger unlimited Anthropic API calls, exhausting quota without protection. DDoS mitigation fails.
- Fix approach: Replace with Redis/KV store (e.g., Vercel KV, Upstash). Consider distributed rate limiting library (e.g., `@upstash/ratelimit`).

**Hardcoded Artificial Delay:**
- Issue: `components/Chatbot.tsx` line 109 has hardcoded `2500ms` `setTimeout` before fetching `/api/chat`. Not configurable, not skippable in tests or retry scenarios.
- Files: `components/Chatbot.tsx` (line 109)
- Impact: Every chat message takes exactly 2.5 seconds + actual API latency. Degrades UX when retrying failed requests or in tests.
- Fix approach: Make delay configurable via environment variable or component prop. Allow override in testing mode.

**Fire-and-Forget Lead Capture:**
- Issue: `/api/chat/route.ts` (line 130-134) and `components/Chatbot.tsx` (line 143-147) both fire `fetch('/api/lead', ...)` without awaiting. If POST fails silently, lead is lost with no retry.
- Files: `app/api/chat/route.ts`, `components/Chatbot.tsx`
- Impact: Network blips or transient API failures cause silent lead loss. No observability into failure rate.
- Fix approach: Await lead POST or implement client-side retry queue. Add error callback to set UI state for user feedback.

**Regex-Based Lead Data Extraction:**
- Issue: `<lead_data>{...}</lead_data>` block is parsed via regex match `/<lead_data>([\s\S]*?)<\/lead_data>/` in both routes. Claude output deviations (extra whitespace, malformed JSON) cause silent parse failures.
- Files: `app/api/chat/route.ts` (line 116), `components/Chatbot.tsx` (line 133)
- Impact: If Claude wraps JSON in extra text or newlines, lead capture fails silently. No validation that extracted JSON is valid before POSTing.
- Fix approach: Add JSON schema validation (e.g., Zod) after extraction. Log parse failures with full output for debugging.

**No Lead Data Persistence:**
- Issue: Leads flow only to external services: Resend email + FUB CRM. If both fail, lead is permanently lost. No local fallback storage.
- Files: `app/api/lead/route.ts`
- Impact: Transient failures in Resend or FUB cause permanent data loss. No audit trail. High business risk.
- Fix approach: Write leads to a database (PostgreSQL, SQLite, or Firestore). Use database as source of truth, external services as secondary notifications.

## Known Bugs

**Invalid Base64 Handling in ContactLink:**
- Issue: `components/ContactLink.tsx` calls `atob()` in `useEffect` without try/catch. Malformed base64 string throws uncaught error.
- Files: `components/ContactLink.tsx`
- Impact: If a base64 string is corrupted, component throws and breaks page footer rendering.
- Fix approach: Wrap `atob()` in try/catch. Display fallback text (e.g., "Contact us") if decode fails. Add JSDoc warning about base64 format.

**Redundant Transcript Cleaning:**
- Issue: Transcript is formatted in two places: (1) `app/api/chat/route.ts` lines 121-128 constructs it, (2) `components/Chatbot.tsx` lines 138-142 constructs it again. Both format differently (one joins messages after streaming, one reconstructs from state).
- Files: `app/api/chat/route.ts`, `components/Chatbot.tsx`
- Impact: Subtle formatting inconsistencies between what's sent via server-side fetch vs. client-side fetch. FUB note may contain different transcript than email. Audit trail is confusing.
- Fix approach: Single source of truth. Either format on server in `/api/lead` or have client send raw messages + let server format once.

## Security Considerations

**Bot User-Agent Filter is Weak:**
- Issue: `app/api/chat/route.ts` line 43 regex `/bot|crawler|spider|scrapy|python-requests|axios|curl|wget|headless/i` can be bypassed by setting a real browser UA (e.g., `Mozilla/5.0 Chrome`).
- Files: `app/api/chat/route.ts` (lines 43, 60)
- Impact: Bot detection provides false sense of security. Determined attacker can spam chat API easily.
- Fix approach: Layer additional protections: CAPTCHA on UI, fingerprinting, user session tokens, JavaScript-only endpoints. Rate limiting is the real defense (currently broken).

**No Request Authentication on /api/lead:**
- Issue: `/api/lead` endpoint has no authentication, no signature, no secret token. Any actor who discovers the endpoint can POST fake leads directly.
- Files: `app/api/lead/route.ts`
- Impact: Attackers can flood CRM with spam/fake leads. Only `isBogusEmail` and `isBogusPhone` validation gates spam, which is weak heuristic.
- Fix approach: Add request signature (e.g., HMAC-SHA256 shared secret between `/api/chat` and `/api/lead`). Or require API key in header. Verify requests originate from trusted client.

**Base64 Obfuscation is Not Encryption:**
- Issue: Contact info (phone, email) in `components/Footer.tsx` is base64-encoded and decoded client-side via `atob()`. Determined scrapers running JavaScript can easily decode.
- Files: `components/Footer.tsx`, `components/ContactLink.tsx`
- Impact: Obfuscation provides minimal protection. Bots with JavaScript execution will extract contact data. Not a critical vulnerability, but false sense of security.
- Fix approach: Consider if scrape protection is needed. If yes, use real encryption (e.g., AES) or serve contact data only after JavaScript execution + CAPTCHA verification.

**API Credentials in Environment:**
- Issue: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `FUB_API_KEY` stored in `.env.local` (local) and Vercel env vars (production). Standard practice, but accidental commit or Vercel misconfiguration exposes them.
- Files: `.env.local.example`, Vercel dashboard
- Impact: Leaked credentials allow unauthorized API usage, billing fraud, CRM access.
- Fix approach: Already following best practices (env vars, not hardcoded). Strengthen: (1) never commit `.env.local`, (2) use Vercel secret scanning, (3) rotate keys regularly, (4) consider key scoping by endpoint.

**Potential XSS in Email HTML:**
- Issue: Transcript content from user chat messages is included verbatim in Resend email body (line 140-142 of `components/Chatbot.tsx`). If user enters HTML/script tags, email client may render it.
- Files: `components/Chatbot.tsx`, `app/api/chat/route.ts`, `lib/resend.ts`
- Impact: Low risk in practice (Resend auto-sanitizes), but user input is not explicitly escaped in transcript string.
- Fix approach: Explicitly HTML-escape transcript content before sending. Use a library like `he.encode()` or Resend's built-in escaping.

**Google Ads Conversion Label is Public:**
- Issue: `NEXT_PUBLIC_GADS_CONVERSION_LABEL` is visible in browser source (by design, needed for gtag). Malicious actor could spoof conversions.
- Files: `components/Chatbot.tsx` (line 156), `app/layout.tsx`
- Impact: Skewed conversion metrics, inflated ROI calculations, wrong ad spend decisions.
- Fix approach: This is inherent to client-side GA4/Ads setup. Mitigate by: (1) comparing with server-side analytics, (2) monitoring for unusual conversion spikes, (3) using conversion value validation on Google Ads side.

## Performance Bottlenecks

**Large Monolithic Chatbot Component:**
- Issue: `components/Chatbot.tsx` handles state, streaming, lead detection, message rendering, analytics, and error handling in a single 344-line component. Every streamed character triggers full component re-render.
- Files: `components/Chatbot.tsx`
- Impact: Potential jank/lag on slower devices during fast streaming. Unnecessary re-renders of message list and input field.
- Fix approach: Split into smaller components: `<ChatMessages>` (memoized), `<ChatInput>`, `<ChatHeader>` (memoized). Lift streaming logic to custom hook `useStreamChat()`. Memoize message items.

**Message List Re-Renders on Every Token:**
- Issue: `components/Chatbot.tsx` lines 122-126 updates entire message array on every streamed character. No `useMemo` or `React.memo` on message items.
- Files: `components/Chatbot.tsx` (lines 122-126, 257-288)
- Impact: During fast streaming (hundreds of tokens/sec), DOM reconciliation is expensive. Message list flickers or jitters.
- Fix approach: Memoize message component. Store message content in ref, update only the last message's content. Batch updates using `useTransition` (React 18+).

**Image Loading Without Priority Hints:**
- Issue: Gallery images (`components/Gallery.tsx`) and Amenities images (`components/Amenities.tsx`) load all upfront without explicit Next.js `priority` prop beyond hero image.
- Files: `components/Gallery.tsx`, `components/Amenities.tsx`
- Impact: Carousel images below the fold delay initial page load. No blur placeholders or lazy loading strategy.
- Fix approach: Add `loading="lazy"` to carousel images. Use `placeholder="blur"` with small LQIP. Consider pagination/virtual scrolling for very large galleries.

**No Response Caching Headers:**
- Issue: `/api/chat` and `/api/lead` are POST endpoints (no caching), but static assets and image responses lack cache headers.
- Files: `app/api/chat/route.ts`, `app/api/lead/route.ts`
- Impact: Images from fitzrovia.ca CDN are fetched on every page load. No browser cache reuse.
- Fix approach: Set `Cache-Control: public, max-age=31536000` on image assets. Consider adding `ETag` and `Last-Modified` headers to image responses.

## Fragile Areas

**Long System Prompt String:**
- Issue: `lib/parker-data.ts` contains `PARKER_SYSTEM_PROMPT` as a large template literal (several hundred characters). Easy to accidentally break formatting, indent, or introduce subtle instruction changes.
- Files: `lib/parker-data.ts`
- Impact: Small typos in system prompt can degrade Emma's personality or behavior. No versioning of prompt changes. Hard to test variations.
- Fix approach: Extract to separate `.md` or `.txt` file. Add prompt validation tests. Version system prompt separately (e.g., `v1.0`, `v1.1`). Use prompt testing framework (e.g., Promptfoo).

**FUB Integration Has No Retry or Circuit Breaker:**
- Issue: `lib/fub.ts` makes single HTTP request to FUB API. If FUB is down, POST fails silently without retry, exponential backoff, or fallback.
- Files: `lib/fub.ts`, `app/api/lead/route.ts` (line 72)
- Impact: Transient FUB outages cause lost FUB leads. Email still goes through, but no CRM record.
- Fix approach: Add exponential backoff retry (e.g., 3 attempts, 1s/2s/4s delay). Implement circuit breaker. Log FUB failures for monitoring.

**Manual Deployment Step:**
- Issue: No CI/CD pipeline. `CLAUDE.md` requires manual `vercel --prod --yes` after `git push`. Human step required for every deploy.
- Files: (No code, deployment process)
- Impact: Deployment is slow, error-prone (easy to forget to push before deploying). No automated testing before deploy. Rollback is manual.
- Fix approach: Add GitHub Actions workflow: on `main` push, run tests → build → deploy to Vercel. Add approval step if needed. Use `vercel` CLI in GitHub Actions.

**External Image CDN Not Under Control:**
- Issue: All product images served from `https://fitzrovia.ca/app/uploads/2021/05/`. Domain is not owned by project. If CDN goes down or URL structure changes, all images break.
- Files: `lib/parker-data.ts` (PARKER_IMAGES), `next.config.ts` (remotePatterns)
- Impact: Single point of failure for all visual assets. No fallback. User experience completely breaks if CDN is unavailable.
- Fix approach: Mirror images to project (e.g., `/public/images/`) or cloud storage (e.g., AWS S3, Cloudinary). Use asset pipeline to manage versions.

**TypeScript Strictness Not Enforced:**
- Issue: No `tsconfig.json` strict mode flags evident. Type coverage may have gaps, especially in API response handling and type-unsafe operations.
- Files: `tsconfig.json` (if it exists)
- Impact: Undetected type errors at runtime (e.g., optional chaining bugs, null/undefined handling).
- Fix approach: Enable `strict: true` in `tsconfig.json`. Add type checking to ESLint. Run `tsc --noEmit` in CI.

## Scaling Limits

**Rate Limiter Breaks at Scale:**
- Current: 20 req/10min per IP via in-memory map.
- Problem: Resets on Vercel cold start; won't work across multiple instances.
- Impact: At high traffic, rate limiting becomes ineffective. Anthropic API can be spammed.
- Scaling path: Use Redis (e.g., Vercel KV, Upstash Redis). Shared across instances. Consider sliding window or token bucket algorithm.

**Anthropic API Rate Limits:**
- Current: No queue, no backpressure. High traffic hits Anthropic rate limits without graceful degradation.
- Problem: If 100 users chat simultaneously, requests will be rejected with 429.
- Impact: Chatbot becomes unavailable during traffic spikes.
- Scaling path: Implement request queue with exponential backoff. Use streaming to reduce token usage. Consider batch processing or request coalescing.

**Resend Email Quota:**
- Current: No checks against Resend sending limits before POSTing.
- Problem: High lead volume (e.g., 1000 leads/day) could exhaust monthly Resend quota silently.
- Impact: Leads are captured but emails never sent. Garima doesn't know about leads.
- Scaling path: Monitor Resend quota via API. Implement rate limiting on `/api/lead`. Set up webhook to track delivery failures.

**Image Carousel Loading Strategy:**
- Current: `components/Gallery.tsx` and `components/Amenities.tsx` load all images upfront.
- Problem: At high carousel size (50+ images), initial page load is slow.
- Impact: Core Web Vitals degrade (Largest Contentful Paint, Cumulative Layout Shift).
- Scaling path: Implement lazy loading per carousel item. Use `IntersectionObserver` to load only visible + adjacent images. Consider virtualization.

## At-Risk Dependencies

**`@anthropic-ai/sdk` (^0.78.0):**
- Risk: API pinned to `^0.78`. Breaking changes in streaming format would require immediate update.
- Current: Using streaming API. Any major version bump could break message stream parsing.
- Migration: Keep close to latest. Monitor changelog for breaking changes. Add e2e tests for streaming.

**`resend` (^6.9.3):**
- Risk: Email delivery entirely dependent on third-party service. API changes could break lead capture.
- Current: Lazy-initialized (good practice to avoid build-time errors). Backup email fallback?
- Migration: Consider backup email service (e.g., SendGrid, Mailgun). Implement email delivery verification.

**Tailwind CSS v4:**
- Risk: `@import "tailwindcss"` syntax is v4-specific. No `tailwind.config.ts`. Upgrading or downgrading is non-trivial.
- Current: Unique setup. Most projects use v3 with traditional config file.
- Migration: If need to downgrade, requires rewriting all styles to v3 syntax. Document v4 requirements in README.

**Next.js 16:**
- Risk: Very recent version. Some ecosystem tooling (ESLint plugins, test runners) may lag behind.
- Current: Using App Router (stable). Turbopack build system is new.
- Migration: Monitor Next.js releases. Pin to `16.1.6` for stability. Watch Turbopack issues.

## Missing Critical Features

**No Conversion Funnel Analytics Persistence:**
- Problem: GA4 and Meta Pixel events fire client-side only. No server-side event logging.
- Impact: Can't analyze funnel dropoff if client JS fails or user clears cookies. No replay capability.
- Priority: Medium. Adds observability.

**No Retry Mechanism:**
- Problem: Both `/api/chat` (Anthropic) and `/api/lead` (FUB/Resend) lack retry logic on transient failures.
- Impact: Network blips cause permanent failures. No resilience to temporary outages.
- Priority: High. Critical for reliability.

**No A/B Testing Infrastructure:**
- Problem: Single Hero layout variant. No feature flags or experiment framework.
- Impact: Can't test conversion optimization ideas (e.g., different button text, CTA placement).
- Priority: Low. Nice-to-have for growth.

## Test Coverage Gaps

**Untested Areas:**
- `/api/chat` streaming logic — No tests for message streaming, lead data detection, or error handling.
- `/api/lead` parallel integrations — No tests for Resend + FUB async behavior, bogus data validation, or transcript formatting.
- `Chatbot` component stream handling — No tests for message rendering, lead capture UI feedback, or artificial delay.
- `ContactLink` base64 decode — No tests for valid/invalid base64 strings.
- E2E lead capture flow — No end-to-end test from user message → lead email + FUB note.
- Performance regression — No performance benchmarks or lighthouse CI.

**Risk:** Refactoring or dependency upgrades could silently break core functionality.

**Path:** Add Jest + React Testing Library. Start with critical paths: `/api/chat`, `/api/lead`, `Chatbot` component. Add Playwright for E2E.

---

*Concerns audit: 2026-03-13*
