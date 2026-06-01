# Truva GA4 Tracking — Work Handoff (2026-06-01)

> Self-contained handoff for the next agent (Gemini or otherwise) picking up
> the analytics workstream. Read this before touching `lib/analytics/*` or any
> `cc_*` / tracking code.

---

## TL;DR

Truva's GA4 tracking was broken in production for weeks (CSP was silently
blocking `analytics.google.com` and `www.google.com` collect beacons). Fixed
and verified live. The credit-card funnel is now fully instrumented end-to-end
with privacy-safe events, plus 32 custom dimensions registered in GA4. The
production CODE is in good shape. The **POLICY/UX layer** is the open gap:
privacy-policy disclosure of GA usage and a cookie-consent banner.

---

## Repo state right now

- Default branch: `main`. Vercel auto-deploys from `main`.
- Production URL: `https://www.gotruva.com` (gated by `NODE_ENV=production` AND
  `VERCEL=1`; GA does NOT load on localhost or preview deploys).
- GA Measurement ID: `G-VKNLYP2027`. GA4 property ID: `532512485` (timezone
  `Asia/Manila`).

**Two PRs awaiting merge at handoff time:**
1. `chore/ga-query-tooling` — 10 dev-only GA query/admin scripts under
   `scripts/ga4-*.mjs`. No production impact.
2. `feat/cc-finder-partial-profile` — enriches `cc_finder_abandoned` with the
   partial answer profile, and documents the PH DPA compliance posture in the
   analytics file header. **Merge this one first.**

**Already merged earlier this session:** PR #17 (CSP fix + initial tracking
across CC + secondary surfaces), PR #18 (finder step-viewed + mid-quiz
abandon detection).

---

## What's tracked today (don't re-add these)

### Credit-card finder funnel
| Event | Fires when | Key params |
|---|---|---|
| `cc_finder_started` | "Start card finder" clicked | `source_page` |
| `cc_finder_step_viewed` | User arrives at a quiz step | `step`, `question_id` |
| `cc_finder_step_completed` | User answers or skips a step | `step`, `question_id`, `answer_value`, `skipped` |
| `cc_finder_completed` | All 5 questions answered | `first_card`, `income_band`, `spend`, `priority`, `avoid` |
| `cc_finder_abandoned` | Tab close / Q1 cancel / SPA nav away mid-quiz | `step`, `question_id`, `reason` ∈ `{cancel, page_hidden, navigated_away}`, partial answers |
| `cc_finder_browse_all_clicked` | "Browse all cards" tapped on landing | `source_page` |
| `cc_finder_resume_clicked` | Resume affordance tapped | — |

### Results + detail
- `cc_results_viewed` / `cc_no_match_viewed` — result page render
- `cc_detail_viewed` — card review page open
- `cc_result_detail_clicked` — card tapped from results

### Apply (THE high-value event for bank partnerships)
- `cc_apply_click` — "Apply on bank site" button. Includes `card_key`, `bank`,
  `placement` (`browse_dense_row` / `browse_mobile_card` / `browse_tablet_card`
  / `credit-card-finder`), `rank`, `source_page`.

### Browse / catalog
- `cc_browse_filter_pill` / `cc_browse_filter_changed` / `cc_browse_sort_changed`
- `cc_browse_filters_cleared` / `cc_browse_search_used` (length only, no text)
- `cc_browse_card_expanded` / `cc_compare_toggled`
- `cc_hero_carousel_nav` (manual taps only, NOT auto-advance)

### Cross-cutting (savings, MMF, content, nav)
- `theme_toggled`, `feedback_modal_opened`, `feedback_submitted`,
  `filter_tab_clicked`, `partner_cta_clicked`, `partner_form_submitted`,
  `mobile_menu_toggled`, `rates_duration_clicked`, `mmf_filter_clicked`,
  `coming_soon_clicked`, `article_category_filtered`, `newsletter_signup_success`,
  `waitlist_signup`, all `calculator_*` and `quick_match_*` events.

---

## Open work items (priority order)

### 1. Privacy Policy: disclose GA4 usage  ★ COMPLIANCE
**Why:** NPC Circular 2023-04 says when personal info is collected (and GA4
client_id qualifies as "personal info" under RA 10173), the user must be told
what data, the purpose, the controller, and how to exercise their rights.
**What:** Add a section to `/terms` or a new `/privacy` page covering:
- Truva uses GA4 (measurement ID `G-VKNLYP2027`) for product analytics.
- What's collected: pseudonymous client ID + the event params listed in the
  table above. Income is sent as a band (e.g. `"50-100"`), never an exact figure.
- No PII (name, email, phone), no sensitive personal information per §3(l).
- User rights under RA 10173 (access, correction, deletion, complain to NPC).
- Truva is the Personal Information Controller; contact email.
**Where:** likely a new `app/privacy/page.tsx` or amend `app/terms/page.tsx`.
Effort: ~1 hour copy + small page.

