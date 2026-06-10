-- Credit-card overrides table: replaces the per-card CASE corrections and the
-- hardcoded allowlist that lived inside public.credit_card_listings.
--
-- Why: the view had grown a CASE branch per corrected field per card (62 cards
-- live, ~100 more to onboard). Every new bank batch meant editing a giant view
-- definition. From this migration on, listing a card = INSERT a row with
-- listed = true; correcting a field = UPDATE that row. web_weaver stays
-- read-only (Truva never writes to scraper schemas).
--
-- Safety: rows are seeded by DIFFING the old view's output against the raw
-- web_weaver values, so the rebuilt view reproduces the previous output
-- exactly. Verified post-apply with per-row md5 hashes (zero changes).

create table public.credit_card_overrides (
  normalized_card_key text primary key,
  -- Listing gate: true exposes the card publicly (replaces the old allowlist).
  -- Cards with raw availability = 'publicly_available' are exposed regardless.
  listed boolean not null default false,
  -- Per-field manual corrections. NULL means "use the raw web_weaver value".
  annual_fee_first_year numeric,
  annual_fee_recurring numeric,
  naffl boolean,
  annual_fee_waiver_condition text,
  annual_fee_waiver_threshold numeric,
  rewards_type text,
  rewards_type_suppress boolean not null default false,
  rewards_formula jsonb,
  min_income_monthly numeric,
  min_income_annual numeric,
  min_income_source_text text,
  foreign_transaction_fee_pct numeric,
  cash_advance_fee_amount numeric,
  cash_advance_fee_pct numeric,
  cash_advance_fee_pct_suppress boolean not null default false,
  source_url text,
  last_scraped_at timestamptz,
  -- Audit trail for the manual-verification workflow.
  verified_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.credit_card_overrides is
  'Manual listing gate + per-field corrections layered over web_weaver.credit_cards. NULL field = use raw value. Maintained by Truva editors; web_weaver itself is never written.';

alter table public.credit_card_overrides enable row level security;
-- No policies: direct API access is blocked; the views read it via owner.

-- ── Seed: one row per currently-listed card, capturing only the fields where
-- the old view's output differed from the raw row (after its generic
-- transforms). This freezes today's public output exactly.
insert into public.credit_card_overrides (
  normalized_card_key,
  listed,
  annual_fee_waiver_condition,
  annual_fee_waiver_threshold,
  rewards_type_suppress,
  rewards_formula,
  foreign_transaction_fee_pct,
  cash_advance_fee_amount,
  cash_advance_fee_pct,
  cash_advance_fee_pct_suppress,
  source_url,
  last_scraped_at,
  verified_at,
  notes
)
select
  l.normalized_card_key,
  true as listed,
  case
    when l.annual_fee_waiver_condition is distinct from (
      case
        when lower(c.annual_fee_waiver_condition) = 'naffl' then 'No yearly fee for life.'
        when c.annual_fee_waiver_condition ilike '%no unconditional NAFFL%'
          then replace(c.annual_fee_waiver_condition, 'no unconditional NAFFL', 'no automatic lifetime fee waiver')
        else c.annual_fee_waiver_condition
      end
    ) then l.annual_fee_waiver_condition
  end,
  case
    when l.annual_fee_waiver_threshold is distinct from c.annual_fee_waiver_threshold
    then l.annual_fee_waiver_threshold
  end,
  (l.rewards_type is null and c.rewards_type is not null) as rewards_type_suppress,
  case
    when l.rewards_formula is distinct from c.rewards_formula then l.rewards_formula
  end,
  case
    when l.foreign_transaction_fee_pct is distinct from c.foreign_transaction_fee_pct
    then l.foreign_transaction_fee_pct
  end,
  case
    when l.cash_advance_fee_amount is distinct from c.cash_advance_fee_amount
    then l.cash_advance_fee_amount
  end,
  case
    when l.cash_advance_fee_pct is not null and l.cash_advance_fee_pct is distinct from (
      case
        when c.cash_advance_fee_pct > 100::numeric then round(c.cash_advance_fee_pct / 100.0, 4)
        else c.cash_advance_fee_pct
      end
    )::numeric(8,4) then l.cash_advance_fee_pct
  end,
  (l.cash_advance_fee_pct is null and c.cash_advance_fee_pct is not null) as cash_advance_fee_pct_suppress,
  case when l.source_url is distinct from c.source_url then l.source_url end,
  case when l.last_scraped_at is distinct from c.last_scraped_at then l.last_scraped_at end,
  null,
  'Seeded from pre-refactor credit_card_listings view output (Stage 2A-2K).'
from public.credit_card_listings l
join web_weaver.credit_cards c on c.id = l.id
on conflict (normalized_card_key) do nothing;

-- ── Rebuild the views over the overrides table.
drop view public.truva_credit_cards;
drop view public.credit_card_listings;

