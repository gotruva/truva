-- Expose four official-source-ready RCBC cards for Stage 2G.
-- Raw web_weaver rows stay unchanged; display-only corrections happen in the public bridge.

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
  case
    when card.normalized_card_key = 'm_free_credit_card'
      then 'No yearly fee for life, with no spend requirement.'
    when card.normalized_card_key = 'metrobank_titanium_mastercard'
      then 'First-year fee is waived. After that, Metrobank lists a Php 180,000 yearly spend waiver for the following year; a 2026 welcome promo may waive the fee for life for eligible new cardholders.'
    when card.normalized_card_key = 'rcbc_flex_visa'
      then 'Temporary lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants; apply from April 1 to June 30, 2026 and spend Php 30,000 within 60 days from card receipt. Outside the promo, RCBC does not publish a standard waiver condition.'
    when card.normalized_card_key = 'rcbc_black_card_platinum_mastercard'
      then 'Limited-time lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants; apply from April 1 to June 30, 2026 and spend Php 60,000 within 60 days from card receipt. The promo cannot be combined with RCBC welcome-gift promos. Outside the promo, RCBC lists a Php 3,600 yearly principal fee.'
    when card.normalized_card_key = 'rcbc_classic_mastercard'
      then 'Limited-time lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants; apply from April 1 to June 30, 2026 and spend Php 30,000 within 60 days from card receipt. Outside the promo, RCBC lists 9,900 Rewards Points as a principal-card yearly-fee waiver redemption.'
    when card.normalized_card_key = 'rcbc_gold_mastercard'
      then 'Limited-time lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants; apply from April 1 to June 30, 2026 and spend Php 40,000 within 60 days from card receipt. Outside the promo, RCBC lists 19,800 Rewards Points as a principal-card yearly-fee waiver redemption.'
    when card.normalized_card_key = 'rcbc_diamond_card_platinum_mastercard'
      then 'Limited-time lifetime yearly-fee waiver for eligible new-to-RCBC principal applicants; apply from April 1 to June 30, 2026 and spend Php 60,000 within 60 days from card receipt. Outside the promo, RCBC lists 16,500 Rewards Points as a principal-card yearly-fee waiver redemption.'
    when card.normalized_card_key = 'rcbc_airmiles_visa_signature'
      then 'First-year fee is waived. RCBC does not publish a standard recurring yearly-fee waiver condition for this card.'
    when lower(card.annual_fee_waiver_condition) = 'naffl'
      then 'No yearly fee for life.'
    when card.annual_fee_waiver_condition ilike '%no unconditional NAFFL%'
      then replace(card.annual_fee_waiver_condition, 'no unconditional NAFFL', 'no automatic lifetime fee waiver')
    else card.annual_fee_waiver_condition
  end as annual_fee_waiver_condition,
  case
    when card.normalized_card_key = 'm_free_credit_card'
      then 0.00::numeric(14, 2)
    when card.normalized_card_key in ('rcbc_flex_visa', 'rcbc_classic_mastercard')
      then 30000.00::numeric(14, 2)
    when card.normalized_card_key = 'rcbc_gold_mastercard'
      then 40000.00::numeric(14, 2)
    when card.normalized_card_key in ('rcbc_black_card_platinum_mastercard', 'rcbc_diamond_card_platinum_mastercard')
      then 60000.00::numeric(14, 2)
    else card.annual_fee_waiver_threshold
  end as annual_fee_waiver_threshold,

  -- Interest rate: stored as basis points (300 = 3.00%) - divide by 100 for display
  round((card.interest_rate_monthly / 100.0)::numeric, 4) as interest_rate_pct,
  card.interest_rate_effective_annual,

  -- Rewards
  case
    when card.normalized_card_key = 'm_free_credit_card'
      then null::text
    else card.rewards_type
  end as rewards_type,
  case
    when card.normalized_card_key = 'm_free_credit_card'
      then jsonb_build_object(
        'earn_unit', 'No rewards program listed by Metrobank',
        'source_url', 'https://www.metrobank.com.ph/personal/cards/credit-cards/mfree'
      )
    when card.normalized_card_key = 'metrobank_titanium_mastercard'
      then jsonb_build_object(
        'earn_rate', 1,
        'earn_unit', 'point per PHP 20',
        'bonus_multiplier', 2,
        'bonus_categories', jsonb_build_array('online', 'department store', 'dining'),
        'source_url', 'https://www.metrobank.com.ph/personal/cards/credit-cards/titanium'
      )
    when card.normalized_card_key in (
      'rcbc_black_card_platinum_mastercard',
      'rcbc_classic_mastercard',
      'rcbc_gold_mastercard',
      'rcbc_diamond_card_platinum_mastercard'
    )
      then jsonb_build_object(
        'earn_rate', 1,
        'earn_unit', 'point per PHP 30 local spend; international spend earns 1 point per PHP 10',
        'source_url', 'https://rcbccredit.com/features-and-benefits/rewards/rewards-points'
      )
    when card.normalized_card_key = 'rcbc_airmiles_visa_signature'
      then jsonb_build_object(
        'earn_rate', 1,
        'earn_unit', 'Signature Airmile per PHP 25 overseas spend; local spend earns 1 Signature Airmile per PHP 48',
        'conversion', '1 Signature Airmile to 1 partner mile or point',
        'source_url', 'https://rcbccredit.com/credit-cards/premium-cards/airmiles-visa-signature'
      )
    else card.rewards_formula
  end as rewards_formula,

  -- Income eligibility
  card.min_income_monthly,
  card.min_income_annual,
  card.min_income_period,
  card.min_income_source_text,

  -- Detailed fees
  case
    when card.normalized_card_key = 'bdo_blue_from_american_express'
      then 2.50::numeric(8, 4)
    when card.normalized_card_key in ('m_free_credit_card', 'metrobank_titanium_mastercard')
      then 3.50::numeric(8, 4)
    else card.foreign_transaction_fee_pct
  end as foreign_transaction_fee_pct,
  case
    when card.normalized_card_key = 'bdo_installment_card'
      then 200.00::numeric(12, 2)
    else card.cash_advance_fee_amount
  end as cash_advance_fee_amount,
  case
    when card.cash_advance_fee_pct > 100
      then round((card.cash_advance_fee_pct / 100.0)::numeric, 4)
    else card.cash_advance_fee_pct
  end::numeric(8, 4) as cash_advance_fee_pct,
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
    when card.normalized_card_key = 'm_free_credit_card'
      then 'https://www.metrobank.com.ph/personal/cards/credit-cards/mfree'
    when card.normalized_card_key = 'metrobank_titanium_mastercard'
      then 'https://www.metrobank.com.ph/personal/cards/credit-cards/titanium'
    when card.normalized_card_key = 'rcbc_black_card_platinum_mastercard'
      then 'https://rcbccredit.com/credit-cards/premium-cards/black-card-platinum-mastercard'
    when card.normalized_card_key = 'rcbc_classic_mastercard'
      then 'https://rcbccredit.com/credit-cards/gold-and-classic-cards/classic-card'
    when card.normalized_card_key = 'rcbc_gold_mastercard'
      then 'https://rcbccredit.com/credit-cards/gold-and-classic-cards/gold-card'
    when card.normalized_card_key = 'rcbc_diamond_card_platinum_mastercard'
      then 'https://rcbccredit.com/credit-cards/premium-cards/diamond-card-platinum-mastercard'
    when card.normalized_card_key = 'rcbc_airmiles_visa_signature'
      then 'https://rcbccredit.com/credit-cards/premium-cards/airmiles-visa-signature'
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
      'eastwest_gold_mastercard',
      'eastwest_platinum_mastercard',
      'eastwest_visa_platinum',
      'metrobank_cashback_visa',
      'metrobank_rewards_plus_visa',
      'metrobank_titanium_mastercard',
      'm_free_credit_card',
      'security_bank_wave_mastercard',
      'rcbc_flex_visa',
      'rcbc_black_card_platinum_mastercard',
      'rcbc_classic_mastercard',
      'rcbc_gold_mastercard',
      'rcbc_diamond_card_platinum_mastercard',
      'rcbc_airmiles_visa_signature'
    )
  )
  and card.normalized_card_key is not null;

grant select on public.credit_card_listings to anon, authenticated;
