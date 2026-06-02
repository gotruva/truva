-- Stage 2C public bridge expansion
-- Expose only RCBC Flex Visa after its official card-face artwork and copy have been reviewed.

create or replace view public.credit_card_listings
with (security_invoker = false)
as
with active_promos as (
  select
    target.credit_card_id,
    count(distinct promo.id)::integer as active_promo_count
  from web_weaver.promo_targets target
  join web_weaver.promos promo on promo.id = target.promo_id
  where
    target.credit_card_id is not null
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

  -- Fees
  card.annual_fee_first_year,
  card.annual_fee_recurring,
  card.annual_fee_currency,
  card.naffl,
  card.annual_fee_waiver_condition,
  card.annual_fee_waiver_threshold,

  -- Interest rate: stored as basis points (300 = 3.00%) - divide by 100 for display
  round((card.interest_rate_monthly / 100.0)::numeric, 4) as interest_rate_pct,
  card.interest_rate_effective_annual,

  -- Rewards
  card.rewards_type,
  card.rewards_formula,

  -- Income eligibility
  card.min_income_monthly,
  card.min_income_annual,
  card.min_income_period,
  card.min_income_source_text,

  -- Detailed fees
  card.foreign_transaction_fee_pct,
  card.cash_advance_fee_amount,
  card.cash_advance_fee_pct,
  card.late_payment_fee_amount,
  card.overlimit_fee_amount,
  card.minimum_amount_due_formula,

  -- Methodology readiness gates
  card.methodology_ready,
  card.income_filter_ready,
  card.score_ready,
  card.score_suppressed_reason,
  card.methodology_capture_score,

  -- Badges (fine-print surface layer - see True Value Score methodology)
  card.badge_inputs,

  -- Active promos from join
  coalesce(promos.active_promo_count, 0) as active_promo_count,

  -- Provenance
  case
    when card.normalized_card_key = 'security_bank_wave_mastercard'
      then 'https://www.securitybank.com/personal/credit-cards/rebate/wave-mastercard'
    else card.source_url
  end as source_url,
  card.last_scraped_at

from web_weaver.credit_cards card
left join active_promos promos on promos.credit_card_id = card.id
where (
    card.availability = 'publicly_available'
    or card.normalized_card_key in (
      'bpi_amore_cashback_card',
      'bpi_amore_platinum_cashback_card',
      'bpi_edge_card',
      'bpi_gold_rewards_card',
      'bpi_platinum_rewards_mastercard',
      'bpi_signature_card',
      'petron_bpi_card',
      'eastwest_everyday_titanium_mastercard',
      'eastwest_platinum_mastercard',
      'metrobank_cashback_visa',
      'metrobank_rewards_plus_visa',
      'security_bank_wave_mastercard',
      'rcbc_flex_visa'
    )
  )
  and card.normalized_card_key is not null;

grant select on public.credit_card_listings to anon, authenticated;
