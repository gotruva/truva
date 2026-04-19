# Truva — AI Alignment Document
> For any AI model (Claude, Gemini, GPT, etc.) continuing work on this codebase.
> Last updated: 2026-04-20

---

## What is Truva?

**Truva** is the world's best all-in-one financial and lifestyle comparison app. It helps Filipinos (and eventually the world) master their most important life decisions—from finding the best after-tax savings yields to choosing the right health insurance (HMOs), car loans, student loans, and PERA (Personal Equity & Retirement Account).

**The north star:** Consolidating siloed financial and lifestyle data into a single optimization engine. We solve the friction of comparison for things that matter most: your wealth, your health, and your mobility.

**The business model:** Free for users, forever. Revenue comes from affiliate fees and partnerships—not subscriptions, not paywalls.

**The user:** Mobile-first, lifestyle-conscious savers. 80%+ of traffic is mobile. The mobile experience IS the product.

---

## Current Build State (April 20, 2026)

### Live and working
- Rate comparison table (desktop) + card layout (mobile, 375px)
- Public rate catalog now hydrates from Supabase snapshots in production, with `data/rates.json` as manual/metadata seed fallback.
- Latest production snapshot: `e50164fd-49c2-4f59-a968-5801e9c85e79`, promoted April 20, 2026.
- Live API shape after hydration: 43 public products, no duplicate public IDs. Raw Supabase snapshot has 46 products across 17 providers.
- Verified public pages: `/api/rates`, `/`, `/banking/rates`, and `/calculator` all read the current production snapshot. `pagibig-mp2` remains present in API/home/calculator and absent from bank-only rates by design.
- Bank products now include canonical scraper-fed term products for Maya, Tonik, Netbank, OwnBank, Komo, DiskarTech, BanKo, plus manual/seed metadata fallbacks.
- Personal Yield Calculator — dual scenarios (best case vs base case), tiered rates, bar chart
- Mobile pre-qual flow (3-step: amount → lock-in → risk tolerance)
- Newsletter signup (Resend integration, rate-limited)
- Affiliate CTAs with disclosure on every product
- Dark mode, GA4, SEO structured data, security headers
- Supabase auth skeleton (middleware in place, tables not yet created)

### Stubbed / placeholder (routes exist, not built)
- `/optimizer` — PDIC Smart Split Optimizer
- `/tracker` — TD Tracker + maturity alerts

---

## The 8-Week Sprint (Current Sprint, April 2026)

| Week | Goal | Status |
|---|---|---|
| 1 | Rate table + calculator + newsletter + affiliate links + all current categories | ✅ Done |
| 2 | Yield calculator refinements, Supabase auth flows, email capture for features | ⬜ |
| 3 | Rate data verification + automation prep, Supabase tables | ⬜ |
| 4 | PDIC Smart Split Optimizer (`/optimizer`) | ⬜ |
| 5 | Expand: Dollar TDs, cooperatives (top 10), SSS PESO Fund | ⬜ |
| 6 | TD Tracker + maturity alerts via Resend (`/tracker`) | ⬜ |
| 7–8 | Palago Score composite rating, Top 3 default view, Lighthouse ≥90, bank outreach | ⬜ |

**Do not build anything outside this 8-week scope** unless the founder explicitly instructs it.

---

## The Phased Expansion Roadmap (Post-Sprint)

This is the NerdWallet arc. Each phase unlocks ONLY when the previous phase's gate conditions are met.

### Phase 1 — Now → Month 5: Financial Mastery (Yields)
**What:** Digital banks, govt bonds, UITFs, DeFi, cooperatives, dollar TDs, **PERA**, PH Crypto Exchanges, and all **BSP/SEC initiatives**.
**CPA:** ₱50–300/account
**Goal:** Build the audience (3,000+ newsletter subs), establish SEO authority on after-tax rates, secure 2+ formal bank/exchange partnerships.

### Phase 2 — Month 6+: Credit Cards
**What:** Credit card comparison (rewards, cashback, travel, no-fee)
**CPA:** ₱500–2,000+ per approved card (10–20× savings CPA)
**Why it comes second:** Same audience, natural upsell. Moneymax's primary revenue — Truva's edge is the trust built in Phase 1.
**HARD GATE — Phase 2 is locked until ALL three conditions are met:**
1. 3,000+ newsletter subscribers
2. Consistent affiliate revenue from savings vertical
3. At least 2 formal bank partnerships negotiated

If any condition isn't met by Month 6, Phase 2 is deferred. No partial credit card features in the 8-week sprint.

### Phase 3 — Year 2: Loans & SME Credit (Lifestyle Mastery)
**What:** Personal loans, Car loans, Student loans, Home loans, and **SME/Business Credit**.
**CPA:** ₱1,000–10,000+ per funded loan.
**Why:** These are high-ticket "enablement" products that intersect finance with life ambitions.

