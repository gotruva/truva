# Credit Card Image Handoff

Hermes should use `lib/credit-card-visuals.ts` plus the live `truva_credit_cards` rows as the checklist for card artwork.

## Output Paths

- Final image assets: `public/cards/clean/{normalized_card_key}.webp`
- Scrape report: `docs/credit-card-image-scrape-report.json`

Use the same filename normalization as `normalizeCleanCreditCardAssetKey`: lowercase, alphanumeric words joined by underscores.

## Image Standard

Each final asset should be:

- Front-facing official issuer artwork from the bank or issuer site.
- Card face only: no white frame, no bank-page background, no lifestyle crop, no mockup container, no comparison-site image.
- WebP, preferably with transparency.
- Physical-card ratio, about `1.586:1`; target canvas is `960x606`.
- Filled by the actual card artwork with no more than 2-3% transparent safety padding.

If a clean official card-face image is not available, keep the existing local fallback and mark the report entry as `needs-manual-review` or `official-unavailable`.

## Report Fields

Each `docs/credit-card-image-scrape-report.json` entry must include:

- `normalized_card_key`
- `bank`
- `card_name`
- `source_page_url`
- `direct_image_url`
- `local_asset_path`
- `status`: `clean-card`, `needs-manual-review`, or `official-unavailable`
- `checked_at`
- `notes`

The app renders local static assets only. Do not point React components at external bank image URLs.
