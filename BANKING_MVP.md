# /banking refresh — Savings & Deposits

> **Working document.** Update status as we ship. Last updated: 2026-05-11.
> Owner: Alberto (Truva). Single source of truth for the /banking refresh.
>
> **MVP goal:** Test product-market fit for Truva's Savings & Time-Deposits vertical. Ship the smallest version that lets a Filipino saver be routed to the right product for their needs, see all listed partner products, and get common questions answered — then watch what happens.

---

## ⚠️ AI update protocol — READ FIRST

**Every AI model working on the /banking refresh MUST update this file at the start and end of their session.** This is the single source of truth for goals, decisions, and progress. Without continuous updates, future sessions will rebuild context from scratch and we will drift from the plan.

### Where this document lives

- **Canonical path in the repo:** `BANKING_MVP.md` at the project root, alongside `TRUVA_MASTER.md` and `CLAUDE.md`. ✅ Promoted 2026-05-11 from `.claude/plans/i-need-you-to-nifty-deer.md`.
- **Auto-loaded:** `CLAUDE.md` references this doc so every Claude Code session sees it in context.

### When you must update this file

You MUST edit this file in the same session if you do any of the following on /banking:

1. **Ship code** that lands one of the Status table phases. Mark the row ✅, add the date and a short note (e.g. commit SHA or PR link).
2. **Make a non-trivial decision** that affects scope, design, technical approach, or copy voice — add a dated row to the **Decisions log** with a one-line rationale.
3. **Discover a blocker, defect, or surprise** — add it to **Open questions / TBD** with enough context for the next session to act.
4. **Change a file path, function name, or data contract** named in this doc — find every reference and update them in lockstep.
5. **Add or remove a phase, file, KPI, or verification step** — keep the Status table, Files modified table, and Verification list mutually consistent.

### When you should NOT touch this file

- Small typo or comment fixes in code that don't change behavior.
- Reading the doc for context without changing the plan.
- Aesthetic-only refactors that leave file paths and function names intact.

### How to update — the rules

- **Always update the "Last updated" date** at the top when you edit. Format: `YYYY-MM-DD`.
- **Append to the Decisions log; never rewrite past entries.** If a past decision is reversed, add a new row that explicitly reverses it. The history matters.
- **Tick the Status table inline.** Format: `✅ Done — 2026-05-11 — <one-line note or SHA>`.
- **Keep the doc concise.** If a section grows past one screen of scroll, summarize and link to a deeper doc rather than letting this file balloon.
- **Resolve internal inconsistencies before you commit.** If you change a file name, grep this doc for the old name and update every mention.
- **Don't delete completed items.** Strike them through or move them to a `Shipped` subsection so we can see what's already done.

### Update checklist (drop this at the bottom of your session response)

When ending a /banking session, the AI must report:

```
[BANKING_MVP doc] Updated: yes/no
- Status rows changed: <list of phases>
- Decisions added: <count + one-liners>
- Open questions resolved: <count>
- Open questions added: <count>
- File paths/contracts changed: <yes/no — list>
```

If the report says "Updated: no" but the session touched any /banking code, that is a protocol violation — go back and update the doc before declaring the session done.

### What this protocol does NOT cover

- Generic project rules — those live in `CLAUDE.md` and `TRUVA_MASTER.md` and are not duplicated here.
- Code style — covered by ESLint / TypeScript config.
- Memory across sessions for unrelated work — that's `MEMORY.md` in the user's auto-memory store.

---

## Status — at a glance

MVP page structure (top → bottom):
1. **Routing form** (3 questions, wizard-feel, mobile-first)
2. **Recommendation block** — "Best for you" + 2 alternates
3. **All partner products** — full sorted list (banks + MP2)
4. **FAQ** — 10 questions, accordion
5. **Last verified** line