### Phase 4 — Year 2+: Investing
**What:** UITFs (expanded), Stocks, VUL comparisons, Broker comparison.
**CPA:** High traffic volume, strategic depth.

### Phase 5 — Year 3+: Health & Experience (Essential Mastery)
**What:** Life insurance, Health insurance, **Travel Insurance**, HMOs (Maxicare, Etiqa, etc.), and Non-life insurance.
**CPA:** Highest lifetime value (LTV).
**⚠️ WARNING:** Requires full team and Insurance Commission (IC) licensing.

---

## What Is Explicitly NOT Being Built (Ever, Unless Instructed)

- Native iOS/Android app (PWA first)
- Stock tracker or real-time market data
- Custom auth server (Supabase handles it)
- Payment infrastructure or subscription billing
- AI chatbot or persistent AI conversation
- Real-time websocket rate feeds (daily updates are sufficient)
- Any feature requiring holding, transferring, or custody of user funds
- GSIS (government employee pension savings) — deferred indefinitely
- Credit cooperatives in Month 1 (deferred to Week 5+)

---

## Key Technical Rules

1. **After-tax always:** Never display a rate without showing the after-tax equivalent. `taxExempt ? grossRate : grossRate * 0.80` (or `* 0.925` for dollar TDs).
2. **Mobile first:** Every UI change must work at 375px with no horizontal scroll. Desktop is an enhancement, not the base.
3. **No heavy dependencies:** Keep the bundle lean. No new chart libraries, animation libraries, or UI kits without founder approval.
4. **No scope creep:** If a task is not in the current sprint, don't build it. Document it for the next phase instead.
5. **Performance target:** Lighthouse ≥90 on mobile. Don't push server data to `useEffect` without reason.
6. **Affiliate disclosure:** Every CTA must include the disclosure tooltip. Non-negotiable for trust and legal reasons.

---

## Key Files to Read First

| File | Why |
|---|---|
| `truva-antigravity-briefing.md` | Full product spec, design constraints, what NOT to build |
| `gemini.md` (this file) | Strategic roadmap and AI alignment |
| `data/rates.json` | Current product data (19 products) |
| `types/index.ts` | TypeScript interfaces for all data models |
| `utils/yieldEngine.ts` | Core after-tax math — do not break this |
| `lib/tax.ts` | Three tax regimes: 20% FWT, tax-exempt, 7.5% FCD |
| `🗓️ Truva 8-Week Sprint Plan*.md` | Current sprint task breakdown |
| `⚠️ Revenue Blockers & Risk Register*.md` | Risks to avoid and mitigation strategies |

---

## Rate Data Maintenance Notes

| Product | Update Frequency | Source |
|---|---|---|
| Digital bank savings | Weekly (when banks change) | Bank marketing pages |
| T-Bills (91/182/364-day) | Weekly | treasury.gov.ph auction results |
| RTBs | Per issuance | BTr announcement |
| Pag-IBIG MP2 | Annually (Jan–Feb) | pagibigfund.gov.ph |
| UITF yields | Weekly | Fund provider NAVPS |
| Aave V3 USDC | Auto (5-min ISR) | DefiLlama API |
| Landbank / DBP / OFBank | Monthly | Bank websites |

### Supabase and scraper pipeline notes

- MVP repo: `/Users/albertoaldaba/truva-mvp`.
- Scraper repo: `/Users/albertoaldaba/truva-scraping`.
- Scraper `main` includes live parser hardening commit `d566c16` for Tonik calculator terms, Netbank mobile rates, OwnBank live headline fallback, DiskarTech FAQ, Salmon live FAQ/compound-rate parsing, and Salmon TD normalization from April 20, 2026.
- MVP `main` includes hydration dedupe commit `ba82640`.
- `lib/rates.ts` identity precedence: `structured_payload.id`, then `source_product_ids[index]` mapper, then provider-prefix stripping.
- Hydration dedupes by public product ID and prefers canonical `structured_payload.id` rows over old generic rows.
- `RateProduct.tierType` is `flat | blended | threshold`. Flat products must render as flat rate, not amount-tiered rate.
- Latest review pass approved normalized Salmon TD product `salmon-td-60mo`; previous normalized Salmon approvals are `salmon-td-6mo` and `salmon-td-12mo`. Previous rejects remain stale duplicate Tonik 12-month at 6%, Netbank existing-user savings collision, and pre-normalization Salmon TD variants.
- Salmon scraper emits `salmon-td-6mo`, `salmon-td-12mo`, and `salmon-td-60mo` with aggregated tiers under existing seed-backed public IDs. MVP hydration preserves scraper `validUntil` as promo condition `expiresAt`; Salmon 12- and 60-month products use `2026-06-01`.

---

## The One Thing That Matters

> "The gap between what Filipinos are earning and what they could earn is the business."

Every feature should help close that gap. If it doesn't, it's out of scope.
