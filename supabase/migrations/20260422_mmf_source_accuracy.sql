drop view if exists public.mmf_current cascade;

alter table public.mmf_daily_rates
  alter column gross_yield_1y type numeric(9,6),
  alter column after_tax_yield type numeric(9,6),
  alter column net_yield type numeric(9,6),
  alter column benchmark_rate type numeric(9,6),
  alter column vs_benchmark type numeric(9,6);

alter table public.benchmark_rates
  alter column rate type numeric(9,6);

update public.money_market_funds
set navpu_url = 'https://pifa.com.ph/facts-figures/nav-history/?fund_id=70'
where slug = 'fami-save-and-learn-money-market-fund';

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
  r.vs_benchmark,
  f.benchmark_key,
  f.navpu_source,
  f.is_active,
  r.data_source,
  r.scraped_at
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

grant select on public.mmf_current to anon, authenticated, service_role;

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
  with current_rows as (
    select
      c.*,
      max(c.rate_date) over (partition by c.currency, c.fund_type, c.navpu_source, c.provider) as expected_group_date
    from public.mmf_current c
    where c.is_active = true
  )
  select cr.slug, cr.name, cr.provider, 'no_daily_row'::text as issue_type,
    'No current mmf_daily_rates row is available' as detail
  from current_rows cr
  where cr.rate_date is null
  union all
  select cr.slug, cr.name, cr.provider, 'stale_source_date'::text as issue_type,
    'Latest row is ' || cr.rate_date::text || '; provider source latest date is ' || cr.expected_group_date::text as detail
  from current_rows cr
  where cr.expected_group_date is not null
    and cr.rate_date is distinct from cr.expected_group_date
  union all
  select cr.slug, cr.name, cr.provider, 'missing_yield'::text as issue_type,
    'gross_yield_1y, after_tax_yield, and net_yield must all be present' as detail
  from current_rows cr
  where cr.gross_yield_1y is null
    or cr.after_tax_yield is null
    or cr.net_yield is null
  union all
  select cr.slug, cr.name, cr.provider, 'missing_benchmark'::text as issue_type,
    'benchmark_rate and vs_benchmark must be present' as detail
  from current_rows cr
  where cr.benchmark_key is not null
    and (cr.benchmark_rate is null or cr.vs_benchmark is null)
  union all
  select cr.slug, cr.name, cr.provider, 'missing_navpu'::text as issue_type,
    'NAVPU/NAVPS must be present for source-aware MMF rows' as detail
  from current_rows cr
  where cr.navpu is null
  union all
  select cr.slug, cr.name, cr.provider, 'not_scraper'::text as issue_type,
    'data_source should be scraper after source-aware automation runs' as detail
  from current_rows cr
  where cr.data_source is distinct from 'scraper'
  order by provider, name, issue_type;
$$;

revoke all on function public.get_mmf_health_report(date) from public;
grant execute on function public.get_mmf_health_report(date) to service_role;
