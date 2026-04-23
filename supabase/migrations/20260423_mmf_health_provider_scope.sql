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
      max(c.rate_date) over (
        partition by c.currency, c.fund_type, c.navpu_source, c.provider
      ) as expected_group_date
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
