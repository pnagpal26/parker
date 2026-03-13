# Testing Patterns

**Analysis Date:** 2025-03-13

## Test Framework

**Status:** Not detected

**Runner:**
- No test framework configured (no Jest, Vitest, or similar in `package.json`)
- No test files found in codebase (no `*.test.ts`, `*.spec.ts` files)
- No `jest.config.*` or `vitest.config.*` files

**Assertion Library:**
- Not applicable—no testing infrastructure present

**Run Commands:**
- No test commands in `package.json`
- Available commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`

## Testing Strategy

**Approach:** Manual testing and integration testing only

**Current Coverage:**
- Code is tested manually in development and staging
- API routes have implicit validation (guard clauses prevent bad input)
- No automated unit or integration tests

## Validation as Testing

Since no test framework is configured, input validation serves as the primary safety mechanism:

**API Route Validation (`app/api/chat/route.ts`):**
```typescript
// Messages must be array, non-empty, max 30 items
if (!Array.isArray(messages) || messages.length === 0) {
  return new Response("Bad request", { status: 400 });
}
if (messages.length > MAX_MESSAGES) {
  return new Response("Conversation too long", { status: 400 });
}
// Each message validated for structure
for (const m of messages) {
  if (
    typeof m?.role !== "string" ||
    typeof m?.content !== "string" ||
    m.content.length > MAX_MSG_LENGTH
  ) {
    return new Response("Bad request", { status: 400 });
  }
}
```

**Lead Validation (`app/api/lead/route.ts`):**
```typescript
// Email required
if (!lead.email) {
  return NextResponse.json({ error: "Email is required" }, { status: 400 });
}
// Bogus data rejection before external calls
if (isBogusEmail(lead.email)) {
  console.warn("Bogus email rejected:", lead.email);
  return NextResponse.json({ success: false, reason: "bogus_email" }, { status: 422 });
}
if (lead.phone && isBogusPhone(lead.phone)) {
  console.warn("Bogus phone rejected:", lead.phone);
  return NextResponse.json({ success: false, reason: "bogus_phone" }, { status: 422 });
}
```

## Bot Protection (Security Testing)

**User-Agent Blocking (`app/api/chat/route.ts`):**
```typescript
const BOT_UA = /bot|crawler|spider|scrapy|python-requests|axios|curl|wget|headless/i;

const ua = req.headers.get("user-agent") || "";
if (!ua || BOT_UA.test(ua)) {
  return new Response("Forbidden", { status: 403 });
}
```
- Rejects requests without User-Agent header
- Blocks known scrapers and bot signatures

## Rate Limiting (Functional Testing)

**In-Memory IP Rate Limiter (`app/api/chat/route.ts`):**
```typescript
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip);
  if (!entry || now > entry.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}
```
- Limits each IP to 20 requests per 10-minute window
- Automatically pruned every 5 minutes to prevent memory leaks
- Returns `429 Too Many Requests` when exceeded

## Component State Testing

**Manual verification points** (in `Chatbot.tsx`):
- Chat initializes with welcome message when modal opens
- Input auto-focuses after modal open (300ms delay)
- Input auto-refocuses after each Emma response (when `loading` becomes false)
- Lead data captured when `<lead_data>` block appears in streaming response
- Messages scroll to bottom as they arrive
- Analytics events fire at correct points: `chat_opened`, `chat_started`, `lead_captured`

## Data Validation Testing

**Bogus Email Detection (`app/api/lead/route.ts`):**
```typescript
const BOGUS_EMAIL_DOMAINS = new Set([
  "test.com", "fake.com", "example.com", "mailinator.com",
  "guerrillamail.com", "temp-mail.org", "throwaway.email",
  "trashmail.com", "yopmail.com", "sharklasers.com",
]);

function isBogusEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const [local, domain] = lower.split("@");
  if (!local || !domain) return true;
  if (BOGUS_EMAIL_DOMAINS.has(domain)) return true;
  if (/^(.)\1+$/.test(local)) return true; // aaa@...
  return false;
}
```
- Rejects known disposable email domains
- Rejects email local parts with repeated characters (`aaa@example.com`)

**Bogus Phone Detection (`app/api/lead/route.ts`):**
```typescript
function isBogusPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return true;
  if (/^(\d)\1+$/.test(digits)) return true; // 4161111111
  if (digits === "1234567890" || digits === "0987654321") return true;
  return false;
}
```
- Rejects numbers with fewer than 7 digits
- Rejects all-same-digit patterns (`4161111111`, `0000000000`)
- Rejects simple sequential patterns (`1234567890`, `0987654321`)

## Integration Points (Manual Testing)

**Chat API → Claude Streaming:**
- Verifies `anthropic.messages.create()` with streaming enabled
- Confirms `<lead_data>` XML block detection in full response text
- Tests lead data JSON parsing from extracted block

**Lead Capture Flow:**
- Email sent via `sendLeadEmail()` from `lib/resend.ts`
- FUB person created via `createFUBLead()` from `lib/fub.ts`
- Transcript posted via `createFUBNote()` to FUB (awaited to ensure completion)
- Verifies both success and error states

**Analytics Events:**
- GA4 event: `chat_opened` fires on first chatbot modal open
- GA4 event: `chat_started` fires on user's first message
- GA4 event: `lead_captured` fires when lead data detected
- Meta Pixel `ViewContent` fires on chat open
- Meta Pixel `Lead` event fires on lead capture
- Google Ads conversion fires on `lead_captured` (if conversion label set)

## Testing Recommendations

**To Add Test Coverage:**
1. Unit tests for validation functions: `isBogusEmail()`, `isBogusPhone()`, `checkRateLimit()`
2. Integration tests for API routes: mock Claude SDK, Resend, FUB APIs
3. Component tests for `Chatbot.tsx`: verify state transitions, focus behavior, message flow
4. E2E tests: full chat flow from open → message → lead capture

**Framework Suggestion:**
- Vitest (lightweight, fast, works with Vite/Turbopack)
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

---

*Testing analysis: 2025-03-13*
