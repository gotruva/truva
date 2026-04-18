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