### 2. Cookie consent banner  ★ COMPLIANCE-ADJACENT
**Why:** NPC has no specific cookie circular yet, but enforcement is trending
toward EU-style opt-in. Industry best practice in PH 2026.
**What:** Lightweight banner on first visit. Categories: "Essential" (always
on) and "Analytics" (toggleable). When user declines analytics, gate GA via
`gtag('consent', 'update', { analytics_storage: 'denied' })`.
**Where:** new client component mounted in `app/layout.tsx`; wire to a small
zustand/cookie store. Look at libraries: `react-cookie-consent` is the
canonical option (MIT, ~3KB). Skill `update-config` may help for hooks.
**Watch out:** GA4 supports Google Consent Mode v2 — that's the standards-
compliant way to handle denied consent (events still fire as cookieless
pings, no client_id). Configure via `gtag('consent', 'default', {...})`
BEFORE the `gtag('config', ...)` call in `@next/third-parties`. May need to
fork or wrap the official integration.
Effort: ~1 day with consent mode v2; ~3 hours without.

### 3. `page_path: null` bug in `affiliate_clicks` table  ★ DATA QUALITY
**Why:** Every row in Supabase `affiliate_clicks` has `page_path = null`. The
column exists but isn't being populated. Means you can't attribute savings
affiliate clicks to the source page.
**Where:** likely an API route under `app/api/affiliate-clicks/` (or wherever
the insert happens). Check `lib/affiliate-analytics.ts` for the client-side
payload — `page_path` may not be in the body.
Effort: ~30 min.

### 4. `PreQualFlow` is dead code  ★ CODE QUALITY
**Why:** The savings-page pre-qualification mini-funnel is gated behind
`{false && ...}` in `components/RateSection.tsx:148`. Renders nothing ever.
**What:** Either delete `components/PreQualFlow.tsx` + its imports OR ship it
behind a real flag. Decision is product-level.
Effort: ~15 min (delete) or ~30 min (ship behind flag).

### 5. Pre-existing lint error in carousel  ★ CODE QUALITY
**Where:** `components/credit-cards/CreditCardHeroCarousel.tsx:46`.
`react-hooks/set-state-in-effect`. The `setActiveIndex(0)` effect needs to
be reworked per React Compiler rules. Predates this session.
Effort: ~20 min.

