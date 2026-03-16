# Roadmap: Parker Instagram Story Ads

## Overview

Five static Instagram story ad creatives (1080×1920 px PNG) for Parker at Yonge + Eglinton.
Pre-production resolves photo rights and compliance blockers before any creative work begins.
Ad generation produces all five ads (background + brand compositing). Export and handoff
delivers upload-ready files and the Meta campaign brief to Garima.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Pre-Production** - Resolve photo rights, compliance, tooling, and Figma template before any creative work (completed 2026-03-16)
- [ ] **Phase 2: Ad Generation** - Produce all 5 ads — background images + full brand compositing for each
- [ ] **Phase 3: Export + Campaign Handoff** - Final PNG exports and Meta campaign brief for Garima

## Phase Details

### Phase 1: Pre-Production
**Goal**: All blockers are cleared and the production environment is ready — no creative work begins until rights, compliance, and tooling are confirmed
**Depends on**: Nothing (first phase)
**Requirements**: PRE-01, PRE-02, PRE-03, PRE-04
**Success Criteria** (what must be TRUE):
  1. Garima has confirmed Fitzrovia photography is authorized for paid Instagram ad use
  2. RECO-compliant attribution line wording is agreed and documented
  3. nano-banana CLI flags for 1080×1920 PNG output are confirmed working (or Figma-only path is chosen)
  4. Figma canvas is set up at 1080×1920 with safe-zone guides at y=250 and y=1536, Cormorant Garamond and Plus Jakarta Sans loaded
  5. Meta Housing Special Ad Category requirement is noted in a handoff doc stub
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Document Fitzrovia photo rights confirmation + lock RECO attribution wording
- [ ] 01-02-PLAN.md — Verify nano-banana CLI for 9:16 generation + write Meta Housing brief + Figma template spec

### Phase 2: Ad Generation
**Goal**: All 5 ads are fully composited and visually complete — each ad has a background image, correct brand layer (logo, eyebrow, headline, subhead, CTA button, attribution), and passes a brand consistency check
**Depends on**: Phase 1
**Requirements**: SPEC-01, SPEC-02, SPEC-03, SPEC-04, SPEC-05, SPEC-06, SPEC-07, SPEC-08, AD1-01, AD1-02, AD1-03, AD1-04, AD1-05, AD2-01, AD2-02, AD2-03, AD2-04, AD2-05, AD3-01, AD3-02, AD3-03, AD3-04, AD3-05, AD4-01, AD4-02, AD4-03, AD4-04, AD4-05, AD5-01, AD5-02, AD5-03, AD5-04, AD5-05
**Success Criteria** (what must be TRUE):
  1. Ad 1 (Incentives) exists with "Up to 2 Months Free" headline, "Claim Your Free Month" CTA, orange sharp-corner button, Parker logo top-left, RE/MAX attribution visible
  2. Ad 2 (Lifestyle) exists with italic Cormorant Garamond headline, amenities subhead, "Book a Private Tour" CTA
  3. Ad 3 (Location) exists with Yonge + Eglinton context background, "Steps from the best of Yonge + Eglinton." headline, "Explore Suites" CTA
  4. Ad 4 (Urgency) exists with dramatic exterior background, "Move in today." headline, "Move In Today" CTA
  5. Ad 5 (Conversational) exists with warm interior background, "Emma can help." headline, "Chat with Emma" CTA
  6. All 5 ads share: Parker logo white top-left within safe zone, RE/MAX Hallmark Realty attribution at minimum 22pt, CTA button in #E85B3A with sharp corners
**Plans**: TBD

Plans:
- [ ] 02-01: Ad 1 — Incentives (background + compositing)
- [ ] 02-02: Ad 2 — Lifestyle/Amenities (background + compositing)
- [ ] 02-03: Ad 3 — Location (background + compositing)
- [ ] 02-04: Ad 4 — Urgency (background + compositing)
- [ ] 02-05: Ad 5 — Conversational (background + compositing)

### Phase 3: Export + Campaign Handoff
**Goal**: Upload-ready PNG files are exported and labelled, and Garima has everything she needs to launch the campaign in Meta Ads Manager
**Depends on**: Phase 2
**Requirements**: HAND-01, HAND-02, HAND-03
**Success Criteria** (what must be TRUE):
  1. 5 PNG files exist, named parker-ad-01-incentives.png through parker-ad-05-conversational.png, each verified at 1080×1920px, ≤30MB, sRGB
  2. A campaign brief doc exists noting the Housing Special Ad Category requirement, destination URL (parker.affordablecondos.ca), and per-ad CTA mapping
  3. Garima can open the brief, upload the 5 files to Meta Ads Manager, and launch without needing additional information from this workflow
**Plans**: TBD

Plans:
- [ ] 03-01: QA export — verify dimensions, file size, color space for all 5 ads
- [ ] 03-02: Write Meta campaign brief and package all deliverables

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Pre-Production | 2/2 | Complete   | 2026-03-16 |
| 2. Ad Generation | 0/5 | Not started | - |
| 3. Export + Campaign Handoff | 0/2 | Not started | - |
