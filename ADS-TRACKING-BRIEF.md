# Parker — Facebook & Instagram Ads Tracking Brief

## Meta Pixel

**Pixel ID:** `3255042007990556`

The pixel is installed on `parker.affordablecondos.ca` and fires the following standard events:

| Event | Trigger |
|-------|---------|
| `PageView` | Every page load |
| `ViewContent` | User opens the chatbot ("Chat with Emma") |
| `Lead` | User completes the chatbot lead capture flow |

No additional pixel installation is needed — it's already live. You can verify in **Meta Events Manager → Data Sources → `3255042007990556`**.

---

## Custom Audiences to Build

Please create the following **Website Custom Audiences** in Meta Business Manager:

| Audience Name | Rule |
|---------------|------|
| **Parker — All Visitors** | All website visitors, last 180 days |
| **Parker — Opened Chat** | `ViewContent` fired, last 60 days |
| **Parker — Converted (Leads)** | `Lead` fired, last 180 days |

**Retargeting audience (most important):**
- `ViewContent` fired **AND** `Lead` NOT fired, last 60 days
- These are people who showed intent but didn't convert — highest-value retargeting segment

**Suppression audience:**
- `Lead` fired → exclude from all ad sets so we don't spend on converted leads

---

## Lookalike Audiences

Once 50+ `Lead` events accumulate, create:
- **1% Lookalike** of the `Lead` audience (CA) — primary prospecting audience
- **2–3% Lookalike** of the `Lead` audience (CA) — broader reach

---

## Conversion Event for Campaign Optimization

When setting up campaigns, use:
- **Optimization event:** `Lead`
- **Attribution:** 7-day click, 1-day view

This tells Meta to find people most likely to complete the chatbot lead flow.

---

## Google Ads (for reference)

Google Ads conversion is also firing on lead capture:
- **Conversion action:** Parker Lead
- **Conversion ID:** `AW-860175244`
- GA4 audiences (`chat_opened`, `chat_started`, `lead_captured`) are available for RLSA and remarketing once synced to Google Ads.

---

## Landing Page URL

All ads should point to: **`https://parker.affordablecondos.ca`**

No UTM parameters are required for pixel tracking, but if your team uses UTMs for campaign reporting, the pixel will capture them automatically.
