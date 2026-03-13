# Technology Stack

**Analysis Date:** 2025-03-13

## Languages

**Primary:**
- TypeScript 5 - All source code (`src/**/*.ts`, `src/**/*.tsx`, `app/**/*.ts`, `app/**/*.tsx`, `lib/**/*.ts`, `components/**/*.tsx`)

**Markup:**
- HTML/JSX - Via React components

## Runtime

**Environment:**
- Node.js - Version specified via project (check `.nvmrc` if present; not committed in root)

**Package Manager:**
- npm - Lockfile: `package-lock.json` (inferred, standard for npm)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router, TypeScript, server components
  - Uses custom script workaround: `node node_modules/next/dist/bin/next` (`.bin/next` symlink broken)
  - Configured in `next.config.ts` with remote image patterns from `fitzrovia.ca`

**Styling:**
- Tailwind CSS 4 - Utility-first CSS via `@import "tailwindcss"` syntax (NOT `@tailwind` directives)
  - No separate `tailwind.config.ts` — configuration via CSS variables in `app/globals.css`
  - PostCSS plugin: `@tailwindcss/postcss` v4
  - Custom theme colors and utilities defined with `@theme inline` in `globals.css`
  - Explicit `@source` directives for Turbopack compatibility: `../components/**/*.tsx`, `../app/**/*.tsx`, `../lib/**/*.ts`

**Frontend Libraries:**
- React 19.2.3 - UI component library
- React DOM 19.2.3 - DOM rendering

**Testing:**
- None detected in package.json (No Jest, Vitest, etc.)

**Build/Dev:**
- Turbopack - Bundler/transpiler (Next.js 16 default, configured in `next.config.ts`)

## Key Dependencies

**Critical:**
- `@anthropic-ai/sdk` v0.78.0 - Claude API client for streaming chat responses
  - Used in `app/api/chat/route.ts`
  - Initializes with `ANTHROPIC_API_KEY` environment variable
  - Model: `claude-sonnet-4-6`

- `ai` (Vercel AI SDK) v6.0.116 - Streaming utilities for API responses
  - Re-exported utility functions used in chat route

- `resend` v6.9.3 - Transactional email service
  - Lazy-initialized in `lib/resend.ts` to avoid build-time errors when `RESEND_API_KEY` absent
  - Sends formatted HTML emails to `garima@teamnagpal.ca`
  - From address: `noreply@teamnagpal.ca` (via `RESEND_FROM_EMAIL`)

**Infrastructure:**
- None (no database ORM, external caching, or infrastructure libraries)

## Configuration

**Environment:**

Standard approach via `.env.local`:

```
# Core (required for chat/email/CRM)
ANTHROPIC_API_KEY=           # Claude API
RESEND_API_KEY=              # Resend email
FUB_API_KEY=                 # Follow Up Boss (CRM)
RESEND_FROM_EMAIL=noreply@teamnagpal.ca

# Analytics/Tracking (optional — scripts silently skipped if unset, no dev errors)
NEXT_PUBLIC_META_PIXEL_ID=              # Meta Business Manager
NEXT_PUBLIC_GA_MEASUREMENT_ID=          # GA4 measurement ID (G-XXXXXXXX)
NEXT_PUBLIC_GADS_ID=                    # Google Ads remarketing tag (AW-XXXXXXXX)
NEXT_PUBLIC_GADS_CONVERSION_LABEL=      # Google Ads conversion label
NEXT_PUBLIC_SITE_URL=https://parker.affordablecondos.ca   # Canonical URL (default shown)
```

See `.env.local.example` as reference template.

**Build:**

- `next.config.ts` — Configures remote image patterns for `fitzrovia.ca` CDN
- `tsconfig.json` — TypeScript compiler options (ES2017 target, strict mode, path alias `@/*` → root)
- `package.json` — Scripts use direct Next.js binary path due to `.bin/next` symlink issue

**TypeScript:**
- Path alias: `@/*` resolves to project root (enables `@/lib/parker-data.ts` imports)
- Strict mode enabled
- JSX: `react-jsx` (React 17+ standalone JSX transform)

## Fonts

**Loaded via Next.js `next/font/google`:**
- Cormorant Garamond (display, weights: 300–700, styles: normal + italic) → CSS variable `--font-cormorant`
- Plus Jakarta Sans (body, weights: 300–600) → CSS variable `--font-jakarta`
- Display strategy: `swap` (show fallback immediately, swap when loaded)

## Platform Requirements

**Development:**
- Node.js (version unspecified in repo; consult team)
- npm (included with Node.js)
- Internet access for:
  - Anthropic Claude API (`api.anthropic.com`)
  - Resend email service (`api.resend.com`)
  - Follow Up Boss CRM API (`api.followupboss.com`)
  - Google Fonts API (downloads Cormorant Garamond, Plus Jakarta Sans)
  - Fitzrovia CDN (`fitzrovia.ca`) for images

**Production:**
- Deployment target: Vercel (inferred from `CLAUDE.md`: `vercel --prod --yes` command)
- Environment variables required in Vercel project settings for all core + analytics vars
- Node.js runtime (Vercel-managed)

---

*Stack analysis: 2025-03-13*
