# Codebase Structure

**Analysis Date:** 2026-03-11

## Directory Layout

```
parker/
├── app/                           # Next.js App Router
│   ├── api/
│   │   ├── chat/route.ts         # Claude streaming endpoint
│   │   └── lead/route.ts         # Lead capture → Resend + FUB
│   ├── layout.tsx                # Root layout: metadata, OG, JSON-LD, analytics scripts
│   ├── page.tsx                  # Homepage client component
│   ├── robots.ts                 # Robots.txt generation
│   ├── sitemap.ts                # Sitemap.xml generation
│   └── globals.css               # Tailwind v4 directives, custom utilities
├── components/                    # React client components
│   ├── About.tsx                 # About section (text + exterior photo)
│   ├── Amenities.tsx             # Amenities list + carousel
│   ├── Chatbot.tsx               # Chat FAB + panel + message UI
│   ├── ContactLink.tsx           # Base64-decoded tel/mailto links
│   ├── Footer.tsx                # Logo + address + Garima contact
│   ├── Gallery.tsx               # Image carousel with thumbnails
│   ├── Hero.tsx                  # Full-screen hero (mobile/desktop layouts)
│   ├── Incentives.tsx            # Pricing cards + perks list + CTA
│   ├── LeadForm.tsx              # (Legacy; not currently used)
│   ├── Nav.tsx                   # Fixed navbar + mobile menu
│   └── Stats.tsx                 # Animated counter section
├── lib/                           # Utilities & data
│   ├── fub.ts                    # Follow Up Boss API integration
│   ├── hooks.ts                  # useScrollReveal, useCountUp
│   ├── parker-data.ts            # All content constants (single source of truth)
│   └── resend.ts                 # Resend email client + LeadData type
├── public/                        # Static assets (none committed; images from CDN)
├── node_modules/                 # Dependencies
├── .next/                         # Build output (ignored)
├── .planning/                     # GSD mapping documents
├── next.config.ts                # Next.js config (remote image patterns)
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies, scripts
├── .env.local.example            # Environment variable template
├── .gitignore                    # Excludes .env.local, .next, etc.
└── CLAUDE.md                     # Project instructions
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router directory; defines routes and layouts
- Contains: Server components (layout), client components (page), API routes, metadata
- Key files: `page.tsx` (entry point), `layout.tsx` (root metadata), `globals.css` (styling)

**app/api/:**
- Purpose: API endpoints (REST routes)
- Contains: Two route handlers
- Key files: `chat/route.ts` (Claude streaming), `lead/route.ts` (lead capture)

**components/:**
- Purpose: Reusable React UI components
- Contains: All client components marked with `"use client"`; stateful (Chatbot, Nav) and stateless (Hero, Gallery)
- Key files: `Chatbot.tsx` (primary interaction), `Hero.tsx` (main visual), `Nav.tsx` (navigation)

**lib/:**
- Purpose: Shared utilities, hooks, data, and integrations
- Contains: Custom React hooks, Anthropic/Resend/FUB client initialization, content data
- Key files: `parker-data.ts` (master content), `hooks.ts` (animation logic), `resend.ts` & `fub.ts` (external APIs)

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Homepage; client component root; owns global `chatOpen` state
- `app/layout.tsx`: Root layout; metadata, OG tags, JSON-LD, analytics scripts
- `components/Chatbot.tsx`: Chat modal; controlled by page state; handles message flow
- `components/Nav.tsx`: Fixed navbar; detects scroll position; renders links and CTAs

**Configuration:**
- `next.config.ts`: Remote image patterns (fitzrovia.ca CDN)
- `tsconfig.json`: TypeScript strict mode, path aliases (`@/` → `./`)
- `package.json`: Dependencies (Next.js, React, Tailwind, @anthropic-ai/sdk, resend), scripts
- `.env.local.example`: Template for required env vars (ANTHROPIC_API_KEY, RESEND_API_KEY, FUB_API_KEY, analytics IDs)

**Core Logic:**
- `lib/parker-data.ts`: All static content (building info, pricing, amenities, images, system prompt)
- `app/api/chat/route.ts`: Claude API integration; rate limiting; lead detection
- `app/api/lead/route.ts`: Resend email + FUB CRM + transcript note
- `components/Chatbot.tsx`: Message UI, streaming reader, analytics event firing

**Styling:**
- `app/globals.css`: Tailwind v4 imports, custom CSS variables, utility definitions, scroll animation keyframes
- Component inline styles: Brand colors via CSS variables (`--dark`, `--orange`, `--cream`, etc.)
- Font setup: `app/layout.tsx` imports Google Fonts (Cormorant Garamond, Plus Jakarta Sans) as variables

**Testing:**
- No test files present (not applicable to marketing landing page)

## Naming Conventions

**Files:**
- Components: PascalCase `.tsx` (e.g., `Chatbot.tsx`, `Hero.tsx`)
- API routes: `route.ts` inside directory matching path (e.g., `app/api/chat/route.ts`)
- Utilities/hooks: camelCase `.ts` (e.g., `parker-data.ts`, `hooks.ts`)
- Styles: `globals.css` (single stylesheet per layout)

**Directories:**
- `app/` — Next.js reserved directory
- `app/api/` — API routes (each route in subdirectory with `route.ts`)
- `components/` — React components
- `lib/` — Shared utilities and data
- `public/` — Static files (unused in this project; images from CDN)

**Functions:**
- React components: PascalCase (e.g., `function Hero()`, `export default function Chatbot()`)
- Hooks: prefix `use` + camelCase (e.g., `useScrollReveal()`, `useCountUp()`)
- Utilities: camelCase (e.g., `checkRateLimit()`, `cleanContent()`, `createFUBLead()`)

**Variables:**
- Constants: UPPER_CASE (e.g., `PARKER_INFO`, `PARKER_PRICING`, `MAX_MESSAGES`, `BOT_UA`)
- State: camelCase (e.g., `messages`, `chatOpen`, `scrolled`, `leadCaptured`)
- Exported: PascalCase for types/interfaces (e.g., `LeadData`), UPPER_CASE for data (e.g., `PARKER_IMAGES`)

**Types:**
- Component props interfaces: Inline or minimal exports (e.g., `interface ContactLinkProps`)
- Data types: In `lib/resend.ts` (e.g., `export interface LeadData`)
- API responses: Inferred (no formal response types)

## Where to Add New Code

**New Feature (e.g., new landing section):**
- Create component: `components/NewSection.tsx`
- Add to `app/page.tsx` render order
- If content needed: add to `lib/parker-data.ts`
- If animations: use `lib/hooks.ts` (useScrollReveal or useCountUp)

**New Component/Module:**
- Implementation: `components/{ComponentName}.tsx` (if UI) or `lib/{module}.ts` (if logic/utilities)
- Imports: Use path alias `@/` for imports from project root (e.g., `@/lib/parker-data`)
- Client vs Server: Mark with `"use client"` if using hooks, state, event listeners; otherwise server-renderable

**Utilities & Helpers:**
- Shared hooks: `lib/hooks.ts` (must be client components due to `useEffect`, `useRef`)
- Data constants: `lib/parker-data.ts` (sourced by components and layout)
- API integrations: `lib/{service}.ts` (e.g., `lib/resend.ts`, `lib/fub.ts`)

**API Endpoints:**
- New route: Create `app/api/{resource}/route.ts` file
- All routes are POST-only by convention (no GET handlers defined)
- Validation happens in route handler (no middleware)

## Special Directories

**app/api/:**
- Purpose: API route handlers
- Generated: No (manually created)
- Committed: Yes

**.next/:**
- Purpose: Build output from `npm run build`
- Generated: Yes (Turbopack output)
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (from package.json + lock file)
- Committed: No (in .gitignore)

**public/:**
- Purpose: Static assets served at root
- Generated: No (images served from fitzrovia.ca CDN, not from public/)
- Committed: No (empty/unused in this project)

**.env.local:**
- Purpose: Local environment variables (secrets)
- Generated: No (created manually from .env.local.example)
- Committed: No (in .gitignore)

## Image & Asset Strategy

**Images:**
- All hosted on `https://fitzrovia.ca/app/uploads/2021/05/` (external CDN)
- Paths centralized in `lib/parker-data.ts` (PARKER_IMAGES object)
- Allowed via `next.config.ts` remotePatterns
- Served via Next.js `<Image>` component (optimized, responsive)