### 6. Build a "finder funnel by profile" report  ★ NICE-TO-HAVE
**Why:** Now that `cc_finder_abandoned` carries `partialAnswers`, you can
slice abandonment by profile (e.g. "what % of `income_band: <15` users
abandon?"). This needs a custom GA4 Data API query.
**Where:** add `scripts/ga4-finder-by-profile.mjs` modeled on the existing
`scripts/ga4-credit-cards-report.mjs`. See the existing pattern for OAuth
flow + report dimensions.
Effort: ~1 hour.

### 7. Enable GA on Vercel preview deployments  ★ DEV-EX
**Why:** GA is currently gated to production only. Means you can't QA tracking
on a preview deploy before merging. Workaround used this session was the
"dummy GA mount" hack documented in `app/layout.tsx` git history (PR #17).
**What:** Loosen the gate in `app/layout.tsx` to load GA on preview
deployments too, but with a SEPARATE measurement ID (`G-PREVIEW...` — create
a second GA4 property for preview/QA). Keeps prod data clean while enabling
preview testing.
Effort: ~1 hour incl. provisioning the preview GA property.

---

## Key files map

```
lib/analytics/creditCards.ts         ← all cc_* event helpers (privacy-safe choke point)
components/credit-cards/finder/
  FinderFlow.tsx                     ← finder state machine, fires step/abandon events
  QuizQuestion.tsx                   ← per-question UI; calls FinderFlow's onSelect/onSkip/onBack
components/credit-cards/
  CreditCardCatalog.tsx              ← browse-all page (filter pills, sort, search, expand, compare)
  CreditCardHero.tsx                 ← landing hero with Start / Browse / Resume CTAs
  CreditCardHeroCarousel.tsx         ← rotating card visual (pre-existing lint issue line 46)
  CreditCardClientPage.tsx           ← /credit-cards route entry (Suspense wraps FinderFlow)
  shared/ApplyOnBankSiteButton.tsx   ← fires cc_apply_click; the BANK PARTNERSHIP MONEY EVENT
app/layout.tsx                       ← GA gate: NODE_ENV=production AND VERCEL=1
next.config.mjs                      ← CSP — connect-src MUST include analytics.google.com + www.google.com
scripts/ga4-*.mjs                    ← all GA query/admin tooling (on chore/ga-query-tooling branch)
```

---

## GA4 setup (don't redo)

**Property:** Truva Web App (`532512485`), measurement ID `G-VKNLYP2027`,
timezone Asia/Manila, currency PHP.

**Custom dimensions registered (32):** `action`, `answer_value`, `avoid`,
`bank`, `card_key`, `category`, `count`, `direction`, `feedback_type`,
`filter`, `filter_type`, `filter_value`, `first_card`, `income_band`,
`method`, `months`, `pill`, `placement`, `priority`, `query_length`,
`question_id`, `reason`, `result_role`, `skipped`, `sort_mode`, `source_page`,
`spend`, `tab`, `to_theme`, `top_bank`, `top_card_key`. All event-scoped.

**Custom metrics registered (3):** `step`, `rank`, `result_count`. (Numeric,
correctly typed as metrics not dimensions.)

If new params are added, register them via `scripts/ga4-register-dimensions.mjs`
(idempotent — only creates missing ones).

---

## How to run the GA query scripts

One-time setup (per dev machine):
1. Cloud Console → enable **Google Analytics Data API**
2. Create OAuth 2.0 **Desktop** client → download JSON → save as
   `ga4-oauth-client.json` in project root (gitignored).
3. Run any script: `node scripts/ga4-apply-history.mjs` — browser will open
   for one-time consent (read scope) or for the register script
   (write/edit scope, prompts separately).

**Key scripts on `chore/ga-query-tooling` branch:**
- `ga4-credit-cards-report.mjs` — full 30-day CC funnel + apply-by-card
- `ga4-apply-history.mjs` — apply clicks by card, today + last 7 days
- `ga4-today.mjs` — today/yesterday/3-day overall traffic
- `ga4-rt-poll.mjs` — 75-second realtime watcher (good for live click tests)
- `ga4-csp-check.mjs` — polls production CSP header (use to confirm a deploy)
- `ga4-register-dimensions.mjs` — additive register of custom dimensions

---

## Gotchas / lessons from this session

1. **GA4 with Google Signals sends to 3 hosts, not 1.** The CSP `connect-src`
   MUST allow all three: `*.google-analytics.com`, `analytics.google.com`,
   `www.google.com`. Missing any of them silently drops a chunk of hits.
   Browsers show this in the console as "Refused to connect ... Content
   Security Policy" — always check console FIRST when tracking looks broken.

2. **CSP/tracking debugging requires the BROWSER, not the server.** Server-
   side checks (GA Data API, curl) can only see what GA *received* — never
   what was *blocked*. The console + Network tab on production are the only
   places a delivery failure is visible.

3. **`sendGAEvent` early-returns in dev** because the `<GoogleAnalytics>`
   component never mounts when `NODE_ENV !== 'production'`. To test locally,
   temporarily add `<GoogleAnalytics gaId="G-TESTLOCAL00" />` in
   `app/layout.tsx` and intercept `window.dataLayer.push`. Always revert
   before committing.

4. **React StrictMode double-fires.** Never put `sendGAEvent` inside a
   `setState` updater function — StrictMode's double-invoke causes the event
   to fire twice in dev (and is fragile in prod too). Fire BEFORE/AFTER
   `setState`, reading current state from a ref if needed. See the
   `handleSetExpanded` and `toggleCompare` patterns in `CreditCardCatalog.tsx`
   for the correct shape.

5. **Realtime API doesn't support custom-dimension breakdowns.** The standard
   `runReport` endpoint does. `card_key`/`bank`/etc. breakdowns only work in
   the standard report (24h lag), not Realtime. Realtime can only confirm
   event-name + active-user counts live.

6. **GA4 reserved params:** `value`, `currency`, `transaction_id`, etc. are
   reserved by GA4 for ecommerce semantics. Avoid them. We renamed our filter
   `value` param to `filter_value` for this reason.

7. **Custom dimensions don't backfill.** Newly registered dims only populate
   from registration time forward. Historical events stay invisible to those
   dims even though the param was emitted.

8. **The finder is Suspense-wrapped.** `CreditCardClientPage.tsx` renders
   `<Suspense fallback={<FinderFallback ...>}>` — the fallback hero has
   empty handlers. A user clicking during pre-hydration won't get tracked.
   Narrow race, low priority, but worth knowing.

---

## PH DPA quick reference

- **Authority:** National Privacy Commission (NPC), https://privacy.gov.ph
- **Law:** Republic Act 10173 (Data Privacy Act of 2012)
- **Sensitive personal info** (§3l, strictest tier): race, ethnic origin,
  marital status, age, color, religious/philosophical/political affiliations,
  health, education, genetic/sexual life, offenses, government-issued IDs.
  **Income is NOT in this list.** Income bands further reduce risk.
- **Key recent guidance:**
  - NPC Circular 2023-04 (Guidelines on Consent) — what to disclose when
    collecting personal info.
  - NPC Advisory 2026-01 (Data Scraping) — heightens scrutiny of scraping
    activities; not applicable to first-party analytics like Truva's.
- **Penalties:** unauthorized processing of sensitive PI = 2–7 years prison
  + ₱500k–₱2M fine.

**Truva's tracking posture under RA 10173:** clean. No PII, no sensitive PI,
income as bands, coarse category ids, pseudonymous client ID. The gap is
disclosure (no privacy policy section + no cookie banner), not collection.

---

## Anything I left half-done

Nothing intentionally. The only "soft" thing: I did NOT use the local
register-dimensions script to register `reason` from the partial-profile PR
(it WAS registered in the previous PR cycle — the value `reason` already
exists). If you add more dimension-bearing events, run the register script.

Last session ended with: 2 PRs awaiting merge, GA pipeline verified live
(real apply click captured for "HSBC Live Credit Card"), 32 dimensions live.
