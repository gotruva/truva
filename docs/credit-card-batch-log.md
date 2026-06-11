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

## 2026-06-10 — Stage 2P: RCBC remainder (15 listed, 1 held)

Catalog: 107 → 122 live cards. All 16 rows official-sourced (rcbccredit.com);
source-violations view confirmed zero after listing.

Listed: AirAsia (Classic + Platinum), Classic/Gold/Platinum JCB, Flex Gold
Visa, Visa Platinum, World Mastercard (income published annually, app
derives monthly), Visa Infinite, UnionPay Diamond, YGC Rewards Plus, ZALORA,
Landmark Anson's (income unpublished — cannot-confirm verdict), Hexagon Club
Priority + Privilege (relationship-based NAFFL, income unpublished by
design).

⚠️ **HELD: rcbc_visa_infinite_dollar — USD-denominated card stored with
`annual_fee_currency = 'PHP'` and fee 120.** Listing it would show
"₱120/yr", factually wrong (it is USD 120). Needs the currency fixed
upstream AND multi-currency support in `deriveAnnualFeeLabel` (currently
hardcodes the peso sign). Override row exists with `listed = false`.

Data-quality flags for WebWeaver: `rewards_type = 'cashback_via_points'` on
ZALORA + Landmark Anson's is a nonstandard type — those cards currently earn
neither the cashback nor points finder tag (neutral but lossy; normalize the
type upstream).

## 2026-06-10 — Stages 2Q/2R: Metrobank + all remaining issuers (catalog sweep complete)

Catalog: 122 → 145 live cards. Source-violations view: zero. Every raw card
in `web_weaver.credit_cards` now has an explicit listed/held decision.

**Stage 2Q — Metrobank (1 listed, 9 HELD).** Listed Travel Platinum Visa
(current-domain product page, complete data). Held the rest on availability
evidence, not data gaps: M Lite + Vantage Visa are sourced from the
card-conversion-program article (retired-card signal); Vantage Mastercard
from a 2019 launch news article; Femme ×2, NCCC, ON Virtual, Robinsons,
PSBank exist only on the legacy metrobankcard.com domain and are absent from
the current metrobank.com.ph lineup — they appear in promo-eligibility lists
(existing cardholders) but new-application availability is unconfirmed.

**Stage 2R — remaining issuers (22 listed, 7 held).**
- BPI: eCredit (companion virtual card). HELD Corporate Card (business scope).
- BDO: Bench, HOPE, ShopMore. HELD Amex Gold (availability = discontinued)
  and Amex The Platinum Card (fee 750 likely USD stored as PHP — same
  currency bug class as the RCBC Dollar card).
- Chinabank: World Mastercard, Landers Executive (membership-gated NAFFL,
  S&R precedent). HELD Wealth World Elite (near-empty row) and Velvet
  (no fee captured).
- EastWest: foodpanda, JCB Gold/Platinum, KrisFlyer Platinum/World,
  Dolce Vita, Priority Visa Infinite (relationship NAFFL).
- HSBC: Red Platinum, Premier (relationship card).
- LANDBANK: Classic + Gold (150k/yr income — lowest entry tier with PNB).
- Maya Bank: Maya Black, Landers Cashback Everywhere (NAFFL).
- Home Credit: Aling Puring, Home Credit Card. HELD Red Puregold
  (source_url points at the wrong product page).
- HELD Robinsons Cashback (Robinsons Bank merged into BPI 2023; issuing
  entity + application availability unconfirmed).

Glue: 9 new bank-name canonicalizations (EastWest/LANDBANK/HSBC ×2/
Chinabank/Maya/Home Credit ×2/Metrobank long-form), Landbank + Maya logo
map entries, homecredit.ph + landbank.com + mayabank.ph added to the
official-source registry. Home Credit + Equicom render the default bank
mark (logo assets TODO).

QA: 145 on browse, zero variant leaks, 375px clean, build green.

## 2026-06-10/11 — Card-art run: 23 new clean card images (62 → 85 assets)

Every harvested image was visually audited before shipping; wrong art was
deleted rather than published.

**UnionBank (18 of 19).** Per-product pages only expose a shared hero (the
generic scraper literally grabbed the floating Help button — caught by the
duplicate-hash guard + visual audit). Built a dedicated hub-page harvester
(`scripts/harvest-unionbank-images.py`): the credit-cards hub renders every
card's clean art with identifying filenames; originals live at the Drupal
path minus `/styles/<style>/public`; downloads must run as in-page `fetch()`
in **headful real Chrome** (Akamai 403s headless browsers AND Playwright's
own HTTP stack). `rewards_visa_platinum` deliberately left on the branded
fallback (hub exposes only banner art for the Visa variant).

**Batch script wins (5):** BDO Bench/HOPE/ShopMore (compare-page strategy),
BPI eCredit, HSBC Red Platinum. Scraper hardening shipped: `--headful` flag
(real-Chrome channel, sane viewport — 1920x5000 crashes a visible window),
plus retry-once-then-skip on extraction errors so one bad page can't abort a
batch.

**Visual-audit rejections (2):** equicom_classic got the Equicom *Business*
card art; landbank_classic got ambiguous gold-card art from the shared
LANDBANK page. Both deleted — those cards stay on the branded fallback.

**Still on fallback (~37):** PNB (site yields no art even headful), Maybank +
RCBC + EastWest (context/banner art only per the generic strategy), Security
Bank (nothing found), Maya/Home Credit/Landers/misc. Each needs a per-bank
harvester pass like UnionBank's, or manual curation. Tracked in
`docs/credit-card-image-scrape-report.json` statuses.

Integrity: report now covers all 145 live cards; 85 clean-card entries match
85 assets on disk 1:1; `npm run cc:visuals` green; build green.

## Remaining queue

Catalog sweep is complete — every scraped card is now listed or held with a
documented reason. Reopen when: (1) WebWeaver re-scrapes pnb_visa_classic/
gold from pnb.com.ph, (2) currency fix lands for rcbc_visa_infinite_dollar +
bdo_the_platinum_card (and fee label gains USD support), (3) Metrobank
legacy-domain cards are confirmed open for new applications, (4) Chinabank
Velvet/Wealth fee data is captured, (5) Red Puregold gets a correct-page
scrape, (6) Robinsons Cashback issuing entity is confirmed post-merger.
New banks (Citibank-replacement entrants, digital banks launching cards)
enter via the standard runbook.
