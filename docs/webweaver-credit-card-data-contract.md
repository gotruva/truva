# WebWeaver Credit Card Data Contract

Last checked: 2026-06-10

> **2026-06-10 update — overrides table supersedes view CASEs.** Listing and
> per-card corrections now live in `public.credit_card_overrides`
> (`listed = true` exposes a card; nullable columns override raw fields).
> The old hardcoded allowlist + CASE corrections inside
> `public.credit_card_listings` were migrated there with a hash-verified,
> output-identical rewrite (`20260610090000_credit_card_overrides_table.sql`).
> Do not add new CASE branches to the view — insert/update override rows
> instead. Batch history: `docs/credit-card-batch-log.md`.

This note is for future agents working on Truva's credit-card pages. It records how
Truva currently reads `web_weaver` data, what Gelo's v2 table contract says, and
which live Supabase mismatches need care before changing the public bridge.

## Current Website Bridge

The Truva app should not read raw `web_weaver` tables directly from React pages.
Keep the bridge layered:

```text
web_weaver.credit_cards
  -> public.credit_card_listings
  -> public.truva_credit_cards
  -> lib/credit-cards.ts
  -> app/credit-cards/*
```

Current app entry points:

- `lib/credit-cards.ts` queries `public.truva_credit_cards`.
- `types/index.ts` has the frontend `CreditCard` type for that public view.
- `supabase/migrations/20260427_credit_card_listings_view.sql` defines the
  first public bridge over `web_weaver.credit_cards`.
- `supabase/migrations/20260519_truva_credit_cards_override_view.sql` defines a
  temporary `public.truva_credit_cards` wrapper that overrides readiness flags.

Do not expose raw `web_weaver` rows directly to user-facing components. Add or
revise public views/adapters instead.

## Gelo's V2 Contract

Gelo's private repo doc is:

`gotruva/web-weaver-v2/docs/credit_cards_table.md`

Use local GitHub CLI if browser/connector access returns 404:

```powershell
gh api repos/gotruva/web-weaver-v2/contents/docs/credit_cards_table.md?ref=main --jq '.content'
```

The intended `web_weaver.credit_cards` v2 contract:

- One row per credit-card variant.
- Primary/upsert key is `normalized_card_key`.
- Flat columns exist for common filters: identity, fees, income, and
  `rewards_type`.
- `interest_rate_monthly` is an integer in basis points, where `300 = 3%`.
- `methodology_inputs` is intended to be a flat JSONB object keyed by field name.
- `methodology_input_status` is intended to be a flat JSONB object keyed by field
  name with statuses such as `present`, `missing`, `not_publicly_available`,
  `unsupported`, and `needs_manual_review`.
- `score_ready` is always `false` in the seed phase; scoring is downstream.
- `badge_inputs` is an empty array in the seed phase; the scoring layer should
  populate badge booleans later.

Important: in Gelo's doc, groups like `welcome_offers` and `promo_linkage` are
methodology sections, not necessarily nested JSON paths. The intended queries are:

```sql
select
  normalized_card_key,
  methodology_inputs->>'welcome_bonus_type' as bonus_type,
  methodology_inputs->>'welcome_bonus_value' as bonus_value,
  methodology_inputs->>'welcome_bonus_required_spend' as required_spend,
  methodology_inputs->>'welcome_bonus_spend_window_days' as spend_window_days,
  methodology_inputs->>'welcome_bonus_first_year_waiver' as first_year_waiver
from web_weaver.credit_cards
where methodology_inputs->>'welcome_bonus_type' not in ('null', 'unsupported')
  and methodology_inputs->>'welcome_bonus_type' is not null;
```

## Live Supabase Mismatches To Re-check

Live data observed on 2026-05-25 did not fully match the v2 contract yet.
Re-query before making claims, but watch for these failure modes:

- `web_weaver.credit_cards` had 146 rows, while the public view exposed 40 rows.
- Some `normalized_card_key` values still contained spaces, despite the v2
  contract requiring snake_case.
- `availability` values were mixed, including `publicly_available`, `open`,
  `open_market`, `available`, `active`, `invite_only`, and others.
- `interest_rate_monthly` was mixed: many rows used `300`, while some rows still
  used `3`. The public view divides by `100`, so a stored `3` becomes a bad
  `0.03%` display.
- `methodology_ready` and `score_ready` were false in raw `web_weaver` rows, but
  `public.truva_credit_cards` temporarily overrides readiness to true.
- `badge_inputs` shape was inconsistent for frontend use: some rows were arrays,
  while Truva's UI expects an object of badge booleans.
- Some live `methodology_inputs` rows looked nested by group, even though the v2
  doc describes flat field keys.

Before changing `public.credit_card_listings`, query the live shape instead of
assuming the doc is already deployed exactly as written.

## Promo Tables

Promos are separate from the card seed pipeline:

- `web_weaver.promos`
- `web_weaver.promo_offers`
- `web_weaver.promo_targets`
- `web_weaver.promo_offer_targets`

Use `web_weaver.promos` for issuer-level promo rows. Do not assume
`promo_offers.bank` exists. Use `promo_targets` or `promo_offer_targets` for card
relationships.

As of 2026-05-25, a broad live check found:

- 127 active credit-card-related promo rows.
- 15 BPI, 12 UnionBank, and 100 RCBC active rows.
- 5 active acquisition/welcome-style promos:
  - BPI Back-to-Back Perks
  - UnionBank Credit Cards Welcome Gift Promo
  - RCBC No Annual Fee For Life!
  - RCBC Welcome Gift: Up to 15,000 Signature Airmiles
  - RCBC Welcome Gift for New RCBC Visa Infinite Cardholders
- Only one active promo had an exact `credit_card_id` target at that time.

For public card pages, do not show a promo as card-specific unless it has a
verified exact card target or a public view expands and verifies group targets.
Issuer-level promo counts alone are not enough.

## Active Promo Filter

Use date filtering in Asia/Manila/PHT terms when building public promo views.
At minimum:

```sql
where promo.is_active = true
  and (promo.status is null or promo.status <> 'expired')
  and (promo.valid_from is null or promo.valid_from <= current_date)
  and (promo.valid_to is null or promo.valid_to >= current_date)
```

Rows with `valid_to is null` need a product decision. They may be ongoing, or
they may simply be incomplete. For consumer-facing "active welcome promo" badges,
prefer explicit end dates unless manually approved.

## Recommended Public View Direction

When WebWeaver v2 is stable, update the public bridge to expose:

- stable URL-safe slug/key
- normalized availability for public rows
- normalized monthly interest percentage
- card-level welcome bonus fields from `methodology_inputs`
- exact active promo rows/counts from `promos` plus `promo_targets`
- readiness/status fields without overriding raw readiness unless the override is
  intentionally documented

Keep `active_welcome_promos` as JSONB if the UI needs details, and keep a simple
`active_welcome_promo_count` for filters/badges.
