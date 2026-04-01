# Truva — AI Alignment Document
> For any AI model (Claude, Gemini, GPT, etc.) continuing work on this codebase.
> Last updated: 2026-04-01

---

## What is Truva?

**Truva** is the Philippines' financial comparison platform — the NerdWallet of the PH. It helps Filipinos find the best after-tax savings yields across digital banks, government bonds, UITFs, and DeFi.

**The north star:** Most Filipinos are earning less on their savings than they could. Every competitor shows gross rates. Truva shows after-tax rates with a personal yield calculator. That's the product.

**The business model:** Free to users, forever. Revenue comes from affiliate fees (₱50–₱10,000+ per account/loan/card opened via Truva) — not subscriptions, not paywalls.

**The user:** Mobile-first Filipino retail saver. 80%+ of traffic is mobile. The mobile experience IS the product.

---

## Current Build State (Week 1 Complete)

### Live and working
- Rate comparison table (desktop) + card layout (mobile, 375px)
- 19 products across 4 active categories:
  - **Banks (12):** Maya, Tonik, UNO, GoTyme, CIMB/GSave, MariBank, UnionDigital, OwnBank, Landbank, DBP, OFBank
  - **Govt (5):** T-Bill 91-day, T-Bill 182-day, T-Bill 364-day, Pag-IBIG MP2, RTB Series 27
  - **UITFs (2):** BDO Peso MMF, BPI Money Market Fund
  - **DeFi (1):** Aave V3 USDC Base (live DefiLlama feed)
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

### Phase 1 — Now → Month 5: Savings + DeFi Yields
**What:** Digital banks, government bonds, UITFs, DeFi, cooperatives, dollar TDs
**CPA:** ₱50–300/account
**Goal:** Build the audience (3,000+ newsletter subs), establish SEO authority on after-tax rates, secure 2+ formal bank partnerships.

### Phase 2 — Month 6+: Credit Cards
**What:** Credit card comparison (rewards, cashback, travel, no-fee)
**CPA:** ₱500–2,000+ per approved card (10–20× savings CPA)
**Why it comes second:** Same audience, natural upsell. Moneymax's primary revenue — Truva's edge is the trust built in Phase 1.
**HARD GATE — Phase 2 is locked until ALL three conditions are met:**
1. 3,000+ newsletter subscribers
2. Consistent affiliate revenue from savings vertical
3. At least 2 formal bank partnerships negotiated

If any condition isn't met by Month 6, Phase 2 is deferred. No partial credit card features in the 8-week sprint.

### Phase 3 — Year 2: Personal Loans + Home Loans
**What:** Loan comparison (personal, home, auto, SME)
**CPA:** ₱500–10,000+ per funded loan
**Why it waits:** Needs SEO domain authority and bank relationship credibility first.

### Phase 4 — Year 2+: Investing
**What:** UITFs (expanded), stocks, VUL comparisons, broker comparison
**CPA:** Lower per unit, but high traffic volume
**Note:** GInvest and Investagrams have partial coverage — Truva's edge is integrated after-tax comparison.

### Phase 5 — Year 3+: Insurance
**What:** Life, health, non-life insurance comparison
**CPA:** Highest of all verticals
**⚠️ WARNING:** Moneymax's stronghold. Do NOT enter without: a full team, Insurance Commission broker license, and operating capital. This is not a solo-founder vertical at MVP.

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

---

## The One Thing That Matters

> "The gap between what Filipinos are earning and what they could earn is the business."

Every feature should help close that gap. If it doesn't, it's out of scope.
