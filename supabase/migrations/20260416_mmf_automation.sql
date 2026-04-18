create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.money_market_funds (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  provider text not null,
  fund_type text not null check (fund_type in ('UITF', 'Mutual Fund')),
  currency text not null default 'PHP' check (currency in ('PHP', 'USD')),
  trust_fee_pct numeric(6,4),
  min_initial numeric(12,2) not null,
  min_additional numeric(12,2),
  redemption_days integer not null default 1,
  holding_period_days integer not null default 0,
  early_redemption_fee text,
  benchmark_label text,
  benchmark_key text,
  risk_class text,
  pdic_insured boolean not null default false,
  access_channels text[] not null default '{}'::text[],
  fund_page_url text not null,
  kiids_url text,
  navpu_source text not null check (navpu_source in ('uitf_com_ph', 'bank_website', 'manual')),
  navpu_url text,
  uitf_fund_id integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mmf_daily_rates (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.money_market_funds(id) on delete cascade,
  date date not null,
  navpu numeric(18,6),
  gross_yield_1y numeric(7,4),
  after_tax_yield numeric(7,4),
  net_yield numeric(7,4),
  benchmark_rate numeric(7,4),
  vs_benchmark numeric(7,4),
  data_source text not null default 'scraper',
  scraped_at timestamptz not null default now(),
  unique (fund_id, date)
);

create table if not exists public.benchmark_rates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  label text not null,
  date date not null,
  rate numeric(7,4) not null,
  source_url text,
  created_at timestamptz not null default now(),
  unique (key, date)
);

create index if not exists idx_mmf_active
  on public.money_market_funds(is_active);
create index if not exists idx_mmf_currency
  on public.money_market_funds(currency);
create index if not exists idx_mmf_source_scope
  on public.money_market_funds(currency, fund_type, navpu_source, is_active);
create index if not exists idx_mmf_daily_fund_date
  on public.mmf_daily_rates(fund_id, date desc);
create index if not exists idx_mmf_daily_date_source
  on public.mmf_daily_rates(date, data_source);
create index if not exists idx_benchmark_key_date
  on public.benchmark_rates(key, date desc);

drop trigger if exists money_market_funds_updated_at on public.money_market_funds;
create trigger money_market_funds_updated_at
  before update on public.money_market_funds
  for each row execute function public.set_updated_at();

