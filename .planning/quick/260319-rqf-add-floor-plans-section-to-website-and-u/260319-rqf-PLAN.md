---
phase: quick
plan: 260319-rqf
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/parker-data.ts
  - components/FloorPlans.tsx
  - app/page.tsx
  - next.config.ts
autonomous: true
requirements: [floor-plans-section, emma-floor-plan-awareness]
must_haves:
  truths:
    - "Visitor can see a Floor Plans section on the page with all 11 suite layouts"
    - "Visitor can filter floor plans by category (Studio, 1 Bed, 2 Bed, 3 Bed)"
    - "Each floor plan card shows the suite name, sqft, beds/baths, price, and floor plan image"
    - "Emma can answer questions about specific floor plans including names, sizes, and pricing"
  artifacts:
    - path: "lib/parker-data.ts"
      provides: "PARKER_FLOOR_PLANS data array and updated PARKER_SYSTEM_PROMPT"
    - path: "components/FloorPlans.tsx"
      provides: "Floor plans section component with filtering"
    - path: "app/page.tsx"
      provides: "FloorPlans rendered between Amenities and Gallery"
    - path: "next.config.ts"
      provides: "assets.rentsync.com added to remotePatterns"
  key_links:
    - from: "components/FloorPlans.tsx"
      to: "lib/parker-data.ts"
      via: "import PARKER_FLOOR_PLANS"
      pattern: "PARKER_FLOOR_PLANS"
    - from: "app/page.tsx"
      to: "components/FloorPlans.tsx"
      via: "import and render"
      pattern: "<FloorPlans"
---

<objective>
Add a visual Floor Plans section to the Parker landing page displaying all 11 suite layouts from parkerlife.ca, and update Emma's system prompt so she can discuss floor plans knowledgeably with prospects.

Purpose: Prospects can browse suite layouts directly on the landing page without leaving, and Emma can reference specific floor plans during conversations to help prospects narrow their choice.
Output: New FloorPlans component, floor plan data in parker-data.ts, Emma system prompt updated.
</objective>

<execution_context>
@/Users/puneetnagpal/.claude/get-shit-done/workflows/execute-plan.md
@/Users/puneetnagpal/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@lib/parker-data.ts
@components/Amenities.tsx (reference for component pattern — section structure, useScrollReveal, brand styling)
@app/page.tsx (page layout — insert FloorPlans between Amenities and Gallery)
@next.config.ts (add rentsync.com to remotePatterns)
@CLAUDE.md (brand tokens, font vars, component conventions)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add floor plan data and update Emma's system prompt</name>
  <files>lib/parker-data.ts, next.config.ts</files>
  <action>
1. In `next.config.ts`, add a second entry to `remotePatterns`:
   ```
   { protocol: "https", hostname: "assets.rentsync.com", pathname: "/fitzrovia/**" }
   ```

2. In `lib/parker-data.ts`, add a new exported array `PARKER_FLOOR_PLANS` (place it after `PARKER_IMAGES`). Each entry has: `name`, `category` (one of "Studio" | "1 Bedroom" | "2 Bedroom" | "3 Bedroom"), `beds`, `baths`, `sqft`, `price` (string like "$2,070/mo"), `image` (rentsync URL). Data from parkerlife.ca:

   | Name | Category | Beds | Baths | Sqft | Price | Image |
   |------|----------|------|-------|------|-------|-------|
   | Primrose | Studio | 0 | 1 | 350 | $2,070/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721872_Primrose.jpg |
   | Greenwich | 1 Bedroom | 1 | 1 | 457 | $2,450/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721868_Greenwich.jpg |
   | Holland | 1 Bedroom | 1 | 1 | 494 | $2,575/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721873_Holland.jpg |
   | Battersea | 1 Bedroom | 1 | 1 | 509 | $2,525/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1752784067_Battersea.png |
   | Holland II | 1 Bedroom | 1 | 1 | 547 | $2,500/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721870_Holland_II.jpg |
   | Holland III | 1 Bedroom | 1 | 1 | 552 | $2,625/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721871_Holland_III.jpg |
   | Battersea II | 1 Bedroom | 1 | 1 | 567 | $2,650/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721866_Battersea_II.jpg |
   | Richmond | 2 Bedroom | 2 | 2 | 726 | $3,175/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721873_Richmond.jpg |
   | Richmond II | 2 Bedroom | 2 | 2 | 745 | $3,300/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721870_Richmond_II.jpg |
   | Richmond III | 2 Bedroom | 2 | 2 | 784 | $3,300/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1752784073_Richmond_III.png |
   | Hampstead | 3 Bedroom | 3 | 2 | 886 | $3,620/mo | https://assets.rentsync.com/fitzrovia/images/floorplans/1633721871_Hampstead.jpg |

