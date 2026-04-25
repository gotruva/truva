create or replace function public.get_affiliate_cta_daily_summary(
  p_start_date date default null,
  p_end_date date default null,
  p_report_timezone text default 'Asia/Manila'
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with report_params as (
    select
      coalesce(nullif(p_report_timezone, ''), 'Asia/Manila') as report_timezone
  ),
  requested_window as (
    select
      report_timezone,
      coalesce(p_end_date, (now() at time zone report_timezone)::date) as requested_end_date
    from report_params
  ),
  normalized_window as (
    select
      least(coalesce(p_start_date, requested_end_date - 30), requested_end_date) as start_date,
      greatest(coalesce(p_start_date, requested_end_date - 30), requested_end_date) as end_date,
      report_timezone
    from requested_window
  ),
  bounds as (
    select
      start_date,
      end_date,
      report_timezone,
      start_date::timestamp at time zone report_timezone as start_ts,
      (end_date + 1)::timestamp at time zone report_timezone as end_ts
    from normalized_window
  ),
  days as (
    select generate_series(start_date, end_date, interval '1 day')::date as stat_date
    from bounds
  ),
  events as (
    select
      'expansion'::text as event_type,
      (affiliate_provider_expands.created_at at time zone bounds.report_timezone)::date as stat_date,
      affiliate_provider_expands.provider,
      affiliate_provider_expands.placement,
      affiliate_provider_expands.page_view_id
    from public.affiliate_provider_expands
    cross join bounds
    where affiliate_provider_expands.created_at >= bounds.start_ts
      and affiliate_provider_expands.created_at < bounds.end_ts

    union all

    select
      'impression'::text as event_type,
      (affiliate_impressions.created_at at time zone bounds.report_timezone)::date as stat_date,
      affiliate_impressions.provider,
      affiliate_impressions.placement,
      affiliate_impressions.page_view_id
    from public.affiliate_impressions
    cross join bounds
    where affiliate_impressions.created_at >= bounds.start_ts
      and affiliate_impressions.created_at < bounds.end_ts
      and affiliate_impressions.category = 'banks'

    union all

    select
      'click'::text as event_type,
      (affiliate_clicks.created_at at time zone bounds.report_timezone)::date as stat_date,
      affiliate_clicks.provider,
      affiliate_clicks.placement,
      affiliate_clicks.page_view_id
    from public.affiliate_clicks
    cross join bounds
    where affiliate_clicks.created_at >= bounds.start_ts
      and affiliate_clicks.created_at < bounds.end_ts
      and affiliate_clicks.category = 'banks'
      and affiliate_clicks.page_view_id is not null
      and affiliate_clicks.placement is not null
      and affiliate_clicks.page_path is not null
  ),
  total_rows as (
    select
      count(*) filter (where event_type = 'expansion')::bigint as expansions,
      count(*) filter (where event_type = 'impression')::bigint as impressions,
      count(*) filter (where event_type = 'click')::bigint as clicks,
      count(distinct page_view_id) filter (where event_type = 'expansion')::bigint as unique_expansion_page_views,
      count(distinct page_view_id) filter (where event_type = 'impression')::bigint as unique_impression_page_views,
      count(distinct page_view_id) filter (where event_type = 'click')::bigint as unique_click_page_views
    from events
  ),
  daily_rows as (
    select
      days.stat_date,
      count(*) filter (where events.event_type = 'expansion')::bigint as expansions,
      count(*) filter (where events.event_type = 'impression')::bigint as impressions,
      count(*) filter (where events.event_type = 'click')::bigint as clicks,
      count(distinct events.page_view_id) filter (where events.event_type = 'expansion')::bigint as unique_expansion_page_views,
      count(distinct events.page_view_id) filter (where events.event_type = 'impression')::bigint as unique_impression_page_views,
      count(distinct events.page_view_id) filter (where events.event_type = 'click')::bigint as unique_click_page_views
    from days
    left join events using (stat_date)
    group by days.stat_date
  ),
  provider_rows as (
    select
      coalesce(provider, '(unknown)') as provider,
      count(*) filter (where event_type = 'expansion')::bigint as expansions,
      count(*) filter (where event_type = 'impression')::bigint as impressions,
      count(*) filter (where event_type = 'click')::bigint as clicks,
      count(distinct page_view_id) filter (where event_type = 'expansion')::bigint as unique_expansion_page_views,
      count(distinct page_view_id) filter (where event_type = 'impression')::bigint as unique_impression_page_views,
      count(distinct page_view_id) filter (where event_type = 'click')::bigint as unique_click_page_views
    from events
    group by coalesce(provider, '(unknown)')
  ),
  placement_rows as (
    select
      coalesce(placement, '(unknown)') as placement,
      count(*) filter (where event_type = 'expansion')::bigint as expansions,
      count(*) filter (where event_type = 'impression')::bigint as impressions,
      count(*) filter (where event_type = 'click')::bigint as clicks,
      count(distinct page_view_id) filter (where event_type = 'expansion')::bigint as unique_expansion_page_views,
      count(distinct page_view_id) filter (where event_type = 'impression')::bigint as unique_impression_page_views,
      count(distinct page_view_id) filter (where event_type = 'click')::bigint as unique_click_page_views
    from events
    group by coalesce(placement, '(unknown)')
  )
  select jsonb_build_object(
    'range',
    jsonb_build_object(
      'start_date', bounds.start_date,
      'end_date', bounds.end_date,
      'timezone', bounds.report_timezone
    ),
    'totals',
    jsonb_build_object(
      'expansions', total_rows.expansions,
      'impressions', total_rows.impressions,
      'clicks', total_rows.clicks,
      'unique_expansion_page_views', total_rows.unique_expansion_page_views,
      'unique_impression_page_views', total_rows.unique_impression_page_views,
      'unique_click_page_views', total_rows.unique_click_page_views,
      'ctr',
      case
        when total_rows.impressions = 0 then 0
        else round((total_rows.clicks::numeric / total_rows.impressions::numeric) * 100, 2)
      end,
      'click_page_view_rate',
      case
        when total_rows.unique_impression_page_views = 0 then 0
        else round((total_rows.unique_click_page_views::numeric / total_rows.unique_impression_page_views::numeric) * 100, 2)
      end
    ),
    'days',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'date', daily_rows.stat_date,
            'expansions', daily_rows.expansions,
            'impressions', daily_rows.impressions,
            'clicks', daily_rows.clicks,
            'unique_expansion_page_views', daily_rows.unique_expansion_page_views,
            'unique_impression_page_views', daily_rows.unique_impression_page_views,
            'unique_click_page_views', daily_rows.unique_click_page_views,
            'ctr',
            case
              when daily_rows.impressions = 0 then 0
              else round((daily_rows.clicks::numeric / daily_rows.impressions::numeric) * 100, 2)
            end,
            'click_page_view_rate',
            case
              when daily_rows.unique_impression_page_views = 0 then 0
              else round((daily_rows.unique_click_page_views::numeric / daily_rows.unique_impression_page_views::numeric) * 100, 2)
            end
          )
          order by daily_rows.stat_date
        )
        from daily_rows
      ),
      '[]'::jsonb
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
            'unique_expansion_page_views', provider_rows.unique_expansion_page_views,
            'unique_impression_page_views', provider_rows.unique_impression_page_views,
            'unique_click_page_views', provider_rows.unique_click_page_views,
            'ctr',
            case
              when provider_rows.impressions = 0 then 0
              else round((provider_rows.clicks::numeric / provider_rows.impressions::numeric) * 100, 2)
            end,
            'click_page_view_rate',
            case
              when provider_rows.unique_impression_page_views = 0 then 0
              else round((provider_rows.unique_click_page_views::numeric / provider_rows.unique_impression_page_views::numeric) * 100, 2)
            end
          )
          order by provider_rows.clicks desc, provider_rows.impressions desc, provider_rows.provider asc
        )
        from provider_rows
      ),
      '[]'::jsonb
    ),
    'placements',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'placement', placement_rows.placement,
            'expansions', placement_rows.expansions,
            'impressions', placement_rows.impressions,
            'clicks', placement_rows.clicks,
            'unique_expansion_page_views', placement_rows.unique_expansion_page_views,
            'unique_impression_page_views', placement_rows.unique_impression_page_views,
            'unique_click_page_views', placement_rows.unique_click_page_views,
            'ctr',
            case
              when placement_rows.impressions = 0 then 0
              else round((placement_rows.clicks::numeric / placement_rows.impressions::numeric) * 100, 2)
            end,
            'click_page_view_rate',
            case
              when placement_rows.unique_impression_page_views = 0 then 0
              else round((placement_rows.unique_click_page_views::numeric / placement_rows.unique_impression_page_views::numeric) * 100, 2)
            end
          )
          order by placement_rows.clicks desc, placement_rows.impressions desc, placement_rows.placement asc
        )
        from placement_rows
      ),
      '[]'::jsonb
    )
  )
  from bounds
  cross join total_rows;
$$;

revoke all on function public.get_affiliate_cta_daily_summary(date, date, text) from public;
grant execute on function public.get_affiliate_cta_daily_summary(date, date, text) to authenticated, service_role;