| Phase | Status | Notes |
|---|---|---|
| 0. Plan locked (v2 — MVP scope) | ✅ Done | This document. Updated 2026-05-11. |
| 0a. Promote this doc to `BANKING_MVP.md` at repo root + reference from `CLAUDE.md` | ✅ Done — 2026-05-11 | Promoted from `.claude/plans/`. `CLAUDE.md` Key Files updated. |
| 1. New `computeGrossEarnings` helper in `utils/yieldEngine.ts` | ⬜ Not started | Reuse existing `computeEffectiveGrossRate`. Pure fn, ships first. |
| 2. Routing-form state machine + URL sync | ⬜ Not started | 3 questions, `?amount=&horizon=&liquidity=` URL params. |
| 3. Recommendation engine (`lib/savings-recommend.ts`) | ⬜ Not started | Pure fn: `recommend(rates, answers) → { top, alternates[] }`. |
| 4. New `components/banking/SavingsLandingClient.tsx` | ⬜ Not started | Single client component, owns form + recommendation + full list. |
| 5. Conditions sanitizer | ⬜ Not started | Strip tax mentions before render. Private fn in the client component. |
| 6. Affiliate tracking wiring (Apply CTAs + impressions) | ⬜ Not started | `/go/{slug}` + `trackAffiliateImpression`. |
| 7. FAQ section (`components/banking/SavingsFAQ.tsx` + content) | ⬜ Not started | 10 Qs, accordion, JSON-LD `FAQPage` schema. Content drafted in Section 4 below. |
| 7a. "Save my settings" opt-in pill (localStorage, 30-day TTL) | ⬜ Not started | Optional, never auto-saves. See Section 1 details. |
| 8. Rewrite `app/banking/page.tsx` (server) | ⬜ Not started | Strip ProductHubTemplate, MMF preview, BankPickCard grid. Fetch rates. |
| 9. Mobile cards for the partner list (≤640px) | ⬜ Not started | No horizontal scroll, 375px base. |
| 10. Copy pass against TRUVA_MASTER + CLAUDE rules | ⬜ Not started | Grade 6–8, no "after-tax", no Taglish, no "!". |
| 11. Verification checklist (all items) | ⬜ Not started | See "Verification" below. |
| 12. Lighthouse mobile + smoke on real phone | ⬜ Not started | Performance ≥85, A11y ≥95. |
| 13. PMF instrumentation | ⬜ Not started | See "PMF measurement" section. |

Tick items as they ship. Add date + commit SHA next to each ✅.

---

## Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-09 | Form first, table second, nothing else above the fold | High-intent users came to find a rate. |
| 2026-05-09 | Completely silent on tax (no footnote, no link, no math) | CLAUDE.md rule #3 + user instruction. |
| 2026-05-09 | Drop MMF preview from /banking | Has its own page; off-topic for savings searchers. |
| 2026-05-09 | Drop methodology link strip | Methodology pages not yet functioning — defer until live. |
| 2026-05-09 | Drop `/banking/compare` link | Form already ranks best providers for user's amount + horizon. Redundant. |
| 2026-05-09 | Drop `/calculator` link | Form on /banking is the calculator. Separate page is redundant. |
| 2026-05-09 | Reuse existing `computeEffectiveGrossRate`, don't add a duplicate | Surfaced during review. |
| 2026-05-09 | Apply CTAs go via `/go/{slug}`, not direct `affiliateUrl` | Preserves Supabase click tracking. |
| 2026-05-09 | Per-CTA disclosure required (not just page-level) | CLAUDE.md rule #5 + TRUVA_MASTER.md. |
| 2026-05-09 | Conditions descriptions must be sanitized for tax keywords | UNO descriptions contain "withholding tax". |
| 2026-05-09 | Single `SavingsLandingClient.tsx` (not split into two) | One owner of `?amount` / `?horizon` / `?liquidity` URL state. |
| 2026-05-11 | Form is a **routing form** (3 questions), not just amount + months | Goal is to route the user to the right product, not just filter. Tests PMF for the "guided" experience. |
| 2026-05-11 | Show **recommendation** above the full list | Hero output is "the best match for *you*"; the full sorted list sits below for browsing. |
| 2026-05-11 | Include a **FAQ section** at the bottom | Captures long-tail SEO + answers questions that block conversion. Schema.org `FAQPage` JSON-LD. |
| 2026-05-11 | Data source unchanged: `getPublicRates()` reads the published Supabase snapshot | Scraper → GitHub Actions → Supabase pipeline already in place. No new infra. |
| 2026-05-11 | FAQ content filled from community sentiment (10 Qs, exactly 1 tax FAQ) | Drives from real Filipino-saver questions surfaced in finance blogs and Threads. Reduces seed-content debt. |
| 2026-05-11 | Drop footer links to `/banking/articles` and `/banking/reviews` for MVP | Reduces noise on the MVP test. Re-add post-PMF for SEO and deeper-interest journeys. |
| 2026-05-11 | Add **opt-in** "Save my settings" pill (localStorage, 30-day TTL) | Returning users skip the form, but only if they explicitly opt in. No auto-save, no surprise. |
| 2026-05-11 | Drop the "What changed since last visit?" idea entirely | User decision — not worth the complexity for the MVP. |
| 2026-05-11 | Add new affiliate placements to `AFFILIATE_PLACEMENTS` in `types/index.ts` | `banking_landing_recommendation_top`, `banking_landing_recommendation_alt`, `banking_landing_list` needed for tracking. |