**Fonts:**
- Imported via Next.js `next/font/google` (self-hosted, zero-latency)
- Setup in `app/layout.tsx`; CSS variables in layout body

**CSS:**
- Single `app/globals.css` file
- Tailwind v4 with `@import "tailwindcss"` syntax
- No separate `tailwind.config.ts` (v4 uses CSS variables)
- Custom utilities in `@layer utilities`

## File Change Impact Map

**If content changes (building info, pricing, images, system prompt):**
- Edit: `lib/parker-data.ts`
- Affects: All components importing from it + `app/layout.tsx` (JSON-LD) + `/api/chat` (system prompt)

**If styling changes (brand colors, spacing, fonts):**
- Edit: `app/globals.css` (CSS variables) or component inline styles
- Affects: All components using those variables

**If chat flow changes (questions asked, lead fields):**
- Edit: `lib/parker-data.ts` (PARKER_SYSTEM_PROMPT)
- Affects: `/api/chat/route.ts` (lead detection regex), `components/Chatbot.tsx` (UI/state), `lib/resend.ts` (email template)

**If page layout changes (section order, new sections):**
- Edit: `app/page.tsx` (render order)
- Affects: CSS scroll anchors, section IDs for Nav links

**If analytics changes (new GA4 events, new conversions):**
- Edit: `components/Chatbot.tsx` (event firing), `app/layout.tsx` (script setup)
- Affects: Customer journey tracking, retargeting audiences

---

*Structure analysis: 2026-03-11*
