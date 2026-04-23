create or replace function public.validate_mmf_daily_rate_quality()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fund record;
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

    if fund.benchmark_key is not null and (new.benchmark_rate is null or new.vs_benchmark is null) then
      raise exception 'Invalid scraper row for %: benchmark_rate and vs_benchmark must be present', fund.slug;
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

delete from public.mmf_daily_rates r
using public.money_market_funds f
where r.fund_id = f.id
  and f.navpu_source in ('uitf_com_ph', 'bank_website')
  and r.data_source = 'scraper'
  and r.navpu is null;