---

## Open questions / TBD

- [ ] Penalty constants in `lib/savings-recommend.ts` are first-pass. Revisit after 2–4 weeks of PMF data to see if recommendations match user expectations.
- [ ] Routing form layout on mobile: one-question-per-screen wizard, or compact stacked card? Lean wizard for v1, but A/B test post-launch.
- [ ] FAQ content final voice review against TRUVA_MASTER tone rules. Current v1 wording is plain and grade-6/8-tested.
- [ ] Should the "Save my settings" indicator on return visits show which answers were saved, or stay generic? Lean generic for v1.

### Decided & removed from open questions
- ~~Keep `/banking/articles` and `/banking/reviews` footer links?~~ **Decided 2026-05-11: drop for MVP.**
- ~~"Save my settings" pill?~~ **Decided 2026-05-11: yes, opt-in only.**
- ~~"What changed since last visit?" diff?~~ **Decided 2026-05-11: no, not building this.**

---

## Context

**Why this change is being made.** Truva's `/banking` landing page is the main destination for high-intent users searching "best savings rate Philippines." The current page (`app/banking/page.tsx`) leads with editorial framing — "Savings & Deposits desk" eyebrow, "after-tax first" trust copy, a 4-item trust bar, a 4-tile quick-start grid, then 3 BankPickCards, then 3 MMF preview cards. The user form (calculator) lives on a separate `/calculator` page. A high-intent saver has to scroll past five sections and click into another route before they can answer "for *my* ₱X over *my* Y months, who pays the most?".

The refresh re-anchors the page around three rules:
1. **Form first.** Amount + months input is the first thing a user sees, on /banking itself.
2. **Simple rates table second.** Gross rates exactly as banks advertise them, with simple gross earnings for the user's amount/timeline. No after-tax math, no tax footnotes.
3. **Everything else is supporting.** Methodology, articles, MMFs, reviews, calculator stay in the navigation but are de-emphasized on the page itself.

## Pain points this addresses (research synthesis)

| Pain point | How the refresh answers it |
|---|---|
| "I don't know which bank actually pays the most for *my* amount" | Form filters and ranks the table for the user's exact amount and timeline |
| "Promo rates are bait-and-switch — they drop or expire" | Conditions and `expiresAt` visible inline next to the rate; promo rates flagged |
| "Maya 15% sounds great but you have to do missions" | `RateCondition.description` rendered as a single plain-language line on the row |
| "Tonik vs Maya vs SeaBank vs GoTyme — too many options, no clear answer" | Single sorted table replaces multiple cards/tabs; default sort = highest gross earnings for inputs |
| "I'm scared of digital banks losing my money" | PDIC / insurer badge on every row; "Last verified" date in the table footer |
| Mobile users (80%+ of traffic) struggle with horizontal-scrolling rate tables | Mobile = stacked card view. No horizontal scroll. 375px base. |

