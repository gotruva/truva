alter table public.mmf_daily_rates
  add column if not exists benchmark_date date;

create or replace function public.normalize_mmf_nav_based_scraper_yield()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  fund record;
  benchmark record;
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

    select br.date, br.rate
    into benchmark
    from public.benchmark_rates br
    where br.key = fund.benchmark_key
      and br.date <= new.date
    order by br.date desc
    limit 1;

    if benchmark.date is not null then
      new.benchmark_date := benchmark.date;
      new.benchmark_rate := round(benchmark.rate::numeric, 6);
      comparable_benchmark_rate :=
        case
          when fund.benchmark_key = 'BTR_91D' then benchmark.rate * 0.80
          else benchmark.rate
        end;
      new.vs_benchmark := round((new.net_yield - comparable_benchmark_rate)::numeric, 6);
    else
      new.benchmark_date := null;
      new.benchmark_rate := null;
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

    if fund.benchmark_key is not null and not benchmark_exists then
      raise exception 'Invalid scraper row for %: no benchmark exists on or before source date %', fund.slug, new.date;
    end if;

    if (new.benchmark_date is null) <> (new.benchmark_rate is null) then
      raise exception 'Invalid scraper row for %: benchmark_date and benchmark_rate must either both be present or both be null', fund.slug;
    end if;

    if (new.benchmark_rate is null) <> (new.vs_benchmark is null) then
      raise exception 'Invalid scraper row for %: benchmark_rate and vs_benchmark must either both be present or both be null', fund.slug;
    end if;

    if benchmark_exists and (new.benchmark_date is null or new.benchmark_rate is null or new.vs_benchmark is null) then
      raise exception 'Invalid scraper row for %: benchmark date, rate, and vs_benchmark must be present when a benchmark exists on or before the source date', fund.slug;
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

drop view if exists public.mmf_current cascade;
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
  r.benchmark_date,
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
  updated_count integer;
begin
  with target_rows as (
    select
      r.id as rate_id,
      latest_benchmark.date as benchmark_date,
      latest_benchmark.rate as benchmark_rate
    from public.mmf_daily_rates r
    join public.money_market_funds f
      on f.id = r.fund_id
    join lateral (
      select br.date, br.rate
      from public.benchmark_rates br
      where br.key = requested_key
        and br.date <= r.date
      order by br.date desc
      limit 1
    ) latest_benchmark on true
    where f.benchmark_key = requested_key
      and r.date >= requested_date
  )
  update public.mmf_daily_rates r
  set
    benchmark_date = target_rows.benchmark_date,
    benchmark_rate = target_rows.benchmark_rate,
    vs_benchmark = round((
      r.net_yield -
      case
        when requested_key = 'BTR_91D' then target_rows.benchmark_rate * 0.80
        else target_rows.benchmark_rate
      end
    )::numeric, 6)
  from target_rows
  where r.id = target_rows.rate_id;

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
    'benchmark_date, benchmark_rate, and vs_benchmark must be present when a benchmark exists on or before the source date' as detail
  from current_rows cr
  where (cr.benchmark_date is null) <> (cr.benchmark_rate is null)
    or (cr.benchmark_rate is null) <> (cr.vs_benchmark is null)
    or (
      cr.benchmark_key is not null
      and cr.rate_date is not null
      and exists (
        select 1
        from public.benchmark_rates br
        where br.key = cr.benchmark_key
          and br.date <= cr.rate_date
      )
      and (cr.benchmark_date is null or cr.benchmark_rate is null or cr.vs_benchmark is null)
    )
  union all
  select cr.slug, cr.name, cr.provider, 'benchmark_date_after_source'::text as issue_type,
    'benchmark_date must be on or before rate_date' as detail
  from current_rows cr
  where cr.benchmark_date is not null
    and cr.rate_date is not null
    and cr.benchmark_date > cr.rate_date
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

revoke all on function public.recalculate_mmf_benchmark(text, date) from public;
revoke all on function public.get_mmf_health_report(date) from public;
grant execute on function public.recalculate_mmf_benchmark(text, date) to service_role;
grant execute on function public.get_mmf_health_report(date) to service_role;