create view public.credit_card_listings as
with active_promos as (
  select
    target.credit_card_id,
    (count(distinct promo.id))::integer as active_promo_count
  from web_weaver.promo_targets target
  join web_weaver.promos promo on promo.id = target.promo_id
  where target.credit_card_id is not null
    and target.is_current = true
    and promo.is_active = true
    and (promo.valid_to is null or promo.valid_to >= current_date)
  group by target.credit_card_id
)
select
  card.id,
  card.bank,
  card.card_name,
  card.card_tier,
  card.card_network,
  card.normalized_card_key,
  card.availability,
  coalesce(ov.annual_fee_first_year, card.annual_fee_first_year) as annual_fee_first_year,
  coalesce(ov.annual_fee_recurring, card.annual_fee_recurring) as annual_fee_recurring,
  card.annual_fee_currency,
  coalesce(ov.naffl, card.naffl) as naffl,
  case
    when ov.annual_fee_waiver_condition is not null then ov.annual_fee_waiver_condition
    when lower(card.annual_fee_waiver_condition) = 'naffl' then 'No yearly fee for life.'
    when card.annual_fee_waiver_condition ilike '%no unconditional NAFFL%'
      then replace(card.annual_fee_waiver_condition, 'no unconditional NAFFL', 'no automatic lifetime fee waiver')
    else card.annual_fee_waiver_condition
  end as annual_fee_waiver_condition,
  coalesce(ov.annual_fee_waiver_threshold, card.annual_fee_waiver_threshold) as annual_fee_waiver_threshold,
  round((card.interest_rate_monthly / 100.0), 4) as interest_rate_pct,
  card.interest_rate_effective_annual,
  case
    when coalesce(ov.rewards_type_suppress, false) then null
    else coalesce(ov.rewards_type, card.rewards_type)
  end as rewards_type,
  coalesce(ov.rewards_formula, card.rewards_formula) as rewards_formula,
  coalesce(ov.min_income_monthly, card.min_income_monthly) as min_income_monthly,
  coalesce(ov.min_income_annual, card.min_income_annual) as min_income_annual,
  card.min_income_period,
  coalesce(ov.min_income_source_text, card.min_income_source_text) as min_income_source_text,
  coalesce(ov.foreign_transaction_fee_pct, card.foreign_transaction_fee_pct) as foreign_transaction_fee_pct,
  coalesce(ov.cash_advance_fee_amount, card.cash_advance_fee_amount) as cash_advance_fee_amount,
  (case
    when coalesce(ov.cash_advance_fee_pct_suppress, false) then null
    when ov.cash_advance_fee_pct is not null then ov.cash_advance_fee_pct
    when card.cash_advance_fee_pct > 100::numeric then round(card.cash_advance_fee_pct / 100.0, 4)
    else card.cash_advance_fee_pct
  end)::numeric(8,4) as cash_advance_fee_pct,
  card.late_payment_fee_amount,
  card.overlimit_fee_amount,
  card.minimum_amount_due_formula,
  card.methodology_ready,
  card.income_filter_ready,
  card.score_ready,
  card.score_suppressed_reason,
  card.methodology_capture_score,
  card.badge_inputs,
  coalesce(promos.active_promo_count, 0) as active_promo_count,
  coalesce(ov.source_url, card.source_url) as source_url,
  coalesce(ov.last_scraped_at, card.last_scraped_at) as last_scraped_at
from web_weaver.credit_cards card
left join public.credit_card_overrides ov
  on ov.normalized_card_key = card.normalized_card_key
left join active_promos promos on promos.credit_card_id = card.id
where (card.availability = 'publicly_available' or coalesce(ov.listed, false))
  and card.normalized_card_key is not null;

create view public.truva_credit_cards as
select
  id,
  bank,
  card_name,
  card_tier,
  card_network,
  normalized_card_key,
  availability,
  annual_fee_first_year,
  annual_fee_recurring,
  annual_fee_currency,
  naffl,
  annual_fee_waiver_condition,
  annual_fee_waiver_threshold,
  interest_rate_pct,
  interest_rate_effective_annual,
  rewards_type,
  rewards_formula,
  min_income_monthly,
  min_income_annual,
  min_income_period,
  min_income_source_text,
  foreign_transaction_fee_pct,
  cash_advance_fee_amount,
  cash_advance_fee_pct,
  late_payment_fee_amount,
  overlimit_fee_amount,
  minimum_amount_due_formula,
  true as methodology_ready,
  true as income_filter_ready,
  true as score_ready,
  null::text as score_suppressed_reason,
  methodology_capture_score,
  badge_inputs,
  active_promo_count,
  source_url,
  last_scraped_at
from public.credit_card_listings;

grant select on public.credit_card_listings to anon, authenticated, service_role;
grant select on public.truva_credit_cards to anon, authenticated, service_role;
