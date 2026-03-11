# Technology Stack

**Analysis Date:** 2025-03-11

## Languages

**Primary:**
- TypeScript 5.x - Full codebase (app routes, components, libraries)
- JavaScript - Configuration files (ESLint, PostCSS)
- CSS/Tailwind - Styling via `@import "tailwindcss"` syntax

**Secondary:**
- HTML - Structured data and email templates
- JSON - Data files (`lib/parker-data.ts` exports)

## Runtime

**Environment:**
- Node.js 24.13.0 (development)
- Next.js 16.1.6 (App Router)
- Turbopack (dev bundler)

**Package Manager:**
- npm 11.6.2
- `package-lock.json` present

**Binary Workaround:**
Scripts use direct path `node node_modules/next/dist/bin/next` instead of `.bin/next` symlink due to broken require path in this installation.

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack web framework, App Router, streaming SSR
- React 19.2.3 - UI component library
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - `@import "tailwindcss"` syntax, no separate config file
- @tailwindcss/postcss 4.x - PostCSS plugin

**AI/LLM:**
- @anthropic-ai/sdk 0.78.0 - Claude API client for streaming messages
- ai 6.0.116 - Streaming utilities library

**Email:**
- resend 6.9.3 - Transactional email service

**Development:**
- TypeScript 5.x - Type checking
- ESLint 9.x - Linting with Next.js presets
- eslint-config-next 16.1.6 - Next.js ESLint rules
- PostCSS - CSS transformation pipeline

## Key Dependencies

**Critical:**
- @anthropic-ai/sdk 0.78.0 - Claude Sonnet 4.6 API client, used in `/api/chat` for streaming chatbot
- resend 6.9.3 - Email delivery to garima@teamnagpal.ca for lead notifications
- Next.js 16.1.6 - Framework for App Router, streaming, and deployment to Vercel

**Infrastructure:**
- @types/node 20.x - Node.js type definitions
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions

## Configuration

**Environment Variables:**

Core (required for operation):
- `ANTHROPIC_API_KEY` - Claude API authentication
- `RESEND_API_KEY` - Email service authentication
- `FUB_API_KEY` - Follow Up Boss CRM API key
- `RESEND_FROM_EMAIL` - Sender email (default: `noreply@teamnagpal.ca`)

Analytics (optional - scripts silently skipped if unset):
- `NEXT_PUBLIC_META_PIXEL_ID` - Meta Business Manager pixel ID
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4 measurement ID (G-XXXXXXXX)
- `NEXT_PUBLIC_GADS_ID` - Google Ads remarketing tag (AW-XXXXXXXX)
- `NEXT_PUBLIC_GADS_CONVERSION_LABEL` - Google Ads conversion action label
- `NEXT_PUBLIC_SITE_URL` - Canonical site URL (default: `https://parker.affordablecondos.ca`)

**Build Configuration:**
- `tsconfig.json` - TypeScript compilation (ES2017 target, strict mode)
- `postcss.config.mjs` - PostCSS pipeline with Tailwind plugin
- `next.config.ts` - Image remote patterns (fitzrovia.ca CDN), no custom webpack
- `eslint.config.mjs` - ESLint config using flat config format with Next.js presets

**CSS Configuration:**
- `globals.css` - Contains `@import "tailwindcss"` (v4 syntax), custom utilities in `@layer utilities`
- No `tailwind.config.ts` - Tailwind v4 uses CSS variables for customization

## Platform Requirements

**Development:**
- Node.js 22+ (tested on 24.13.0)
- npm 11+
- Turbopack support for dev builds
- Git for version control

**Production:**
- Deployment target: Vercel (Node.js runtime)
- Streaming responses supported
- Environment variables injected at build/runtime
- Cold start compatible

## Image CDN

All images served from:
- Domain: `https://fitzrovia.ca/app/uploads/2021/05/`
- Whitelisted in `next.config.ts` via `remotePatterns`
- Image optimization via Next.js `<Image>` component with remote pattern validation

---

*Stack analysis: 2025-03-11*
