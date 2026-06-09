# Credit Card Stage 2K Readiness: Chinabank Prime + Platinum

Checked: 2026-06-09

## Shipped Candidates

### chinabank_prime_mastercard
- Status: ready for public bridge exposure.
- Official product page: https://www.chinabank.ph/credit-cards-prime
- Official card-face image: https://www.chinabank.ph/view-file/product-gallery/rZFGClk5QLJRCgfxnPN77c4g5eZIvT-metacHJpbWUucG5n-.png
- Yearly fee: Php 1,500, waived for the first year.
- Rewards: 1 Rewards Point per Php 30 qualified spend.
- Income requirement: gross annual income of at least Php 250,000, with existing principal credit-card history requirement.
- Foreign card fee: 2.50%.
- Cash advance: fixed Php 200 cash advance fee; 3% cash advance interest accrues separately until fully settled.
- Welcome offer: no current standing welcome gift confirmed on the official product or rewards pages on 2026-06-09.

### chinabank_platinum_mastercard
- Status: ready for public bridge exposure.
- Official product page: https://www.chinabank.ph/credit-cards-platinum
- Official card-face image: https://www.chinabank.ph/view-file/product-gallery/dNBRmE5Edj2J3Ek0h23u7QI1Sv7IRS-metacGxhdGludW0ucG5n-.png
- Yearly fee: Php 3,500, waived for the first year.
- Rewards: 1 Rewards Point per Php 30 qualified spend.
- Fuel rebate: 5% at local gas stations, capped at Php 250 per transaction and Php 500 per cycle month.
- Income requirement: gross annual income of at least Php 250,000, with existing principal credit-card history requirement.
- Foreign card fee: 2.50%.
- Cash advance: fixed Php 200 cash advance fee; 3% cash advance interest accrues separately until fully settled.
- Welcome offer: no current standing welcome gift confirmed on the official product or rewards pages on 2026-06-09.

## Official Data Sources

- Product pages: https://www.chinabank.ph/credit-cards-prime and https://www.chinabank.ph/credit-cards-platinum
- Rewards terms: https://www.chinabank.ph/credit-cards-rewards-tc
- Fees and charges: https://www.chinabank.ph/credit-cards-fees-charges
- Cash advance facility terms: https://www.chinabank.ph/cash-advance
- Application requirements: https://www.chinabank.ph/credit-cards-eligibility-requirements
- Platinum fuel rebate terms: https://www.chinabank.ph/credit-card-features-fuel-rebate

## Blocked Candidate

### chinabank_velvet_visa_signature
- Blocked from Stage 2K.
- Raw row still has incomplete recurring yearly fee, waiver, and foreign-card fee fields.
- Artwork and current public fee details need a separate verification pass before exposure.

## Implementation Notes

- Exposure remains through `public.credit_card_listings` only.
- Raw `web_weaver.credit_cards` data was not edited.
- `cash_advance_fee_pct` remains null for the two new cards because Chinabank publishes a fixed cash advance fee plus separate cash advance interest. The UI should not show "3.00% or Php 200" for these cards.