insert into public.money_market_funds (
  slug,
  name,
  provider,
  fund_type,
  currency,
  trust_fee_pct,
  min_initial,
  min_additional,
  redemption_days,
  holding_period_days,
  early_redemption_fee,
  benchmark_label,
  benchmark_key,
  risk_class,
  pdic_insured,
  access_channels,
  fund_page_url,
  kiids_url,
  navpu_source,
  navpu_url,
  uitf_fund_id,
  is_active
) values
('atram-peso-money-market-fund', 'ATRAM Peso Money Market Fund', 'ATRAM Trust Corporation', 'UITF', 'PHP', 0.0045, 50, 50, 1, 0, null, '91-day T-Bill (BTr)', 'BTR_91D', 'Conservative', false, array['GCash', 'Maya', 'Seedbox', 'Branch'], 'https://www.atram.com.ph/funds/atram-peso-money-market-fund', null, 'uitf_com_ph', null, 189, true),
('bdo-peso-money-market-fund', 'BDO Peso Money Market Fund', 'BDO Unibank', 'UITF', 'PHP', 0.0050, 10000, 10000, 0, 0, null, '91-day T-Bill (BTr)', 'BTR_91D', 'Moderate', false, array['BDO App', 'Invest Online', 'Branch'], 'https://www.bdo.com.ph/personal/investments/uitf/peso-money-market-fund', null, 'uitf_com_ph', null, 2, true),
('alfm-money-market-fund-shares', 'ALFM Money Market Fund (Shares)', 'BPI Wealth', 'Mutual Fund', 'PHP', 0.0050, 1000, null, 0, 7, '1% within 7 calendar days', 'BPI Money Market Index', 'BTR_91D', 'Conservative', false, array['BPI Online', 'COL Financial', 'FundsMart', 'Branch'], 'https://www.alfmmutualfunds.com/funds/alfm-money-market-fund', null, 'bank_website', null, null, true),
('alfm-money-market-fund-units', 'ALFM Money Market Fund (Units)', 'BPI Wealth', 'Mutual Fund', 'PHP', 0.0050, 1000, null, 0, 7, '1% within 7 calendar days', 'BPI Money Market Index', 'BTR_91D', 'Conservative', false, array['Maya Funds', 'Investa', 'COL Financial', 'FundsMart', 'BPI Online'], 'https://www.alfmmutualfunds.com/funds/alfm-money-market-fund', null, 'bank_website', null, null, true),
('bpi-money-market-fund', 'BPI Money Market Fund', 'BPI Wealth', 'UITF', 'PHP', 0.0050, 10000, 1000, 0, 0, null, '91-day T-Bill net of tax', 'BTR_91D', 'Conservative', false, array['BPI Online', 'e-Invest', 'Branch'], 'https://www.bpiwealth.com/bpi-money-market-fund', null, 'uitf_com_ph', null, 50, true),
('chinabank-cash-fund', 'Chinabank Cash Fund', 'China Banking Corporation', 'UITF', 'PHP', 0.0015, 5000, 1000, 0, 3, '1% of proceeds within 3-day holding period', 'Bloomberg PH Sovereign Bond MM Index', 'BTR_91D', 'Conservative', false, array['My CBC App', 'Online Banking', 'Branch'], 'https://www.chinabank.ph/investments-uitf-conservative-cash-fund', null, 'uitf_com_ph', null, null, true),
('chinabank-money-market-fund', 'Chinabank Money Market Fund', 'China Banking Corporation', 'UITF', 'PHP', 0.0025, 5000, 1000, 1, 3, '1% of proceeds within 3-day holding period', 'Bloomberg PH Sovereign Bond MM Index', 'BTR_91D', 'Moderate', false, array['My CBC App', 'Online Banking', 'Branch'], 'https://www.chinabank.ph/investments-uitf-moderate-money-market-fund', null, 'uitf_com_ph', null, null, true),
('dbp-unlad-panimula-mmf-class-iii', 'DBP Unlad Panimula MMF (Class III)', 'Development Bank of the Philippines', 'UITF', 'PHP', 0.0030, 10000, 1000, 1, 0, null, 'Average 30-day TD rates', 'BTR_91D', 'Conservative', false, array['Branch'], 'https://www.dbp.ph/personal-banking/trust-banking-for-individual-clients/', null, 'uitf_com_ph', null, null, true),
('eastwest-peso-money-market-fund', 'EastWest Peso Money Market Fund', 'EastWest Banking Corporation', 'UITF', 'PHP', 0.0025, 10000, 1000, 1, 0, null, '91-day T-Bill (BTr)', 'BTR_91D', 'Moderate', false, array['Branch'], 'https://www.eastwestbanker.com/investments/uitf/eastwest-peso-money-market-fund', null, 'uitf_com_ph', null, null, true),
('fami-save-and-learn-money-market-fund', 'First Metro Save & Learn Money Market Fund', 'First Metro Asset Management', 'Mutual Fund', 'PHP', 0.0050, 5000, 1000, 1, 7, '1% within 7 days', '90% iBoxx ALBI PH MM + 10% OSSA', 'BTR_91D', 'Conservative', false, array['FAMI Offices', 'FundsMart', 'COL Financial', 'Rampver'], 'https://www.fami.com.ph/mutual-funds/save-and-learn-money-market-fund', null, 'bank_website', null, null, true),
('landbank-money-market-plus-fund', 'LANDBANK Money Market Plus Fund', 'Land Bank of the Philippines', 'UITF', 'PHP', 0.0013, 5000, 1000, 1, 30, '25% of net earnings (min PHP 500) within 30-day holding period', 'Bloomberg PH Sovereign Bond MM Index', 'BTR_91D', 'Moderate', false, array['iAccess', 'weAccess', 'Branch'], 'https://www.landbank.com/personal-banking/investments/uitf', null, 'uitf_com_ph', null, null, true),
('manulife-money-market-fund-class-a', 'Manulife Money Market Fund (Class A)', 'Manulife IMTC', 'UITF', 'PHP', 0.0050, 1000, 1000, 1, 0, null, 'PH Money Market Benchmark', 'BTR_91D', 'Moderate', false, array['Manulife iFUNDS', 'Branch'], 'https://www.manulifeim.com.ph/our-funds/unit-investment-trust-fund/low-volatility-funds/money-market-fund', null, 'uitf_com_ph', null, null, true),
('metro-money-market-fund', 'Metro Money Market Fund', 'Metrobank', 'UITF', 'PHP', 0.0038, 10000, 5000, 0, 0, null, '91-day T-Bill (BTr)', 'BTR_91D', 'Conservative', false, array['Metrobank Online', 'Earnest App', 'Branch'], 'https://www.metrobank.com.ph/articles/uitf-products', null, 'uitf_com_ph', null, null, true),
('pnb-prestige-peso-money-market-fund', 'PNB Prestige Peso Money Market Fund', 'Philippine National Bank', 'UITF', 'PHP', 0.0025, 2000, 2000, 1, 5, '50% of income earned within 5-day holding period', '50% T-Bill + 50% iBoxx ALBI MM', 'BTR_91D', 'Conservative', false, array['PNB Digital App', 'Branch'], 'https://www.pnb.com.ph/index.php/personal/investments', null, 'uitf_com_ph', null, 340, true),
('psbank-money-market-fund', 'PSBank Money Market Fund', 'Philippine Savings Bank', 'UITF', 'PHP', 0.0050, 10000, 5000, 1, 30, null, '91-day T-Bill BVAL rate', 'BTR_91D', 'Conservative', false, array['PSBank Online', 'Branch'], 'https://www.psbank.com.ph/investments/investments/trust-product-lists/psbank-money-market-fund', null, 'uitf_com_ph', null, null, true),
('rcbc-peso-money-market-fund', 'RCBC Peso Money Market Fund', 'RCBC Trust Corporation', 'UITF', 'PHP', 0.0050, 5000, 1000, 1, 0, null, 'Short-term fixed income securities', 'BTR_91D', 'Conservative', false, array['RCBC Pulz App', 'Online Banking', 'Branch'], 'https://www.rcbc.com/personal/investments/uitf', null, 'uitf_com_ph', null, 76, true),
('sb-peso-cash-management-fund', 'SB Peso Cash Management Fund', 'Security Bank Corporation', 'UITF', 'PHP', 0.0025, 5000, 1000, 1, 0, null, '91-day T-Bill (BTr)', 'BTR_91D', 'Moderate Conservative', false, array['SB Online', 'Branch'], 'https://www.securitybank.com/personal/investments/unit-investment-trust-funds/sb-peso-cash-management-fund', null, 'uitf_com_ph', null, null, true),
('sb-peso-money-market-fund', 'SB Peso Money Market Fund', 'Security Bank Corporation', 'UITF', 'PHP', 0.0035, 10000, 5000, 1, 0, null, '90% Bloomberg PH MM + 10% O/N SSA rate', 'BTR_91D', 'Moderate Conservative', false, array['SB Online', 'Branch'], 'https://www.securitybank.com/personal/investments/unit-investment-trust-funds/sb-peso-money-market-fund', null, 'uitf_com_ph', null, null, true),
('bdo-dollar-money-market-fund', 'BDO Dollar Money Market Fund', 'BDO Unibank', 'UITF', 'USD', 0.0050, 500, 500, 0, 0, null, '1-yr rolling USD TD average (net)', 'US_TBILL_90D', 'Moderate', false, array['BDO App', 'Invest Online', 'Branch'], 'https://www.bdo.com.ph/personal/investments/uitf/dollar-money-market-fund', null, 'uitf_com_ph', null, null, true),
('chinabank-dollar-cash-fund', 'Chinabank Dollar Cash Fund', 'China Banking Corporation', 'UITF', 'USD', 0.0015, 500, null, 1, 5, '1% of proceeds within 5-day holding period', 'Bloomberg US T-Bill 3-6M', 'US_TBILL_90D', 'Conservative', false, array['My CBC App', 'Online Banking', 'Branch'], 'https://www.chinabank.ph/investments-uitf-conservative-dollar-cash-fund', null, 'uitf_com_ph', null, null, true),
('landbank-us-dollar-money-market-fund', 'Landbank US Dollar Money Market Fund', 'Land Bank of the Philippines', 'UITF', 'USD', 0.0006, 1000, null, 3, 30, '25% of net earnings (min $10) within 30-day holding period', '3-month US Treasury par yield', 'US_TBILL_90D', 'Conservative', false, array['iAccess', 'Branch'], 'https://www.landbank.com/personal-banking/investments/uitf', null, 'uitf_com_ph', null, null, true),
('metro-dollar-money-market-fund', 'Metro$ Money Market Fund', 'Metrobank', 'UITF', 'USD', 0.0038, 500, null, 1, 0, null, '3-month US T-Bill yield (net)', 'US_TBILL_90D', 'Conservative', false, array['Metrobank Online', 'Branch'], 'https://www.metrobank.com.ph/articles/metro-dollar-money-market-fund', null, 'uitf_com_ph', null, null, true),
('pnb-prime-dollar-money-market-fund', 'PNB Prime Dollar Money Market Fund', 'Philippine National Bank', 'UITF', 'USD', 0.0025, 100, 100, 1, 30, '50% of income earned within 30-day holding period', 'PH Dollar Savings Rate (PPSDUS$)', 'US_TBILL_90D', 'Conservative', false, array['PNB Digital App', 'Branch'], 'https://www.pnb.com.ph/index.php/personal/investments', null, 'uitf_com_ph', null, null, true)
on conflict (slug) do update set
  name = excluded.name,
  provider = excluded.provider,
  fund_type = excluded.fund_type,
  currency = excluded.currency,
  trust_fee_pct = excluded.trust_fee_pct,
  min_initial = excluded.min_initial,
  min_additional = excluded.min_additional,
  redemption_days = excluded.redemption_days,
  holding_period_days = excluded.holding_period_days,
  early_redemption_fee = excluded.early_redemption_fee,
  benchmark_label = excluded.benchmark_label,
  benchmark_key = excluded.benchmark_key,
  risk_class = excluded.risk_class,
  pdic_insured = excluded.pdic_insured,
  access_channels = excluded.access_channels,
  fund_page_url = excluded.fund_page_url,
  kiids_url = excluded.kiids_url,
  navpu_source = excluded.navpu_source,
  navpu_url = excluded.navpu_url,
  uitf_fund_id = excluded.uitf_fund_id,
  is_active = excluded.is_active,
  updated_at = now();

