# Credit Card Batch Log

Running log of card-listing batches and accuracy audits. This replaces the
`Truva_status` column in `web_weaver.credit_card_scrape_list`, which Truva
agents cannot update (web_weaver is read-only for us).

How listing works since 2026-06-10: insert a row in
`public.credit_card_overrides` with `listed = true`. Field corrections are
nullable columns on the same row (NULL = use the raw web_weaver value). See
`supabase/migrations/20260610090000_credit_card_overrides_table.sql` and
`docs/webweaver-credit-card-data-contract.md`.

## 2026-06-10 — Overrides refactor + live-card audit + Stage 2L UnionBank

**Overrides refactor (Phase A).** Replaced the hardcoded allowlist and
per-card CASE corrections inside `public.credit_card_listings` with the
`public.credit_card_overrides` table. Seeding was diff-based against the old
view's output; verified with per-row md5 hashes — all 62 live rows
byte-identical before and after.

**Live-card audit (Phase B).** Checked the 5 cards with missing fields:

| Card | Field | Outcome |
|---|---|---|
| chinabank_prime_mastercard | min income | Not a gap — published as annual (PHP 250k/yr); app derives monthly |
| chinabank_platinum_mastercard | min income | Same as above |
| bdo_secured_credit_card | min income | Not a gap — deposit-secured card, no income requirement by design |
| bdo_world_elite_mastercard | min income | Premium/relationship tier; BDO publishes no figure. NULL intentional |
| bdo_blue_from_american_express | recurring fee | ⚠️ OPEN — BDO lists monthly-fee mechanics (waived at PHP 15k monthly spend); bdo.com.ph blocks automated fetch. Needs a manual browser check |

**Stage 2L — UnionBank of the Philippines (19 cards listed).** Catalog went
from 62 to 81 live cards. Verification method: WebWeaver captures of official
unionbankph.com pages (scraped 2026-06-03 to 06-09, content-hashed) plus an
internal consistency audit (income text ↔ numeric, fee sanity, FX rates).
unionbankph.com returns 403 to plain fetchers, so no independent re-fetch this
session.

Cards: U Platinum Mastercard, U Visa Platinum, Rewards Platinum (MC + Visa),
Cash Back (Titanium MC + Visa Platinum), Miles+ (Visa Signature + World MC),
Lazada, PlayEveryday, Shell Power, S&R, Mercury, Go Rewards (Gold + Platinum),
Cebu Pacific (Gold + Platinum), Reserve (Visa Infinite + World Elite MC —
invite-only, listed under the RCBC Black precedent).

Open flags:
- `unionbank_mercury_visa` — recurring fee not captured (first year 0, NAFFL
  via PHP 20k spend in 60 days). Manual check of unionbankph.com/node/5119.
- `unionbank_s_and_r_visa_platinum` — income unpublished on product page; the
  finder shows the cannot-confirm verdict, which is the honest behavior.
- Go Rewards ×2 + Shell Power — UnionBank publishes dual income thresholds
  (PHP 180k/yr existing cardholders vs PHP 250k/yr new-to-bank); stored
  monthly figure reflects the lower published bound, noted in overrides.

App glue shipped with this batch: `BANK_LOGO_MAP` entry +
`/logos/unionbank-mark.png` (Wikimedia Commons official logo),
`BANK_PROMO_TC_URL` entry. No visual-manifest entries yet — UnionBank cards
render the Truva branded fallback until card art is curated.

QA: 81 cards on `/credit-cards/all`; finder top match for a no-fee PHP 15–30k
profile is U Platinum Mastercard (correct); detail page renders with
affiliate disclosure and official apply URL; zero horizontal overflow at
375px; production build green.

## Remaining queue (raw cards not yet listed)

Security Bank (7) → PNB (13, logo exists) → Maybank (8, needs logo) → RCBC
(~16) → Metrobank (~10) → BDO (~5) → EastWest (~7) → Chinabank (~4) → BPI
(~2) → HSBC (~2) → small issuers (Equicom, Landbank, Home Credit, Maya,
Robinsons — Robinsons Bank merged into BPI, verify before listing).
