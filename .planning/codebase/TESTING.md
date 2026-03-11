# Testing

## Summary

The Parker codebase has **no automated testing framework configured**. Quality assurance relies on TypeScript type checking, ESLint linting, and manual browser testing. There are no test files in the repository.

## Current Quality Gates

| Gate | Tool | When |
|------|------|-------|
| Type checking | TypeScript (`tsc`) | Build time via `npm run build` |
| Linting | ESLint | `npm run lint` |
| Manual testing | Browser | Developer-driven, ad hoc |

## No Test Infrastructure

- No test runner (Jest, Vitest, Playwright test, etc.)
- No test files (`*.test.ts`, `*.spec.ts`, `__tests__/`)
- No test scripts in `package.json`
- No test configuration files
- No CI/CD pipeline running tests

## Recommended Test Priorities

If tests are added, these areas carry the highest risk and should be tested first:

### 1. API Routes (Critical)

**`app/api/chat/route.ts`**
- Bot UA blocking — assert 403 for known bot agents
- Rate limiting — assert 429 after 20 requests per IP window
- Message validation — empty array, >30 messages, content >1000 chars → 400
- Valid request → streaming response

**`app/api/lead/route.ts`**
- Parallel Resend + FUB calls succeed
- FUB failure does not block email send
- Missing required fields → appropriate error

### 2. Core Components

**`components/Chatbot.tsx`**
- Stream parsing correctly detects `<lead_data>{...}</lead_data>`
- Lead capture POST fires exactly once per lead
- GA4 events fire at correct lifecycle points (`chat_opened`, `chat_started`, `lead_captured`)
- Artificial 2500ms delay applies before first fetch

**`components/ContactLink.tsx`**
- Valid base64 → decoded href rendered client-side
- Invalid base64 → graceful fallback, no thrown error
- Server render → placeholder `<span>`, no contact data in HTML

### 3. Integration / E2E

- Full lead capture flow: chat → lead data detected → `/api/lead` POST → Resend email + FUB note
- Hero CTA → chat opens → Emma responds → lead collected flow

## Testing Stack Recommendation

If adding tests to this project:

```
Vitest          — unit + integration (fast, TypeScript-native, works with Next.js)
@testing-library/react — component testing
Playwright      — E2E browser tests (already in .gitignore for artifacts)
MSW             — mock Anthropic/Resend/FUB API calls in tests
```

## Mocking Needs

| Dependency | Mock approach |
|------------|---------------|
| `@anthropic-ai/sdk` | MSW or manual mock returning fixture stream |
| `resend` | Mock `sendEmail()` to return `{ id: "mock-id" }` |
| Follow Up Boss API | MSW intercept `https://api.followupboss.com/v1/*` |
| `Date.now()` / timers | `vi.useFakeTimers()` for rate limiter window tests |
