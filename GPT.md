# Truva — GPT/Codex Alignment Document

> **Marketing System Role — ChatGPT/DALL·E = "Graphic Designer" (Stage S3).** For any marketing/content task, read `MARKETING_SYSTEM_AI_GUIDE.md` first. Your job: generate abstract **light-mode** background graphics from the `FACT_PACK` visual spec → `VISUAL_PACK`. Light/white-first brand colors, abstract only. Never bake legible numbers into the image (they're overlaid in Canva), never render real faces/hands or flying coins, never draw anything resembling a real bank's actual card design (trademark). Hand off `VISUAL_PACK` → Founder gate (S4).

> **Read `TRUVA_MASTER.md` first.** That is the single source of truth for vision, brand, roadmap, personas, voice rules, and tech anchors. This file is a short session reference only.
> Last updated: May 4, 2026

---

## Non-Negotiable Rules (Quick Reference)

1. **Mobile-first — 375px base.** No horizontal scroll on mobile. Ever.
2. **Plain language always.** Grade 6–8 reading level. No jargon without an immediate plain-English explanation.
3. **No after-tax calculations shown to users.** Show rates exactly as banks and companies advertise them. `lib/tax.ts` and after-tax logic in `yieldEngine.ts` must NOT be called by user-facing components.
4. **No fund custody — ever.** Truva compares. It never holds or moves money.
5. **Affiliate disclosure on every CTA.** Non-negotiable.

---

## Key Files

| File | Purpose |
|---|---|
| `TRUVA_MASTER.md` | Full strategy, brand, roadmap, personas, voice rules — read this |
| `types/index.ts` | TypeScript interfaces for all data models |
| `lib/rates.ts` | Supabase → public `RateProduct[]` hydration |
| `data/rates.json` | Manual/seed catalog (metadata fallback, non-scraper products) |
| `utils/yieldEngine.ts` | Rate calculation logic (do not surface after-tax outputs in UI) |
| `docs/webweaver-credit-card-data-contract.md` | WebWeaver credit-card bridge, promo tables, and live schema caveats |

---

## Credit Card Data Bridge

Credit-card pages should read through the public bridge, not raw WebWeaver rows:
`web_weaver.credit_cards -> public.credit_card_listings -> public.truva_credit_cards -> lib/credit-cards.ts`.

Before touching this flow, read `docs/webweaver-credit-card-data-contract.md`.
Watch especially for mixed `interest_rate_monthly` storage, non-snake-case
`normalized_card_key` values, temporary readiness overrides, and incomplete
promo-to-card targets.

---

## Current Phase

- **Phase 1** ✅ Live — Savings, Bonds, DeFi, Govt products
- **Phase 2** 🔨 Active — Credit Cards
- **Phase 3** 🔜 Next — Insurance (Travel → Health → Auto → Life)
- **Phase 4** Future — Loans

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Typography:** Space Grotesk (headers), Inter (body)
- **State:** Prefer Server Components; `use client` only when needed
- **Type Safety:** Strict TypeScript — models in `types/index.ts`
- **Database:** Supabase (auth + rate snapshots)
- **Deploy:** Vercel

---

## Rate Pipeline Quick Facts

- Scraper repo: `/Users/albertoaldaba/truva-scraping`
- MVP repo: `/Users/albertoaldaba/truva-mvp`
- Production snapshot: `526fd854-1678-428c-b029-369285baf674` (67 raw → 57 public products after dedupe)
- Dynamic pages: `/`, `/banking/rates`, `/calculator`, `/api/rates`
- `pagibig-mp2` present in API/home/calculator; intentionally absent from `/banking/rates`
- `RateProduct.tierType`: `flat | blended | threshold` — threshold products only qualify deposits inside the tier range
- Hydration dedupes public IDs; canonical `structured_payload.id` beats older generic scraper rows