---

## Design — what /banking looks like after (MVP v2)

### Section 1 — Routing form (hero, above the fold)

A guided 3-step intake. Wizard feel on mobile (one question per screen with a progress dot), single compact card on desktop. State syncs to URL: `?amount=…&horizon=…&liquidity=…`.

**Headline:** *"Find your best savings home in 30 seconds."*
**Subhead:** *"Three questions. We match you to the highest-paying option that fits."*

**Question 1 — Amount**
- Label: *"How much will you save?"*
- Number input, default `100,000`, clamped to minimum of `1,000`.
- Helper text: *"You can change this anytime."*

**Question 2 — Horizon**
- Label: *"When might you need this money?"*
- Segmented control (single-select):
  - *"Anytime — I might need it soon"* → `horizon=anytime` (1 month)
  - *"In a few months"* → `horizon=short` (6 months)
  - *"In about a year"* → `horizon=year` (12 months)
  - *"I can leave it for a year or more"* → `horizon=long` (24 months)

**Question 3 — Liquidity preference**
- Label: *"Is it OK to lock the money for a higher rate?"*
- *"No, keep it flexible"* → `liquidity=flexible` (excludes products with `lockInDays > 0`)
- *"Yes, I can lock it"* → `liquidity=lockable` (includes time deposits)
- Auto-set to `flexible` when `horizon=anytime` is chosen.

**Affiliate disclosure microline** below form: *"We earn a fee if you apply through some links. This does not change what you are offered."*

No submit button — recommendation updates as answers change. A *"Skip questions, just show me everything"* link drops user to Section 3.

**"Save my settings" pill (v1, opt-in only).**
- Pill: *"Save my answers"*. Default: off.
- Clicked → writes `{ amount, horizon, liquidity, savedAt }` to `localStorage` key `truva:banking:saved-answers`. Pill flips to *"Saved — clear"*.
- Return visit: if entry is non-expired (TTL: 30 days), form pre-fills and a line appears: *"Loaded your saved answers — start fresh →"*.
- **Never auto-save on form change.** Only writes when user explicitly clicks the pill.

### Section 2 — Recommendation ("Best for you")

Visible immediately (defaults pre-filled).

- **One large card**: *"Best for you"* + provider logo + rate + gross earnings + `reasonLine` + Apply button.
- **Two smaller alternate cards**: *"Also worth considering"* — next 2 top matches, de-emphasized.
- **Reset CTA**: *"See all options →"* anchor-jumps to Section 3.

Cards show gross rate (as advertised) and gross simple earnings only. No tax math.

### Section 3 — All partner products

- Heading: *"All listed partner products"*
- Sort: highest **gross simple earnings** for the user's amount × horizon months.
- Desktop columns: `Provider | Rate (p.a.) | Earnings for ₱X over Y months | Lock-in | Conditions | Apply`
- Mobile (≤640px): stacked cards, no horizontal scroll.
- **Conditions sanitizer**: strips sentences matching `/withholding|after[-\s]?tax|\bFWT\b|net of tax|tax[-\s]?exempt/i`. Falls back to a generic line keyed off `condition.type`.
- **Lock-in filter**: if `liquidity=flexible`, products with `lockInDays > 0` hidden by default with a *"Show {N} locked-rate options"* toggle.
- **Apply CTA** uses `buildTrackedAffiliateHref(product.id, placement)` → `/go/{slug}`.
- Each Apply button has visible *"Affiliate link"* micro-tag + `aria-describedby`.
- Promo rates flagged; `expiresAt` shown.

Horizon-to-months mapping:
- `anytime` → 1 month
- `short` → 6 months
- `year` → 12 months
- `long` → 24 months

