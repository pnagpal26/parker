---
phase: quick
plan: 260319-rqf
subsystem: landing-page
tags: [floor-plans, ui, data, emma, chatbot]
dependency_graph:
  requires: []
  provides: [floor-plans-section, emma-floor-plan-awareness]
  affects: [app/page.tsx, lib/parker-data.ts, components/FloorPlans.tsx, next.config.ts]
tech_stack:
  added: []
  patterns: [useScrollReveal, next/image with fill+object-contain, category filter tabs]
key_files:
  created:
    - components/FloorPlans.tsx
  modified:
    - lib/parker-data.ts
    - app/page.tsx
    - next.config.ts
decisions:
  - "object-contain (not object-cover) for floor plan images — floor plans need whitespace to be readable"
  - "Filter is stateful via useState, not URL-based — single-page landing, no need for deep linking"
  - "Cards use i % 6 for delay calc to reset stagger per row and avoid very long delays on filtered views"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-20"
  tasks_completed: 2
  files_changed: 4
---

# Phase quick Plan 260319-rqf: Floor Plans Section Summary

## One-liner

Visual floor plans section with 11 suite layouts, category filter tabs, and Emma system prompt updated with per-suite size and pricing knowledge.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Add floor plan data and update Emma's system prompt | 9be1002 | Done |
| 2 | Create FloorPlans component and wire into page | b919e75 | Done |

## What Was Built

### PARKER_FLOOR_PLANS data array (`lib/parker-data.ts`)
11 suite layouts added with name, category, beds, baths, sqft, price, and rentsync image URL. Categories: Studio (1), 1 Bedroom (6), 2 Bedroom (3), 3 Bedroom (1).

### Emma system prompt update (`lib/parker-data.ts`)
New `AVAILABLE FLOOR PLANS:` section added to `PARKER_SYSTEM_PROMPT`, listing all 11 suites grouped by category with name, sqft, baths, and price. Instruction added to reference suite names and invite prospects to scroll to the Floor Plans section if they want to see the layout.

### FloorPlans component (`components/FloorPlans.tsx`)
Client component with:
- Section header matching Amenities pattern (orange accent line + label, Cormorant display heading)
- Category filter pills — active tab uses `var(--orange)` background with white text
- 3-column grid (1 col mobile, 2 col tablet, 3 col desktop)
- Cards with `aspect-[3/4]` floor plan image (`object-contain`, `#f5f5f3` background), Cormorant suite name, muted beds/baths/sqft row, orange price
- Scroll reveal animations with staggered delays

### next.config.ts
Added `assets.rentsync.com` to `remotePatterns` so floor plan images load without Next.js image errors.

### Page wiring (`app/page.tsx`)
`<FloorPlans />` inserted between `<Amenities />` and `<Gallery />`.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

Files created/modified:
- [x] `components/FloorPlans.tsx` — exists
- [x] `lib/parker-data.ts` — PARKER_FLOOR_PLANS exported, AVAILABLE FLOOR PLANS in system prompt
- [x] `app/page.tsx` — FloorPlans imported and rendered
- [x] `next.config.ts` — assets.rentsync.com in remotePatterns

Commits:
- [x] 9be1002 — feat(260319-rqf): add floor plan data and update Emma's system prompt
- [x] b919e75 — feat(260319-rqf): add FloorPlans component and wire into page

Build: passed (no TypeScript errors, no build errors)

## Self-Check: PASSED
