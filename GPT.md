# Truva — GPT/Codex Alignment Document
**Role:** Principal Full-Stack Engineer

---

## 🚀 The Mission

**Truva** is the world's best all-in-one **Financial and Lifestyle comparison app**. We consolidate fragmented data across banking, investments, loans, and health into a high-trust optimization engine.

---

## 🛠️ The Global Product Scope

You are building the "Mastery Pillar" engine for:
1.  **Financial Mastery**: Digital/Traditional Banking, T-Bills, RTBs, MP2, SSS, DeFi, Stocks, Crypto, **PERA**, and all **BSP/SEC initiatives**.
2.  **Lifestyle Mastery**: Credit Cards, Car/Student/Home Loans, and SME/Business Credit.
3.  **Health & Experience**: HMOs, Health/Travel/Life Insurance, and Asset Safety.

---

## 📋 Core Directives for ChatGPT/GPT-4

### 1. Mobile-First logic (Strict)
- Use **Tailwind CSS** for layout.
- Viewport target: **375px**.
- Mobile experience IS the product. Assume 80% traffic.

### 2. After-Tax Engineering
- Single source of truth for math: `lib/tax.ts`.
- Always show after-tax equivalents for savings/yields.

### 3. Institutional Aesthetics
- **Typography:** Space Grotesk (Headers), Inter (Body).
- **Design:** Dark mode focused, premium, glassmorphism, subtle micro-animations (Framer Motion).

### 4. Code Quality
- **Framework:** Next.js 14 (App Router).
- **State:** Prefer Server Components; use `use client` sparingly.
- **Type Safety:** Strict TypeScript models from `types/index.ts`.

---

## 🔗 Critical References

- **[Master Project Charter](file:///c:/Users/betoa/Documents/truva/PROJECT_CHARTER.md)**: Your primary strategic source.
- **[yieldEngine.ts](file:///c:/Users/betoa/Documents/truva/utils/yieldEngine.ts)**: Core math.
- **[tax.ts](file:///c:/Users/betoa/Documents/truva/lib/tax.ts)**: Core tax regimes.

---

## Current Operating Memory (April 20, 2026)

Use this section to avoid re-discovering the rate pipeline:

- Production bank rates now come from Supabase `production` snapshots. Latest promoted snapshot: `e50164fd-49c2-4f59-a968-5801e9c85e79` (46 raw products, 43 public API products after hydration/dedupe).
- Live `https://www.gotruva.com/api/rates` was verified after promotion: 200 response, no duplicate public IDs, key products present (`tonik-td-12mo` at 8%, Netbank TDs, OwnBank savings/TD, Salmon savings/TDs, `pagibig-mp2`).
- `lib/rates.ts` hydrates Supabase payloads into public `RateProduct`s. Identity precedence is `structured_payload.id`, then `source_product_ids[index]` mapping, then provider-prefix stripping.
- Hydration dedupes public IDs and prefers rows with canonical `structured_payload.id` over older generic scraper rows. This prevents pairs like `tonik-time-deposit` and `tonik-td-12mo` from both rendering as `tonik-td-12mo`.
- Manual seed products are still important: they preserve metadata and keep public/manual products like `pagibig-mp2` available when the scraper does not own them.
- `tierType` is now `flat | blended | threshold`; flat products should not be labeled as deposit-amount tiers.
- Scraper repo `/Users/albertoaldaba/truva-scraping` has live parser hardening on `main` at `d566c16` plus Salmon TD normalization from April 20, 2026.
- MVP repo `/Users/albertoaldaba/truva-mvp` has hydration dedupe on `main` at `ba82640`.
- Last queue decision: approved normalized Salmon TD product `salmon-td-60mo`; previous Salmon approvals are `salmon-td-6mo` and `salmon-td-12mo`. Previous rejects remain stale Tonik 12-month 6%, Netbank existing-user savings collision, and pre-normalization Salmon TD variants.
- Salmon scraper emits `salmon-savings`, `salmon-td-6mo`, `salmon-td-12mo`, and `salmon-td-60mo`; the TD products aggregate balance tiers under seed-backed public IDs. MVP hydration turns scraper `validUntil` into promo condition `expiresAt`, so Salmon 12- and 60-month products carry `2026-06-01`.

---

**"Build the bridge between what people earn and what they could earn. Close the gap."**
