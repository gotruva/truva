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

with recalculated as (
  select
    r.id,
    br.rate
  from public.mmf_daily_rates r
  join public.money_market_funds f
    on f.id = r.fund_id
  join lateral (
    select latest.rate
    from public.benchmark_rates latest
    where latest.key = f.benchmark_key
      and latest.date <= r.date
    order by latest.date desc
    limit 1
  ) br on true
  where f.benchmark_key = 'BTR_91D'
)
update public.mmf_daily_rates r
set
  benchmark_rate = recalculated.rate,
  vs_benchmark = r.net_yield - (recalculated.rate * 0.80)
from recalculated
where r.id = recalculated.id
  and r.net_yield is not null;

revoke all on function public.recalculate_mmf_benchmark(text, date) from public;
grant execute on function public.recalculate_mmf_benchmark(text, date) to service_role;
