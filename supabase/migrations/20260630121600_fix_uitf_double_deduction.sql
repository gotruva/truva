-- Redefine normalize_mmf_nav_based_scraper_yield to stop UITF double-deduction of taxes and trust fees
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
    -- Align UITFs with Mutual Funds: NAV-based return is already net of taxes and fees
    computed_after_tax_yield := round(new.gross_yield_1y::numeric, 6);
    computed_net_yield := round(new.gross_yield_1y::numeric, 6);

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

-- 1. Temporarily disable daily rate triggers to prevent validation errors during historical recalculation
alter table public.mmf_daily_rates disable trigger mmf_daily_rate_quality;
alter table public.mmf_daily_rates disable trigger mmf_daily_rate_nav_yield_normalizer;

-- 2. Perform yield recalculations for historical scraper data (Setting after_tax and net yields equal to gross)
update public.mmf_daily_rates r
set 
  after_tax_yield = round(gross_yield_1y::numeric, 6),
  net_yield = round(gross_yield_1y::numeric, 6)
from public.money_market_funds f
where r.fund_id = f.id
  and r.data_source = 'scraper'
  and f.fund_type = 'UITF';

-- 3. Clean up manual resolution entries in historical data (no 20% tax scaling on after-tax yield)
update public.mmf_daily_rates
set after_tax_yield = gross_yield_1y
where data_source like 'manual%';

-- 4. Recalculate all historical benchmark fields from inception (2000-01-01)
-- to cleanly populate the benchmark_date, benchmark_rate, and vs_benchmark fields
select public.recalculate_mmf_benchmark('BTR_91D', '2000-01-01');
select public.recalculate_mmf_benchmark('US_TBILL_90D', '2000-01-01');

-- 5. Re-enable daily rate triggers
alter table public.mmf_daily_rates enable trigger mmf_daily_rate_quality;
alter table public.mmf_daily_rates enable trigger mmf_daily_rate_nav_yield_normalizer;
