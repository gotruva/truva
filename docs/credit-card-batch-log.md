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

## 2026-06-10 — Stages 2M/2N/2O: Security Bank, PNB, Maybank (26 listed, 2 held)

Catalog: 81 → 107 live cards. Verification method as in Stage 2L (WebWeaver
official-page captures of Jun 3–9 + consistency audit; all three bank sites
403 plain fetchers).

**Stage 2M — Security Bank (7 listed, 8 total live).** Classic, Gold,
Platinum, World, Next (NAFFL; dual income threshold noted), Complete Cashback
Platinum (FLAG: FX fee not captured), Fast Track Secured (FLAG: fee/rewards
not captured — sparse row; income NULL correct, deposit-secured).

**Stage 2N — PNB (11 listed, 2 HELD).** Ze-Lo + Cart (NAFFL, PHP 10k/mo
income — now the finder's top picks for the 15–30k no-fee profile),
Essentials, Cashback Titanium, Diamond UnionPay, Platinum, PAL Mabuhay Miles
NOW/Platinum/World/World Elite (PHP 50k/yr fee, income unpublished), LSGH
Alumni (relationship_based affinity card).
⚠️ **HELD: pnb_visa_classic + pnb_visa_gold — their `source_url` points to
moneymax.ph (a competitor comparison site, not PNB).** Fee figures
unverifiable against an official page and the Apply CTA would link to a
competitor. Override rows exist with `listed = false`; relist only after
WebWeaver re-scrapes them from pnb.com.ph.

**Stage 2O — Maybank Philippines (8 listed).** Visa Classic/Gold/Platinum/
Infinite, Standard/Gold/Platinum Mastercard, Manchester United. All rows
clean (income text ↔ numeric consistent, usage-based waivers, FX 1.75–2.5%).
Bank-name variant "Maybank Philippines, Inc." canonicalized app-side.

App glue this round: PNB + Maybank logos and `BANK_LOGO_MAP` entries
(Maybank mark from Wikimedia), `BANK_NAME_CANONICAL` Maybank variant,
`BANK_PROMO_TC_URL` for Security Bank, PNB (URL confirmed via site search),
and Maybank.

Observation for later tuning: the finder's `<15` income band uses
bracketMin = 0, so even PHP 10k-requirement cards score as a near-miss for
below-15k users — conservative but means Ze-Lo/Cart don't surface for the
lowest band. Scoring design predates sub-15k-income cards existing.

QA: 107 cards on `/credit-cards/all`; no "Inc." variant leaks; finder
15–30k no-fee profile → PNB Cart top match with Ze-Lo + U Platinum
alternatives; 375px clean; production build green.

## 2026-06-10 — Trust audits: official sources + scoring neutrality

**Official-source audit (PASS).** All 107 live cards trace to 14 domains,
every one an issuer-owned property. The only non-official rows in the whole
164-card raw pool are the two held moneymax.ph PNB rows. Made durable with
`public.official_source_domains` (registry of issuer-owned domains) +
`public.credit_card_source_violations` (view that must always return zero
rows — check it before and after every batch; migration
`20260610150000_official_source_guard.sql`).

**Scoring-neutrality audit (one fix shipped).** Reviewed
`lib/creditCardFinder/rank.ts` end to end:
- Every scoring factor is user-need × published-card-fact (income fit,
  priority tag, spend category, avoid penalty, beginner bonus). No bank
  names in scoring, no affiliate weighting anywhere, penalties never
  disqualify, all live cards enter the candidate pool.
- The +0.05 confidence nudge is data-completeness/freshness based
  (bank-neutral, favors claims we can stand behind).
- Browse "best" sort is completeness → freshness → name; all browse sorts
  have deterministic tiebreaks. Neutral.
- **FIXED: finder tie-breaking was insertion-order dependent.** The DB fetch
  sorts `bank ASC`, so equal-scored cards systematically favored
  alphabetically-first banks. Ties now break on consumer-favoring published
  facts: lower yearly fee → lower income requirement → card key (pure
  determinism). `compareScoredCards` in rank.ts; regression tests added
  (61 passing).
- Display-label special cases for `bdo_secured` / `bdo_world_elite` in
  `deriveMinIncomeLabel` are factual, display-only (no score impact).

## Remaining queue (raw cards not yet listed)

RCBC (~16) → Metrobank (~10) → BDO (~5) → EastWest (~7) → Chinabank (~4) →
BPI (~2) → HSBC (~2) → small issuers (Equicom, Landbank, Home Credit, Maya,
Robinsons — Robinsons Bank merged into BPI, verify before listing) → relist
pnb_visa_classic/gold once re-scraped from pnb.com.ph.