### Section 4 — FAQ

10 plain-language questions. Accordion. `FAQPage` JSON-LD. Exactly one tax question (Q10), collapsed by default.

**FAQ content (v1):**

**Q1. How do I pick the right digital bank?**
Start with how soon you might need the money and how much you want to save. If you might need it within a few weeks, pick a savings account with no lock-in. If you can leave it for a year or more, a time deposit usually pays more. The form above sorts the options for your amount and timeline.

**Q2. Are digital banks in the Philippines safe?**
Yes, when they are licensed by the Bangko Sentral ng Pilipinas and covered by PDIC. Every product on Truva shows whether it has PDIC protection. Digital banks use the same regulation as traditional banks and most use modern security like biometric login and real-time fraud checks.

**Q3. What is PDIC insurance?**
PDIC is a government agency that protects your bank deposits. If a covered bank closes, PDIC pays you back up to ₱1 million per depositor per bank. You do not need to sign up — coverage is automatic for every peso account the bank holds for you.

**Q4. What's the difference between a savings account and a time deposit?**
A savings account lets you take your money out anytime. A time deposit locks your money for a set period — like 3, 6, or 12 months — in exchange for a higher rate. If you cancel a time deposit early, you usually lose part of the interest.

**Q5. Why does a bank advertise a high rate like 15% when I might only see 3%?**
Many high rates come with conditions. For example, Maya's headline rate needs monthly "missions" — paying with their QR, paying bills, buying load. Without the conditions, you earn the base rate. The conditions for each product are shown right next to the rate above.

**Q6. What happens if a promo rate expires?**
When a promo ends, your money drops to the bank's regular rate. Truva shows the end date for every promo so you know what to expect. We do not surface promos that have already expired.

**Q7. Should I split my money across multiple banks?**
Many Filipino savers do. Each bank has a separate ₱1 million PDIC limit, so splitting bigger balances keeps everything fully protected. Different banks also pay better for different amounts and timelines, so you can use one for emergency money and another for longer-term saving.

**Q8. What if my bank closes — do I lose my money?**
For PDIC-covered banks, no. PDIC validates and pays out insured deposits up to ₱1 million per depositor, usually within a few months. Anything above ₱1 million in a single bank is not guaranteed, which is one reason savers spread larger amounts across banks.

**Q9. Does Truva hold or move my money?**
No. Truva is a comparison site, not a bank. Your money stays with the bank you choose. We never see your account, your balance, or your transactions. When you click Apply, you go straight to the bank's own site.

**Q10. What about the tax on interest earnings?** *(only tax FAQ — collapsed by default)*
Philippine banks deduct a 20% withholding tax from interest before it reaches your account. The rate shown on Truva is the rate the bank advertises. Your actual peso interest will be a bit lower after the bank's deduction, which the bank handles for you automatically.

### Section 5 — Below the FAQ

- *Last verified: {date}* — from `getLatestVerifiedDate()` + `formatVerifiedDate()`. Just the date, no link.

---

## Affiliate-tracking placements

- `banking_landing_recommendation_top` — the large "Best for you" Apply button
- `banking_landing_recommendation_alt` — the two alternate cards' Apply buttons
- `banking_landing_list` — every Apply button in Section 3

All go through `buildTrackedAffiliateHref(productId, placement)` → `/go/{slug}`.

---

## Voice & copy rules

