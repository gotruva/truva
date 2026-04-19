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
- Latest production snapshot: `732a7711-8192-4ca7-8a11-f1c59db5b032`, promoted April 20, 2026. It contains 43 raw snapshot products and hydrates to 40 public API products after canonical-ID dedupe.
- Live validation passed for `https://www.gotruva.com/api/rates`, `/`, `/banking/rates`, and `/calculator`. API has no duplicate public product IDs. `pagibig-mp2` remains present in API/home/calculator; it is intentionally absent from the bank-only `/banking/rates` page.
- Supabase hydration in `lib/rates.ts` prefers `structured_payload.id`, then `source_product_ids[index]` mapping, then provider-prefix stripping. It dedupes hydrated public IDs and prefers canonical structured IDs over older generic scraper rows.
- `RateProduct.tierType` supports `flat | blended | threshold`; `flat` products use single-tier flat-rate math and labels.
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
- Approved in the last review pass: canonical/seed-backed Maya TD terms, Tonik TD terms, Salmon savings, Netbank new-user savings and TDs, OwnBank savings/TD, Komo, DiskarTech, and BanKo.
- Rejected intentionally in the last production pass: stale duplicate Tonik 12-month at 6%, Netbank existing-user savings because it collides with public `netbank-savings`, and pre-normalization Salmon TD variants.
- Salmon parser now emits seed-backed public products `salmon-td-6mo` and `salmon-td-12mo` with aggregated tiers. Next data-engineering step is a Supabase-enabled Salmon-only extract/review/publish pass; optionally add explicit public products if supporting 60-month terms.

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
