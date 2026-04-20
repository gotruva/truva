# Truva — Claude Code Context

> Read `gemini.md` for the full strategy doc. This file is a quick-reference for Claude Code sessions.

---

## What we're building

Truva is the world's best **all-in-one Financial and Lifestyle comparison app**. We consolidate siloed data across banking, investments (Stocks/Crypto/PERA), loans (Car, Student, SME), and health (HMOs, Insurance, Travel) into a single optimization platform, including all **BSP & SEC financial initiatives**.

**Core Differentiator:** After-tax yield engineering. Every competitor shows gross; we show reality.
**Revenue model:** Affiliate fees per account/card/loan/policy opened. Free to users, always.

---

## Current state (April 20, 2026)

- Public bank-rate source of truth is the approved Supabase `production` snapshot, not only `data/rates.json`.
- Latest production snapshot: `cd66e6b9-edf8-493d-889e-98085cba0f2e`, promoted April 20, 2026. It contains 57 raw snapshot products and hydrates to 47 public API products after canonical-ID dedupe.
- Live validation passed for `https://www.gotruva.com/api/rates`, `/`, `/banking/rates`, and `/calculator`. API has no duplicate public product IDs. `pagibig-mp2` remains present in API/home/calculator; it is intentionally absent from the bank-only `/banking/rates` page.
- Supabase hydration in `lib/rates.ts` prefers `structured_payload.id`, then `source_product_ids[index]` mapping, then provider-prefix stripping. It dedupes hydrated public IDs and prefers canonical structured IDs over older generic scraper rows.
- `RateProduct.tierType` supports `flat | blended | threshold`; `flat` products use single-tier flat-rate math and labels. Threshold calculations must only qualify a deposit when it falls inside the tier min/max range.
- Dynamic public surfaces: `/`, `/banking/rates`, `/calculator`, and `/api/rates` are forced dynamic for fresh rate reads.
- Yield Calculator + mobile pre-qual flow working.
- Newsletter + affiliate CTAs wired.
- `/optimizer` and `/tracker` routes are stubs (not built yet).
- Supabase auth skeleton in place, tables not fully productized.

### Bank-rate pipeline memory

- Scraper repo: `/Users/albertoaldaba/truva-scraping`.
- MVP repo: `/Users/albertoaldaba/truva-mvp`.
- Scraper `main` includes parser hardening commit `d566c16` for Tonik, Netbank, OwnBank, DiskarTech, and Salmon live-page drift, plus Salmon TD normalization from April 20, 2026.
- MVP `main` includes hydration dedupe commit `ba82640`.
- Admin Rate Catalog: Fixed category filtering mismatch between staging schema (`savings`, `time_deposit`) and UI (`digital_bank`).
- Category Normalization: Catalog now uses inclusive filtering to handle both granular and aggregate categories (`banks`, `govt`, `uitf`, `defi`, `credit-card`).
- Approved in the latest review pass: all official Salmon TD terms, OwnBank TD terms, and UNO #UNOearn term-specific products. UNO #UNOearn now publishes 4.75% for 12 months (`uno-td-365`) and 5.00% for 24 months (`uno-td-730`) from the official UNO time-deposit page; the old generic staging product `uno-digital-bank:uno-time-deposit` is disabled so #UNOboost's 5.50% rate cannot hydrate under #UNOearn.
- Rejected intentionally in the previous production pass: stale duplicate Tonik 12-month at 6%, Netbank existing-user savings because it collides with public `netbank-savings`, and pre-normalization Salmon TD variants.
- MVP hydration preserves scraper `validUntil` by attaching it to promo conditions; Salmon 12- and 60-month TDs carry `expiresAt: 2026-06-01`. Salmon canonical TDs now use the official effective/compounded rate table: at PHP 500,000, `salmon-td-60mo` uses 7.41% gross / 5.928% after tax. Legacy one-tier Salmon IDs map into canonical public IDs and should not render separately.
- Maya TD OCR cleanup on April 20, 2026: `/Users/albertoaldaba/truva-scraping` intentionally removed the broken hero-image OCR/vision source. Tesseract was unreliable on Maya's stylized coin graphic; the scraper keeps HTML extraction for the 6-month/max-rate signal, while 3-month and 12-month Maya TD terms stay seed/public-catalog plus manual-review items.

**Active sprint target:** 8-week build. See `🗓️ Truva 8-Week Sprint Plan*.md` for current tasks.

---

## Expansion roadmap (DO NOT build ahead of schedule)

| Phase | Timing | Category | Gate to unlock |
|---|---|---|---|
| 1 | Now → Month 5 | Savings, DeFi, govt bonds, UITFs, cooperatives | — |
| 2 | Month 6+ | **Credit cards** | 3k subs + affiliate revenue + 2 bank partnerships |
| 3 | Year 2 | Personal loans, home loans | SEO authority + bank relationships |
| 4 | Year 2+ | Investing (stocks, UITFs expanded) | Phase 3 complete |
| 5 | Year 3+ | Insurance | Full team + IC broker license + capital |

**Phase 2+ is locked.** Do not build credit card, loan, or insurance UI features ahead of schedule unless instructed.

---

## Non-negotiable rules

- **After-tax always:** `taxExempt ? grossRate : grossRate * 0.80` (dollar TDs: `* 0.925`)
- **Mobile first:** Everything works at 375px, no horizontal scroll
- **No scope creep:** If it's not in the current week's sprint tasks, don't build it
- **Affiliate disclosure on every CTA:** Required for trust and compliance
- **No fund custody features:** Ever. We compare, we don't hold money.

---

## Key files

- `gemini.md` — full strategy, roadmap, and AI alignment doc
- `truva-antigravity-briefing.md` — complete product spec and design constraints
- `data/rates.json` — manual/seed public catalog used as metadata fallback and for non-scraper products
- `types/index.ts` — TypeScript interfaces
- `utils/yieldEngine.ts` — after-tax math engine (handle with care)
- `lib/tax.ts` — 3 tax regimes (20% FWT, tax-exempt, 7.5% FCD)