3. In `PARKER_SYSTEM_PROMPT`, add a new section after "CURRENT INCENTIVES:" called "AVAILABLE FLOOR PLANS:" listing all 11 suites grouped by category with name, sqft, beds/baths, and price. Add a brief instruction: "When a prospect asks about floor plans, suite sizes, or specific layouts, reference the floor plan details above. Mention the suite name and size. If they want to see the layout, invite them to scroll to the Floor Plans section on this page."

Do NOT add any instruction to share URLs — Emma must never share external links per the existing guardrail.
  </action>
  <verify>
    <automated>cd /Users/puneetnagpal/development/parker && node -e "const d = require('./lib/parker-data'); console.log('Plans:', d.PARKER_FLOOR_PLANS.length); console.log('Prompt has floor plans:', d.PARKER_SYSTEM_PROMPT.includes('AVAILABLE FLOOR PLANS'));" 2>&1 || npx tsx -e "import { PARKER_FLOOR_PLANS, PARKER_SYSTEM_PROMPT } from './lib/parker-data'; console.log('Plans:', PARKER_FLOOR_PLANS.length); console.log('Prompt:', PARKER_SYSTEM_PROMPT.includes('AVAILABLE FLOOR PLANS'));"</automated>
  </verify>
  <done>PARKER_FLOOR_PLANS has 11 entries, PARKER_SYSTEM_PROMPT includes floor plan details, next.config.ts allows assets.rentsync.com</done>
</task>

<task type="auto">
  <name>Task 2: Create FloorPlans component and wire into page</name>
  <files>components/FloorPlans.tsx, app/page.tsx</files>
  <action>
1. Create `components/FloorPlans.tsx` as a client component following the same patterns as Amenities.tsx:
   - `"use client"`, import `useScrollReveal` from `@/lib/hooks`
   - Import `PARKER_FLOOR_PLANS` from `@/lib/parker-data` and `Image` from `next/image`
   - Section with `id="floorplans"`, cream background (`var(--cream)` to alternate from Amenities' `--cream-mid`)
   - Header: orange accent line + "Floor Plans" label (same pattern as Amenities header), heading "Find Your Layout" in display font
   - Category filter tabs: "All", "Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom" — styled as horizontal pill buttons. Active tab uses `var(--orange)` background with white text, inactive uses `var(--border)` background with `var(--ink)` text. Use `useState` for active category.
   - Grid of floor plan cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
   - Each card: white background, subtle border (`var(--border)`), hover shadow transition. Contains:
     - Floor plan image in `aspect-[3/4]` container using `next/image` with `fill` and `object-contain` (NOT object-cover — floor plans need whitespace). Light gray background (`#f5f5f3`) behind image.
     - Below image: suite name in display font (Cormorant), then a row with beds/baths/sqft in body font (small, muted), then price in orange.
   - Cards use `.reveal` class with staggered delays for scroll animation
   - Filter is instant (no animation needed) — just filter the array by category

2. In `app/page.tsx`:
   - Import `FloorPlans` from `@/components/FloorPlans`
   - Insert `<FloorPlans />` between `<Amenities />` and `<Gallery />` in the JSX

Brand token reference:
- `--ink`: #131311 (headings)
- `--orange`: #E85B3A (accents, price)
- `--cream`: #FAF9F7 (section bg)
- `--border`: #E8E3DC (card borders)
- `--ink-muted`: #6B6560 (secondary text)
- `--font-display` / `--font-body` via CSS vars
- `.display` class for headings (Cormorant Garamond)
  </action>
  <verify>
    <automated>cd /Users/puneetnagpal/development/parker && npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>FloorPlans section renders on the page between Amenities and Gallery. Shows 11 floor plan cards with images. Category filter tabs work to narrow results. Build succeeds with no errors.</done>
</task>

</tasks>

<verification>
1. `npm run build` completes without errors
2. `npm run dev` shows Floor Plans section between Amenities and Gallery
3. All 11 floor plan images load (rentsync.com domain allowed)
4. Category filter tabs filter cards correctly
5. Emma responds knowledgeably when asked "What floor plans do you have?" or "How big is the Greenwich suite?"
</verification>

<success_criteria>
- Floor Plans section visible on page with all 11 suites displayed
- Filter tabs narrow display by suite category
- Each card shows name, sqft, beds/baths, price, and floor plan image
- Emma's system prompt includes floor plan knowledge and she can discuss layouts conversationally
- Production build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/260319-rqf-add-floor-plans-section-to-website-and-u/260319-rqf-SUMMARY.md`
</output>
