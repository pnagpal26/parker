# Coding Conventions

**Analysis Date:** 2025-03-13

## Naming Patterns

**Files:**
- PascalCase for React components: `Chatbot.tsx`, `Hero.tsx`, `Gallery.tsx`
- camelCase for utility/service files: `parker-data.ts`, `resend.ts`, `fub.ts`
- Route files follow Next.js convention: `route.ts` in `app/api/` directories

**Functions:**
- camelCase for all function names: `sendMessage()`, `cleanContent()`, `checkRateLimit()`, `isBogusEmail()`
- Helper functions use verb prefixes: `check*`, `get*`, `is*`, `send*`, `create*`

**Variables:**
- camelCase for all variables: `messages`, `userText`, `leadCaptured`, `inputRef`
- SCREAMING_SNAKE_CASE for constants: `WINDOW_MS`, `MAX_REQUESTS`, `MAX_MESSAGES`, `BOT_UA`, `BOGUS_EMAIL_DOMAINS`
- SCREAMING_SNAKE_CASE also used for exported configuration: `PARKER_PRICING`, `PARKER_INFO`, `PARKER_IMAGES`, `PARKER_SYSTEM_PROMPT`
- Prefix private/internal state with underscore if needed, but generally use direct names

**Types:**
- PascalCase for interfaces and types: `Message`, `LeadData` (from context)
- Use concise names reflecting the concept: `Message` not `MessageObject`

## Code Style

**Formatting:**
- No explicit formatter configured (no `.prettierrc` file found)
- Manual formatting observed: 2-space indentation, semicolons present
- Line length appears flexible—system prompt reaches 200+ characters on single lines

**Linting:**
- ESLint v9 with Next.js config (`eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`)
- Config file: `eslint.config.mjs` (flat config format, ESLint v9+)
- Run with: `npm run lint`
- Notable: React hooks exhaustive deps warning disabled explicitly in code: `// eslint-disable-next-line react-hooks/exhaustive-deps`

## Import Organization

**Order:**
1. React imports: `import { useEffect, useRef, useState } from "react";`
2. Next.js imports: `import { NextRequest } from "next/server";`
3. Third-party packages: `import Anthropic from "@anthropic-ai/sdk";`
4. Internal imports: `import { PARKER_SYSTEM_PROMPT } from "@/lib/parker-data";`

**Path Aliases:**
- `@/*` resolves to project root (defined in `tsconfig.json`)
- Used for all internal imports: `@/lib/parker-data`, `@/lib/resend`, `@/lib/fub`, `@/components/...`

## Error Handling

**Patterns:**
- Explicit validation before processing: check input shape, length, type before operations
  - Example in `app/api/chat/route.ts`: validate `messages` is array, non-empty, length <= 30, each message has valid `role` and `content`
  - Example in `app/api/lead/route.ts`: validate email required, then check bogus patterns
- Return HTTP status codes for validation failures:
  - `400` for malformed requests (missing required fields, invalid structure)
  - `429` for rate limit exceeded
  - `422` for rejected valid-format data (bogus email/phone)
  - `500` for unexpected server errors
- Use try-catch at API route level, log errors to console, return error responses
- Fire-and-forget fetch calls wrapped in `.catch(console.error)` to avoid silent failures

**Example pattern from `app/api/chat/route.ts`:**
```typescript
try {
  // ... validation logic ...
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Bad request", { status: 400 });
  }
  // ... main logic ...
} catch (error) {
  console.error("Chat API error:", error);
  return new Response("Internal server error", { status: 500 });
}
```

## Logging

**Framework:** `console` (no dedicated logging library)

**Patterns:**
- `console.error()` for API errors and failed integrations
  - Example: `console.error("Chat API error:", error);`
  - Example: `console.error("Failed to parse lead data from chatbot:", e);`
- `console.warn()` for rejected data validation (e.g., bogus email detection)
  - Example: `console.warn("Bogus email rejected:", lead.email);`
- Minimal logging in components—focus on critical path events (lead capture)
- Console calls remain in production code; no environment-based log suppression observed

## Comments

**When to Comment:**
- Block comments used for section headers: `// ── Simple in-memory rate limiter ─────...`
- Inline comments explain non-obvious logic: `// all same digit: 1111111111` explaining regex
- Comments placed above the code they describe, not at end of line
- Used sparingly—self-documenting code preferred

**JSDoc/TSDoc:**
- Not observed in codebase
- TypeScript strict mode enabled, relying on types for documentation
- Function signatures use type annotations instead of JSDoc blocks

## Function Design

**Size:**
- Small, focused functions preferred
- Most utility functions < 15 lines
- Example: `isBogusPhone()` = 6 lines, `isBogusEmail()` = 7 lines, `checkRateLimit()` = 11 lines

**Parameters:**
- Destructured object parameters for React components: `{ open, setOpen }` in `Chatbot`
- Simple types for API routes (extracted from `req.json()`)
- No more than 1-2 parameters per function; use objects for multiple related values

**Return Values:**
- HTTP responses use `NextResponse.json()` or `new Response()` with status codes
- Helper functions return early on validation failure (guard clauses)
- Example guard pattern from `isBogusPhone()`:
  ```typescript
  if (digits.length < 7) return true;
  if (/^(\d)\1+$/.test(digits)) return true;
  if (digits === "1234567890" || digits === "0987654321") return true;
  return false;
  ```

## Module Design

**Exports:**
- Single default export for page components and route handlers: `export default function Chatbot() { ... }`
- Named exports for utilities and data: `export const PARKER_INFO = { ... }`
- Type exports for shared types: `export type LeadData = { ... }` (inferred from usage)

**Barrel Files:**
- No barrel files (index.ts) observed
- Imports reference specific modules directly: `from "@/lib/resend"` not `from "@/lib"`

## Client vs Server Components

**Patterns:**
- Components default to Server Components in Next.js 13+ App Router
- Use `"use client"` directive at top of file for interactive components
  - Example: `Chatbot.tsx` (handles state, events, focus)
  - Example: `ContactLink.tsx` (client-side base64 decoding to prevent scraping)
- Route handlers are server-only (`app/api/chat/route.ts`, `app/api/lead/route.ts`)

## TypeScript Configuration

**Strict Mode:** Enabled
- `"strict": true` in `tsconfig.json`
- All types explicitly declared, no implicit `any`
- Null/undefined checks enforced

**Target:** ES2017
- Uses modern JavaScript features (async/await, destructuring, arrow functions)
- Module system: ESNext with bundler resolution

---

*Convention analysis: 2025-03-13*
