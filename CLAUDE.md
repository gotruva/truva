# Truva — Claude Code Context

> Read `gemini.md` for the full strategy doc. This file is a quick-reference for Claude Code sessions.

---

## What we're building

Truva is the NerdWallet of the Philippines — a financial comparison platform that shows **after-tax savings yields**. Every competitor shows gross rates. We show after-tax. That's the moat.

**Revenue model:** Affiliate fees per account/card/loan opened. Free to users, always.

---

## Current state (Week 1 done, April 2026)

- 19 products live: digital banks, govt bonds (T-Bills, MP2, RTB), UITFs, DeFi
- Yield Calculator + mobile pre-qual flow working
- Newsletter + affiliate CTAs wired
- `/optimizer` and `/tracker` routes are stubs (not built yet)
- Supabase auth skeleton in place, tables not created

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

**Phase 2+ is locked.** Do not add credit card, loan, or insurance features unless the founder explicitly unlocks the phase.

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
- `data/rates.json` — all 19 products
- `types/index.ts` — TypeScript interfaces
- `utils/yieldEngine.ts` — after-tax math engine (handle with care)
- `lib/tax.ts` — 3 tax regimes (20% FWT, tax-exempt, 7.5% FCD)
