alter table if exists public.affiliate_clicks
  add column if not exists page_path text,
  add column if not exists placement text,
  add column if not exists page_view_id text;

create index if not exists affiliate_clicks_provider_idx on public.affiliate_clicks(provider);
create index if not exists affiliate_clicks_page_path_idx on public.affiliate_clicks(page_path);
create index if not exists affiliate_clicks_page_view_id_idx on public.affiliate_clicks(page_view_id);

create table if not exists public.affiliate_impressions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id text not null,
  provider text not null,
  category text not null,
  page_path text not null,
  placement text not null,
  page_view_id text not null,
  referrer text
);

create index if not exists affiliate_impressions_created_at_idx on public.affiliate_impressions(created_at);
create index if not exists affiliate_impressions_product_id_idx on public.affiliate_impressions(product_id);
create index if not exists affiliate_impressions_provider_idx on public.affiliate_impressions(provider);
create index if not exists affiliate_impressions_page_path_idx on public.affiliate_impressions(page_path);

alter table public.affiliate_impressions enable row level security;

drop policy if exists "Allow anonymous inserts" on public.affiliate_impressions;
create policy "Allow anonymous inserts"
  on public.affiliate_impressions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow authenticated reads" on public.affiliate_impressions;
create policy "Allow authenticated reads"
  on public.affiliate_impressions for select
  to authenticated
  using (true);

create table if not exists public.affiliate_provider_expands (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider text not null,
  page_path text not null,
  placement text not null,
  page_view_id text not null,
  referrer text
);

create index if not exists affiliate_provider_expands_created_at_idx on public.affiliate_provider_expands(created_at);
create index if not exists affiliate_provider_expands_provider_idx on public.affiliate_provider_expands(provider);
create index if not exists affiliate_provider_expands_page_path_idx on public.affiliate_provider_expands(page_path);

alter table public.affiliate_provider_expands enable row level security;

drop policy if exists "Allow anonymous inserts" on public.affiliate_provider_expands;
create policy "Allow anonymous inserts"
  on public.affiliate_provider_expands for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow authenticated reads" on public.affiliate_provider_expands;
create policy "Allow authenticated reads"
  on public.affiliate_provider_expands for select
  to authenticated
  using (true);

create or replace function public.get_affiliate_cta_summary(days_back integer default 7)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with time_window as (
    select now() - make_interval(days => greatest(days_back, 1)) as since_ts
  ),
  expand_counts as (
    select
      provider,
      count(*)::bigint as expansion_count
    from public.affiliate_provider_expands, time_window
    where created_at >= since_ts
    group by provider
  ),
  impression_counts as (
    select
      provider,
      count(*)::bigint as impression_count
    from public.affiliate_impressions, time_window
    where created_at >= since_ts
      and category = 'banks'
    group by provider
  ),
  click_counts as (
    select
      provider,
      count(*)::bigint as click_count
    from public.affiliate_clicks, time_window
    where created_at >= since_ts
      and category = 'banks'
      and page_view_id is not null
      and placement is not null
      and page_path is not null
    group by provider
  ),
  provider_rows as (
    select
      coalesce(expand_counts.provider, impression_counts.provider, click_counts.provider) as provider,
      coalesce(expand_counts.expansion_count, 0)::bigint as expansions,
      coalesce(impression_counts.impression_count, 0)::bigint as impressions,
      coalesce(click_counts.click_count, 0)::bigint as clicks
    from expand_counts
    full outer join impression_counts using (provider)
    full outer join click_counts using (provider)
  ),
  totals as (
    select
      coalesce(sum(expansions), 0)::bigint as expansions,
      coalesce(sum(impressions), 0)::bigint as impressions,
      coalesce(sum(clicks), 0)::bigint as clicks
    from provider_rows
  )
  select jsonb_build_object(
    'totals',
    jsonb_build_object(
      'expansions', totals.expansions,
      'impressions', totals.impressions,
      'clicks', totals.clicks,
      'ctr',
      case
        when totals.impressions = 0 then 0
        else round((totals.clicks::numeric / totals.impressions::numeric) * 100, 2)
      end
    ),
    'providers',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'provider', provider_rows.provider,
            'expansions', provider_rows.expansions,
            'impressions', provider_rows.impressions,
            'clicks', provider_rows.clicks,
            'ctr',
            case
              when provider_rows.impressions = 0 then 0
              else round((provider_rows.clicks::numeric / provider_rows.impressions::numeric) * 100, 2)
            end
          )
          order by provider_rows.clicks desc, provider_rows.impressions desc, provider_rows.provider asc
        )
        from provider_rows
      ),
      '[]'::jsonb
    )
  )
  from totals;
$$;

revoke all on function public.get_affiliate_cta_summary(integer) from public;
grant execute on function public.get_affiliate_cta_summary(integer) to authenticated, service_role;