- Grade 6–8. Short sentences. One idea per sentence.
- No exclamation marks. No Taglish. No "after-tax." No "yield." No "APR" without gloss.
- Filipino context: ₱ amounts, PDIC by name, providers by consumer-facing names.
- **Affiliate disclosure on every CTA** (CLAUDE.md rule #5). Two layers: (a) page-level microline under the form; (b) per-Apply micro-tag *"Affiliate link"* + `aria-describedby`.

---

## Technical plan

### Files to create or modify

| File | Change |
|---|---|
| `types/index.ts` | Add 3 new placement strings to `AFFILIATE_PLACEMENTS` const. |
| `utils/yieldEngine.ts` | Add `computeGrossEarnings(amount, product, months): number`. Mirror `computeReturn` tier logic but use `tier.grossRate` only. Never import `lib/tax.ts`. |
| `lib/savings-recommend.ts` *(new)* | Pure `recommend(rates, answers) → { top, alternates[], reasonLine }`. |
| `components/banking/SavingsFAQ.tsx` *(new)* | 10-item accordion + exports `FAQ_ITEMS` for JSON-LD. |
| `components/banking/SavingsLandingClient.tsx` *(new)* | Single client component: routing form + recommendation + partner list + "Save my settings" pill. |
| `app/banking/page.tsx` | Rewrite: strip ProductHubTemplate, BankPickCard grid, MMF preview. Keep `getPublicRates()`. Add `SavingsLandingClient` + `SavingsFAQ` + FAQPage JSON-LD. |
| `eslint.config.mjs` | Add `'.design-bundle-tmp/**'` to ignores. |

### Files NOT touched

- `lib/rates.ts`, `lib/tax.ts`, `data/rates.json`, `types/index.ts` (except AFFILIATE_PLACEMENTS)
- `components/RateSection.tsx`, `components/RateTable.tsx`, `components/banking/BankingRateDesk.tsx` — serve `/banking/rates`
- `components/banking/BankPickCard.tsx` — keep for other surfaces
- All `app/banking/articles`, `app/banking/reviews`, `app/banking/compare`, `app/banking/money-market-funds`, `app/methodology/*` routes

### Recommendation engine (`lib/savings-recommend.ts`)

`recommend(rates, { amount, horizon, liquidity }) → { top, alternates[], reasonLine }`

**Filter:** Exclude expired promos. If `flexible` → exclude `lockInDays > 0`. Exclude threshold products where amount is outside all tiers.

**Score:** `grossSimpleEarnings − lockInPenalty − conditionPenalty − promoPenalty`
- `lockInPenalty` = `max(0, lockInDays − horizonDays) × amount × 0.0001`
- `conditionPenalty` = `amount × 0.001` per non-`none` condition
- `promoPenalty` = `amount × 0.0005` if any condition has `expiresAt`

**Return:** `top` = highest score. `alternates` = next 2, excluding same `provider` as top. `reasonLine` generated from answers + top product properties.

**Empty case:** `{ top: null, alternates: [], reasonLine: "We don't have a perfect match right now. Browse all options below." }`

### Earnings math

```
gross_rate_for_amount = pickGrossRate(product, amount)   // tier-aware, gross only
years = months / 12
gross_earnings = amount × gross_rate_for_amount × years
```

No compounding, no tax deduction, no time-value tweaks. Matches advertised rate expectations.

### State & URL

- Params: `?amount`, `?horizon`, `?liquidity`
- Defaults: `amount=100000`, `horizon=year`, `liquidity=flexible`
- Writes via `useRouter().replace` (no scroll, no history spam)
- SSR hydrates with defaults — recommendation visible on first paint

### Reused utilities

- `getPublicRates()` from `lib/rates.ts:677`
- `getLatestVerifiedDate()` + `formatVerifiedDate()` from `lib/rates.ts:681–693`
- `computeEffectiveGrossRate()` from `utils/yieldEngine.ts:139–171` (tie-break sort)
- `buildTrackedAffiliateHref()`, `trackAffiliateImpression()` from `lib/affiliate-analytics.ts`
- `/go/[slug]` route (unchanged) for redirect + click logging

### Edge cases

- **Empty rates list**: show "Rates are being refreshed. Try again in a few minutes."
- **Threshold outside user range**: row muted, not hidden.
- **Expired promo**: row hidden.
- **Amount < 1,000**: clamp to 1,000, show inline hint.
- **Lock-in > horizon**: hidden by default, toggle to restore (dimmed + highlighted lock-in cell).
- **Empty conditions after sanitizer**: fall back to generic line keyed off `condition.type`; `none` → em-dash.

---

## Verification

1. `npm run dev` → load `/banking` at 375px and desktop. Routing form is first visible element.
2. Walk all 3 questions. Recommendation appears with non-empty `reasonLine`. URL reflects `?amount=&horizon=&liquidity=`. Change each answer → recommendation and URL update.
3. Amounts `50,000` / `250,000` / `1,000,000` — list reorders. Threshold products outside range render muted, never as top recommendation.
4. Toggle horizons — earnings scale. `liquidity=flexible` hides time deposits (restores with toggle).
5. HTML-search for `tax`, `after-tax`, `withholding`, `FWT`, `net of tax`. Only allowed inside FAQ Q10 collapsed answer.
6. `grep -r "calcAfterTaxPhp\|calcAfterTaxDollarTD\|calcTaxExempt\|lib/tax\|computeReturn(\|computeEffectiveRate(" app/banking/page.tsx components/banking/SavingsLandingClient.tsx lib/savings-recommend.ts components/banking/SavingsFAQ.tsx` — zero hits.
7. `npx tsc --noEmit` — passes.
8. `npm run lint` — passes.
9. Lighthouse mobile on `/banking` — performance ≥85, accessibility ≥95.
10. Click Apply on top recommendation, alternate, list row → 3 rows in Supabase `affiliate_clicks` with correct placements.
11. DevTools Network → `POST /api/affiliate-impressions` fires once per product×placement per page-view.
12. Every Apply button has `rel="sponsored noopener noreferrer"`, `aria-describedby`, visible *"Affiliate link"* micro-tag.
13. FAQ accordions are keyboard navigable, focus-visible. `<script type="application/ld+json">` block with `@type: "FAQPage"` present.
14. `/banking/rates`, `/calculator`, `/banking/money-market-funds`, `/banking/articles`, `/banking/reviews`, `/banking/compare` still render unchanged.
15. "Save my settings" pill: save → check localStorage. New tab → form pre-fills. "Start fresh" → localStorage cleared. TTL >30 days → ignored.
16. Smoke test on real phone at 375px and 360px.

---

## PMF measurement

**PMF hypothesis:** *"Filipino savers who land on /banking with high intent prefer a guided recommendation to a sortable list."*
**Win condition (v1):** top-recommendation CTR ≥ 1.5× the average list-row CTR over the first 1,000 page-views.

**Events to track:**
1. `landing_view`
2. `form_started` (first input touch, fires once per page-view)
3. `form_completed` (all 3 non-default)
4. `recommendation_view` (top card in viewport)
5. `recommendation_apply_click` (distinguish top vs. alt via placement)
6. `list_scrolled`
7. `list_apply_click`
8. `faq_opened` (capture `question_id`)
9. `skip_to_list_click`

**KPIs:**
- `form_completed / landing_view`
- `recommendation_apply_click / recommendation_view`
- `(recommendation_apply_click + list_apply_click) / landing_view`
- `recommendation_apply_click / list_apply_click` ratio (the PMF question)
- `faq_opened` distribution

---

## Out of scope (deliberate)

- Refresh of `/banking/rates` (full desk) — keeps after-tax math; separate ticket.
- Refresh of `/calculator` — still exists for direct visitors.
- New copy for `/banking/articles`, `/banking/reviews`, `/banking/compare`.
- MMF page redesign.
- Methodology page rewrites.
- Any change to `lib/tax.ts`.
- Changes to data ingestion / rates.json schema.

## Risk notes

- **Voice conflict in TRUVA_MASTER.md**: "after-tax first" methodology language exists but CLAUDE.md rule #3 is binding for product UI. /banking copy follows CLAUDE.md.
- **Sort stability**: ties broken by `headlineRate` desc, then `lastVerified` desc.
- **Threshold products** will rank below headline rate for large amounts — this is correct behavior.
