create or replace function public.normalize_mmf_nav_based_scraper_yield()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  fund record;
  comparable_benchmark_rate numeric;
  computed_after_tax_yield numeric;
  computed_net_yield numeric;
begin
  select fund_type, navpu_source, benchmark_key, trust_fee_pct
  into fund
  from public.money_market_funds
  where id = new.fund_id;

  if new.data_source = 'scraper'
    and fund.fund_type in ('UITF', 'Mutual Fund')
    and fund.navpu_source in ('uitf_com_ph', 'bank_website')
    and new.gross_yield_1y is not null
  then
    computed_after_tax_yield :=
      case
        when fund.fund_type = 'UITF' then round((new.gross_yield_1y * 0.80)::numeric, 6)
        else round(new.gross_yield_1y::numeric, 6)
      end;

    computed_net_yield :=
      case
        when fund.fund_type = 'UITF' then round((computed_after_tax_yield - coalesce(fund.trust_fee_pct, 0))::numeric, 6)
        else round(new.gross_yield_1y::numeric, 6)
      end;

    new.after_tax_yield := computed_after_tax_yield;
    new.net_yield := computed_net_yield;

    if new.benchmark_rate is not null then
      comparable_benchmark_rate :=
        case
          when fund.benchmark_key = 'BTR_91D' then new.benchmark_rate * 0.80
          else new.benchmark_rate
        end;
      new.vs_benchmark := round((new.net_yield - comparable_benchmark_rate)::numeric, 6);
    else
      new.vs_benchmark := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists mmf_daily_rate_nav_yield_normalizer on public.mmf_daily_rates;
create trigger mmf_daily_rate_nav_yield_normalizer
  before insert or update on public.mmf_daily_rates
  for each row execute function public.normalize_mmf_nav_based_scraper_yield();

create or replace function public.validate_mmf_daily_rate_quality()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fund record;
  benchmark_exists boolean;
begin
  select f.slug, f.name, f.navpu_source, f.benchmark_key
  into fund
  from public.money_market_funds f
  where f.id = new.fund_id;

  if not found then
    return new;
  end if;

  if new.data_source = 'scraper' and fund.navpu_source in ('uitf_com_ph', 'bank_website') then
    if new.navpu is null or new.navpu <= 0 then
      raise exception 'Invalid scraper row for %: NAVPU/NAVPS must be present and positive', fund.slug;
    end if;

    if new.gross_yield_1y is null or new.after_tax_yield is null or new.net_yield is null then
      raise exception 'Invalid scraper row for %: gross, after-tax, and net yields must be present', fund.slug;
    end if;

    if abs(new.gross_yield_1y) > 1 or abs(new.after_tax_yield) > 1 or abs(new.net_yield) > 1 then
      raise exception 'Invalid scraper row for %: yields must be decimal rates, not whole percentages', fund.slug;
    end if;

    select exists (
      select 1
      from public.benchmark_rates br
      where br.key = fund.benchmark_key
        and br.date <= new.date
    )
    into benchmark_exists;

    if (new.benchmark_rate is null) <> (new.vs_benchmark is null) then
      raise exception 'Invalid scraper row for %: benchmark_rate and vs_benchmark must either both be present or both be null', fund.slug;
    end if;

    if benchmark_exists and (new.benchmark_rate is null or new.vs_benchmark is null) then
      raise exception 'Invalid scraper row for %: benchmark_rate and vs_benchmark must be present when a benchmark exists on or before the source date', fund.slug;
    end if;

    new.scraped_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists mmf_daily_rate_quality on public.mmf_daily_rates;
create trigger mmf_daily_rate_quality
  before insert or update on public.mmf_daily_rates
  for each row execute function public.validate_mmf_daily_rate_quality();

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
    'benchmark_rate and vs_benchmark must both be present when a benchmark exists on or before the source date' as detail
  from current_rows cr
  where (cr.benchmark_rate is null) <> (cr.vs_benchmark is null)
    or (
      cr.benchmark_key is not null
      and cr.rate_date is not null
      and exists (
        select 1
        from public.benchmark_rates br
        where br.key = cr.benchmark_key
          and br.date <= cr.rate_date
      )
      and (cr.benchmark_rate is null or cr.vs_benchmark is null)
    )
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
