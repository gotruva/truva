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
    select f.id, f.slug, f.name, f.provider, f.currency, f.benchmark_key
    from public.money_market_funds f
    where f.is_active = true
      and f.fund_type = 'UITF'
      and f.navpu_source = 'uitf_com_ph'
      and f.currency in ('PHP', 'USD')
  ),
  latest_btr_benchmark as (
    select br.rate
    from public.benchmark_rates br
    where br.key = 'BTR_91D'
      and br.date <= check_date
    order by br.date desc
    limit 1
  ),
  latest_us_benchmark as (
    select br.rate
    from public.benchmark_rates br
    where br.key = 'US_TBILL_90D'
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
    'benchmark_rate and vs_benchmark must be present when a benchmark is expected' as detail
  from target_funds tf
  join today_rows r on r.fund_id = tf.id
  where (tf.benchmark_key = 'BTR_91D' and not exists (select 1 from latest_btr_benchmark))
    or (tf.benchmark_key = 'US_TBILL_90D' and not exists (select 1 from latest_us_benchmark))
    or (tf.benchmark_key is not null and (r.benchmark_rate is null or r.vs_benchmark is null))
  union all
  select tf.slug, tf.name, tf.provider, 'not_scraper'::text as issue_type,
    'data_source must be scraper after Phase 3 goes live' as detail
  from target_funds tf
  join today_rows r on r.fund_id = tf.id
  where r.data_source is distinct from 'scraper'
  order by provider, name, issue_type;
$$;
