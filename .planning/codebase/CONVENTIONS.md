# Coding Conventions

**Analysis Date:** 2025-03-11

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `components/Chatbot.tsx`, `components/Nav.tsx`)
- TypeScript utilities: camelCase (e.g., `lib/hooks.ts`, `lib/fub.ts`)
- API routes: lowercase with hyphens in path structure (e.g., `app/api/chat/route.ts`, `app/api/lead/route.ts`)

**Functions:**
- Component functions: PascalCase (exported as default, no `function` keyword prefix)
- Utility functions: camelCase (e.g., `cleanContent()`, `checkRateLimit()`, `pruneIfNeeded()`)
- Event handlers: `onX` pattern (e.g., `onOpenChat()`, `onScroll`, `onSubmit`, `onClick`)
- Hook names: `useX` pattern (e.g., `useScrollReveal()`, `useCountUp()`)

**Variables:**
- State variables: camelCase (e.g., `chatOpen`, `messages`, `loading`, `leadCaptured`)
- Constants (module-level): UPPER_SNAKE_CASE (e.g., `WINDOW_MS`, `MAX_REQUESTS`, `BOT_UA`, `DOTS`)
- Type/interface variables: camelCase (e.g., `newMessages`, `assistantPlaceholder`, `ipWindows`)
- CSS classes: kebab-case (e.g., `chat-glass`, `orange-rule`, `section-num`)

**Types:**
- Interfaces: PascalCase (e.g., `ContactLinkProps`, `Message`, `LeadData`)
- Type aliases: PascalCase (e.g., `Metadata`)
- Generic types: preserved as-is (e.g., `React.ReactNode`, `React.CSSProperties`)

## Code Style

**Formatting:**
- No Prettier config — relies on ESLint auto-formatting
- 2-space indentation (inferred from codebase)
- Semicolons required (enforced by ESLint)
- Single quotes for strings in JSX attributes and object keys

**Linting:**
- Framework: ESLint 9+ with `eslint-config-next` (core-web-vitals + TypeScript)
- Config file: `eslint.config.mjs` (flat config format)
- Key rules: Next.js core web vitals + TypeScript strict checks
- No custom eslint rule overrides beyond Next.js defaults
- Command: `npm run lint` runs ESLint

**TypeScript:**
- `tsconfig.json`: Strict mode enabled (`strict: true`)
- Target: ES2017
- Module resolution: bundler
- Path aliases: `@/*` maps to project root (e.g., `@/components`, `@/lib`)
- JSX factory: `react-jsx` (automatic JSX transform)

## Import Organization

**Order:**
1. React/hooks imports (`import { useState, useEffect, ... } from "react"`)
2. Next.js imports (`import Image from "next/image"`, `import Script from "next/script"`)
3. Type imports (`import type { ... } from "..."`)
4. Library imports (`import { ... } from "@anthropic-ai/sdk"`)
5. Local lib imports (`import { ... } from "@/lib/..."`)
6. Component imports (`import { ... } from "@/components/..."`)
7. Global declarations (if needed)

**Path Aliases:**
- Use `@/` prefix for all imports (configured in `tsconfig.json`)
- Example: `import Nav from "@/components/Nav"` (not `import Nav from "../components/Nav"`)

**Directive placement:**
- Client components: `"use client"` at top of file (required for React hooks, event handlers)
- Server components: No directive (default in Next.js App Router)

## Error Handling

**Strategy:** Try-catch with console logging; graceful degradation where possible.

**Patterns:**
- Async functions wrap fetch/API calls in try-catch (see `app/api/chat/route.ts`, `app/api/lead/route.ts`)
- Catch blocks: `console.error(message, error)` with context
- User-facing: Return structured error responses (e.g., `NextResponse.json({ error: "..." }, { status: 400 })`)
- Silent failures: Use optional chaining (`?.`) and nullish coalescing (`??`) to avoid errors
- Example from `lib/fub.ts`:
  ```typescript
  if (!res.ok) {
    const text = await res.text();
    console.error(`FUB API error ${res.status}:`, text);
    return null;
  }
  ```

