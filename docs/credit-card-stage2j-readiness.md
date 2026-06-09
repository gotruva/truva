# Credit Card Stage 2J Readiness - AUB Core

Checked on: 2026-06-09

## Shipping set

| Card key | Decision | Evidence |
| --- | --- | --- |
| `aub_easy_mastercard` | Ship | Official Easy & Classic page is live, official card-face asset is clean, AUB lists yearly fee waived for life, no cash advance facility, and application table lists Php 50,000 gross monthly income for Easy. |
| `aub_classic_mastercard` | Ship | Official Easy & Classic page is live, official card-face asset is clean, AUB lists yearly fee waived for life, no cash advance facility, and application table lists Php 50,000 gross monthly income for Classic. |
| `aub_platinum_mastercard` | Ship | Official Gold & Platinum page is live, official card-face asset is clean, AUB lists yearly fee waived for life, no cash advance facility, airport lounge access, and application table lists Php 100,000 gross monthly income for Platinum. |

## Display corrections

- AUB foreign-currency fee is displayed as 2.50% for Easy, Classic, Gold, and Platinum. The AUB fees page lists a 1.5% AUB service fee plus a 1% Mastercard issuer assessment.
- AUB fee-waiver copy is normalized to "No yearly fee for life, with no spend requirement." No raw `NAFFL` wording is used.
- AUB rewards are displayed as 1 AUB Rewards Point per PHP 50 spend. Gold and Platinum include the official bonus-point note for eligible foreign-currency spend.
- AUB cash advance remains unavailable; AUB's FAQ says the facility is not available.
- Existing `aub_gold_mastercard` remains live and gets the same AUB FX/rewards/source-date cleanup.

## Official sources

- Easy & Classic: https://online.aub.ph/creditcards/easyandclassic
- Gold & Platinum: https://online.aub.ph/creditcards/goldandplatinum
- Fees and charges: https://online.aub.ph/creditcards/feesAndCharges
- Rewards: https://online.aub.ph/creditcards/rewards
- FAQ/application eligibility: https://online.aub.ph/creditcards/faqs

## Blockers / exclusions

- No additional AUB cards are added in this stage.
- No Security Bank, UnionBank, EastWest, RCBC, or Metrobank rows are added in this stage.
- No raw `web_weaver` rows are modified; exposure is controlled only through `public.credit_card_listings`.
