# Meta Housing Special Ad Category — Campaign Brief

**Status:** DOCUMENTED
**Date:** 2026-03-15
**Requirement ID:** PRE-04
**For:** Whoever sets up the Parker campaign in Meta Ads Manager

## CRITICAL: Do This First

When creating the Parker campaign in Meta Ads Manager, the VERY FIRST thing to
do is set the Special Ad Category. Before configuring any ad sets, audiences,
or creative:

1. Create a new Campaign
2. In the Campaign settings, find "Special Ad Categories"
3. Select: **Housing**
4. Only then proceed to configure ad sets and audiences

If you skip this step, Meta may reject ads after launch or force a campaign
restart that loses all your ad set configuration.

## What the Housing Category Restricts

These targeting options are LOCKED by Meta policy for all housing ads in Canada.
Do not attempt to use them — the fields will be greyed out in Ads Manager.

| Restriction | What It Means |
|-------------|--------------|
| Age targeting | Fixed at 18–65+ (cannot narrow to e.g. 25–45) |
| Gender targeting | Must include all genders |
| ZIP/postal code targeting | Not allowed |
| Geographic radius | Minimum ~25 km radius applies |
| Lookalike audiences | Standard Lookalike Audiences blocked |
| Detailed interest targeting | Most demographic and interest options removed |
| Audience exclusions | Exclusion targeting not allowed |

## What Still Works

These targeting approaches ARE available under the Housing category:

| Approach | Notes |
|----------|-------|
| Province / city targeting | Ontario, Toronto — still available |
| Custom audiences (first-party) | Website visitors via Meta Pixel — AVAILABLE |
| Retargeting: ViewContent event | Warm audience — people who opened the chatbot |
| Retargeting: Lead event | Hot audience — people who completed lead capture |
| Suppression: Lead event | Exclude converted leads from all ad delivery |
| Special Ad Audiences | Meta's compliant alternative to Lookalike Audiences |

The Meta Pixel on parker.affordablecondos.ca fires these events automatically:
- `PageView` — every page load
- `ViewContent` — user opens the chatbot panel
- `Lead` — user completes the full lead capture (all 6 fields collected)

Use `ViewContent` (warm) and `Lead` (converted/suppress) to build retargeting
and suppression audiences in Meta Ads Manager.

## Campaign Destination URL

All 5 ads link to: **https://parker.affordablecondos.ca**

Set this as the destination URL in each ad unit in Ads Manager.
The URL shown in the ad image is visual only — the actual click destination
is set here, in the ad configuration.

## Per-Ad CTA Mapping

| Ad | Image CTA Text | Destination |
|----|---------------|-------------|
| Ad 1 — Incentives | "Claim Your Free Month" | https://parker.affordablecondos.ca |
| Ad 2 — Lifestyle | "Book a Private Tour" | https://parker.affordablecondos.ca |
| Ad 3 — Location | "Explore Suites" | https://parker.affordablecondos.ca |
| Ad 4 — Urgency | "Move In Today" | https://parker.affordablecondos.ca |
| Ad 5 — Conversational | "Chat with Emma" | https://parker.affordablecondos.ca |

All five ads use the same destination URL. The CTA text in the image is visual
branding only — Ads Manager has its own CTA button field (use "Learn More" or
"Book Now" in the Ads Manager CTA picker).

## File Naming (Phase 3 will confirm)

Expected final filenames for upload:
- parker-ad-01-incentives.png
- parker-ad-02-lifestyle.png
- parker-ad-03-location.png
- parker-ad-04-urgency.png
- parker-ad-05-conversational.png

All files: 1080×1920px, PNG, sRGB color profile.

## Urgency Ad Copy Note (Ad 4)

Meta's review system may flag copy implying false scarcity ("Only 3 units left").
The planned copy uses "Move In Today" — this is factual (immediate move-in is
available) and is generally accepted by Meta review. Do NOT add unit counts or
countdown language to Ad 4.

## Source

Meta Special Ad Categories (Housing): https://www.facebook.com/business/help/298000447747885
Mandatory in Canada since December 2020.