**Validation:**
- Input validation before processing (check message array, length, content type)
- Guard clauses for missing required values (e.g., `if (!lead.email) return ...`)
- Type guards with `typeof` checks before operations

## Logging

**Framework:** Console only (no external logging library).

**Patterns:**
- `console.error()`: API errors, validation failures, edge cases
- `console.warn()`: Degraded states (e.g., missing optional env vars)
- No `console.log()` in production code (only debugging)
- Context: Always include the operation name in the error message
- Example: `console.error("Lead API error:", error)` (not just `console.error(error)`)

**No structured logging or log levels** beyond console.error/warn.

## Comments

**When to Comment:**
- Complex logic (e.g., rate limiting algorithm in `app/api/chat/route.ts`)
- Non-obvious regex or string transformations (e.g., `BOT_UA` regex)
- Section dividers for logical groups (e.g., `// ── Request validation ────────`)
- Security/privacy implications (e.g., `// base64-encoded — keeps contact info out of server-rendered HTML`)

**JSDoc/TSDoc:**
- Used for custom hooks (e.g., `useScrollReveal()`, `useCountUp()`)
- Single-line format: `/** Brief description */` above function
- Example from `lib/hooks.ts`:
  ```typescript
  /** Adds .in class to all .reveal children when section enters viewport */
  export function useScrollReveal() { ... }
  ```

**No @param/@returns:** Most functions are self-documenting via TypeScript types.

## Function Design

**Size:** Functions kept concise — most components are 80–150 lines.

**Parameters:**
- Use destructuring for objects (e.g., `{ onOpenChat }` instead of `props`)
- Single-use component props: destructured inline
- API route params: Destructure from `req.json()`, `req.headers`

**Return Values:**
- Components: JSX.Element (implicit)
- Hooks: Ref object or void (side-effect only)
- Utilities: Explicit types (e.g., `Promise<LeadData>`, `boolean`, `string | null`)
- Early returns: Used for guard clauses (check error conditions first, then process)

**Async Functions:**
- Used for API routes, event handlers that fetch data
- Error handling wrapped in try-catch
- Promise.all() or Promise.allSettled() for parallel ops (see `app/api/lead/route.ts`)

## Module Design

**Exports:**
- Default export: Component files (e.g., `export default function Nav()`)
- Named exports: Utilities and hooks (e.g., `export function useScrollReveal()`, `export async function createFUBLead()`)
- Type exports: `export type` or `export interface`

**Barrel Files:**
- Used sparingly — `lib/parker-data.ts` is a single source of truth for content
- No component barrel files (direct imports preferred)

**File Structure Pattern:**
- `lib/` contains reusable utilities and data (`hooks.ts`, `parker-data.ts`, `resend.ts`, `fub.ts`)
- `components/` contains page sections (no sub-directories)
- `app/` contains routes and layout
- `app/api/` contains API handlers with inline middleware (rate limiting, validation)

## CSS & Styling

**Approach:** Inline styles with CSS variables + Tailwind utility classes.

**CSS Variables:**
- Defined in `:root` in `app/globals.css` (brand palette, fonts)
- Accessed via `style={{ color: "var(--ink)", fontFamily: "var(--font-body)" }}`
- Custom utilities in `@layer utilities` for Tailwind-incompatible properties (padding, margin, width/height variants)

**Tailwind Usage:**
- Imported via `@import "tailwindcss"` (v4 syntax, not `@tailwind` directives)
- Responsive classes: `hidden lg:block`, `sm:py-14`, `md:grid-cols-4`
- No custom config file needed (v4 uses CSS variables)

**Animations:**
- Defined inline in `<style>` tags (e.g., `@keyframes dotBounce` in `Chatbot.tsx`)
- Cubic-bezier easing for smooth motion: `cubic-bezier(0.16, 1, 0.3, 1)`

---

*Convention analysis: 2025-03-11*