create or replace view public.mmf_current as
select
  f.id,
  f.slug,
  f.name,
  f.provider,
  f.fund_type,
  f.currency,
  f.trust_fee_pct,
  f.min_initial,
  f.min_additional,
  f.redemption_days,
  f.holding_period_days,
  f.early_redemption_fee,
  f.benchmark_label,
  f.risk_class,
  f.pdic_insured,
  f.access_channels,
  f.fund_page_url,
  r.date as rate_date,
  r.navpu,
  r.gross_yield_1y,
  r.after_tax_yield,
  r.net_yield,
  r.benchmark_rate,
  r.vs_benchmark
from public.money_market_funds f
left join public.mmf_daily_rates r
  on r.fund_id = f.id
  and r.date = (
    select max(latest.date)
    from public.mmf_daily_rates latest
    where latest.fund_id = f.id
  )
where f.is_active = true
order by f.currency asc, r.net_yield desc nulls last;

create or replace function public.mmf_pht_current_date()
returns date
language sql
stable
as $$
  select (now() at time zone 'Asia/Manila')::date;
$$;

create or replace function public.recalculate_mmf_benchmark(
  requested_key text,
  requested_date date default public.mmf_pht_current_date()
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_benchmark_rate numeric(7,4);
  tax_adjusted_benchmark_rate numeric(7,4);
  updated_count integer;
begin
  select br.rate
  into latest_benchmark_rate
  from public.benchmark_rates br
  where br.key = requested_key
    and br.date <= requested_date
  order by br.date desc
  limit 1;

  if latest_benchmark_rate is null then
    raise exception 'No benchmark rate found for key % on or before %', requested_key, requested_date;
  end if;

  tax_adjusted_benchmark_rate :=
    case
      when requested_key = 'BTR_91D' then latest_benchmark_rate * 0.80
      else latest_benchmark_rate
    end;

  update public.mmf_daily_rates r
  set
    benchmark_rate = latest_benchmark_rate,
    vs_benchmark = r.net_yield - tax_adjusted_benchmark_rate
  from public.money_market_funds f
  where r.fund_id = f.id
    and f.benchmark_key = requested_key
    and r.date = requested_date;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function public.get_mmf_health_report(
  check_date date default public.mmf_pht_current_date()
)
returns table (
  slug text,
  name text,
  provider text,
  issue_type text,
  detail text
)
language sql
security definer
set search_path = public
as $$
  with target_funds as (
    select f.id, f.slug, f.name, f.provider
    from public.money_market_funds f
    where f.is_active = true
      and f.currency = 'PHP'
      and f.fund_type = 'UITF'
      and f.navpu_source = 'uitf_com_ph'
  ),
  latest_benchmark as (
    select br.rate
    from public.benchmark_rates br
    where br.key = 'BTR_91D'
      and br.date <= check_date
    order by br.date desc
    limit 1
  ),
  today_rows as (
    select r.*
    from public.mmf_daily_rates r
    where r.date = check_date
  )
  select tf.slug, tf.name, tf.provider, 'no_daily_row'::text as issue_type,
    'No mmf_daily_rates row for ' || check_date::text as detail
  from target_funds tf
  left join today_rows r on r.fund_id = tf.id
  where r.id is null
  union all
  select tf.slug, tf.name, tf.provider, 'missing_yield'::text as issue_type,
    'gross_yield_1y, after_tax_yield, and net_yield must all be present' as detail
  from target_funds tf
  join today_rows r on r.fund_id = tf.id
  where r.gross_yield_1y is null
    or r.after_tax_yield is null
    or r.net_yield is null
  union all
  select tf.slug, tf.name, tf.provider, 'missing_benchmark'::text as issue_type,
    'benchmark_rate and vs_benchmark must be present for BTR_91D rows' as detail
  from target_funds tf
  join today_rows r on r.fund_id = tf.id
  where not exists (select 1 from latest_benchmark)
    or r.benchmark_rate is null
    or r.vs_benchmark is null
  union all
  select tf.slug, tf.name, tf.provider, 'not_scraper'::text as issue_type,
    'data_source must be scraper after Phase 3 goes live' as detail
  from target_funds tf
  join today_rows r on r.fund_id = tf.id
  where r.data_source is distinct from 'scraper'
  order by provider, name, issue_type;
$$;

alter table public.money_market_funds enable row level security;
alter table public.mmf_daily_rates enable row level security;
alter table public.benchmark_rates enable row level security;

drop policy if exists "Public read" on public.money_market_funds;
create policy "Public read"
  on public.money_market_funds
  for select
  using (true);

drop policy if exists "Public read" on public.mmf_daily_rates;
create policy "Public read"
  on public.mmf_daily_rates
  for select
  using (true);

drop policy if exists "Public read" on public.benchmark_rates;
create policy "Public read"
  on public.benchmark_rates
  for select
  using (true);

drop policy if exists "Service write" on public.money_market_funds;
create policy "Service write"
  on public.money_market_funds
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service write" on public.mmf_daily_rates;
create policy "Service write"
  on public.mmf_daily_rates
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Service write" on public.benchmark_rates;
create policy "Service write"
  on public.benchmark_rates
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

grant select on public.money_market_funds to anon, authenticated, service_role;
grant select on public.mmf_daily_rates to anon, authenticated, service_role;
grant select on public.benchmark_rates to anon, authenticated, service_role;
grant select on public.mmf_current to anon, authenticated, service_role;

revoke all on function public.recalculate_mmf_benchmark(text, date) from public;
revoke all on function public.get_mmf_health_report(date) from public;
grant execute on function public.recalculate_mmf_benchmark(text, date) to service_role;
grant execute on function public.get_mmf_health_report(date) to service_role;
