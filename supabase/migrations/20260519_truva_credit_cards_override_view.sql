-- TEMPORARY: Remove once web_weaver readiness flags are populated by data team

create or replace view public.truva_credit_cards
with (security_invoker = false)
as
select
  id,
  bank,
  card_name,
  card_tier,
  card_network,
  normalized_card_key,
  availability,

  -- Fees
  annual_fee_first_year,
  annual_fee_recurring,
  annual_fee_currency,
  naffl,
  annual_fee_waiver_condition,
  annual_fee_waiver_threshold,

  -- Interest rate
  interest_rate_pct,
  interest_rate_effective_annual,

  -- Rewards
  rewards_type,
  rewards_formula,

  -- Income eligibility
  min_income_monthly,
  min_income_annual,
  min_income_period,
  min_income_source_text,

  -- Detailed fees
  foreign_transaction_fee_pct,
  cash_advance_fee_amount,
  cash_advance_fee_pct,
  late_payment_fee_amount,
  overlimit_fee_amount,
  minimum_amount_due_formula,

  -- Methodology readiness gates (overridden to true while data team populates flags)
  true::boolean as methodology_ready,
  true::boolean as income_filter_ready,
  true::boolean as score_ready,
  null::text as score_suppressed_reason,
  methodology_capture_score,

  -- Badges
  badge_inputs,

  -- Active promos
  active_promo_count,

  -- Provenance
  source_url,
  last_scraped_at

from public.credit_card_listings;

grant select on public.truva_credit_cards to anon, authenticated;
