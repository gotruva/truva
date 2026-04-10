create schema if not exists staging;

create or replace function staging.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists staging.institutions (
  id uuid primary key default gen_random_uuid(),
  institution_slug text not null unique,
  provider_display_name text not null,
  legal_name text not null,
  official_domain text,
  license_type text not null,
  market_label text not null,
  source_mode text not null default 'approved_seed',
  publish_allowed boolean not null default false,
  review_status text not null default 'approved',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staging_institutions_license_type_check check (
    license_type in (
      'digital_bank',
      'rural_bank',
      'thrift_bank',
      'commercial_bank',
      'government_agency',
      'fund_manager',
      'defi_protocol',
      'unknown'
    )
  ),
  constraint staging_institutions_market_label_check check (
    market_label in ('digital-bank', 'neobank', 'government', 'uitf', 'defi', 'legacy-manual')
  ),
  constraint staging_institutions_source_mode_check check (
    source_mode in ('approved_seed', 'automated', 'manual_annual', 'inactive_pending_automation')
  ),
  constraint staging_institutions_review_status_check check (
    review_status in ('approved', 'pending_review', 'rejected')
  )
);

create table if not exists staging.institution_sources (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references staging.institutions(id) on delete cascade,
  source_kind text not null,
  url text not null,
  parse_strategy text not null,
  official boolean not null default true,
  active boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staging_institution_sources_kind_check check (
    source_kind in ('landing_page', 'product_page', 'fees_page', 'help_center', 'terms_pdf')
  ),
  constraint staging_institution_sources_parse_strategy_check check (
    parse_strategy in ('html', 'pdf', 'playwright')
  ),
  unique (institution_id, url)
);

create table if not exists staging.products (
  id text primary key,
  institution_id uuid not null references staging.institutions(id) on delete cascade,
  provider_display_name text not null,
  product_name text not null,
  public_category text not null,
  product_type text not null,
  source_mode text not null default 'approved_seed',
  automation_phase text not null default 'manual_seed',
  publish_allowed boolean not null default false,
  review_status text not null default 'approved',
  active_public boolean not null default true,
  seed_position integer not null default 0,
  seed_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staging_products_source_mode_check check (
    source_mode in ('approved_seed', 'automated', 'manual_annual', 'inactive_pending_automation')
  ),
  constraint staging_products_automation_phase_check check (
    automation_phase in ('phase1_digital', 'manual_seed', 'inactive')
  ),
  constraint staging_products_review_status_check check (
    review_status in ('approved', 'pending_review', 'rejected')
  )
);

create table if not exists staging.crawl_runs (
  id uuid primary key default gen_random_uuid(),
  institution_source_id uuid references staging.institution_sources(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'queued',
  http_status integer,
  content_hash text,
  artifact_path text,
  screenshot_path text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  constraint staging_crawl_runs_status_check check (
    status in ('queued', 'running', 'succeeded', 'failed', 'skipped')
  )
);

create table if not exists staging.product_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references staging.products(id) on delete cascade,
  crawl_run_id uuid references staging.crawl_runs(id) on delete set null,
  source_mode text not null,
  review_status text not null default 'approved',
  structured_payload jsonb not null,
  raw_payload jsonb,
  raw_text text,
  approved_at timestamptz,
  captured_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint staging_product_snapshots_source_mode_check check (
    source_mode in ('approved_seed', 'automated', 'manual_annual', 'inactive_pending_automation')
  ),
  constraint staging_product_snapshots_review_status_check check (
    review_status in ('approved', 'pending_review', 'rejected')
  )
);

create table if not exists staging.facts (
  id uuid primary key default gen_random_uuid(),
  product_snapshot_id uuid not null references staging.product_snapshots(id) on delete cascade,
  crawl_run_id uuid references staging.crawl_runs(id) on delete set null,
  fact_key text not null,
  value jsonb not null,
  evidence_text text,
  source_url text,
  confidence numeric(5,4) not null default 1,
  is_material boolean not null default true,
  review_status text not null default 'approved',
  created_at timestamptz not null default now(),
  constraint staging_facts_review_status_check check (
    review_status in ('approved', 'pending_review', 'rejected')
  )
);

create table if not exists staging.change_events (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references staging.products(id) on delete cascade,
  previous_snapshot_id uuid references staging.product_snapshots(id) on delete set null,
  new_snapshot_id uuid references staging.product_snapshots(id) on delete set null,
  change_type text not null,
  severity text not null default 'medium',
  summary text,
  diff jsonb not null default '{}'::jsonb,
  review_status text not null default 'pending_review',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint staging_change_events_severity_check check (
    severity in ('low', 'medium', 'high')
  ),
  constraint staging_change_events_review_status_check check (
    review_status in ('approved', 'pending_review', 'rejected')
  )
);

create table if not exists staging.review_queue (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  reason text not null,
  status text not null default 'queued',
  priority integer not null default 2,
  reviewer_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint staging_review_queue_status_check check (
    status in ('queued', 'approved', 'rejected')
  ),
  constraint staging_review_queue_priority_check check (
    priority between 1 and 5
  )
);

create table if not exists staging.published_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_channel text not null,
  payload jsonb not null,
  source_product_ids text[] not null default '{}'::text[],
  provider_count integer not null default 0,
  product_count integer not null default 0,
  promoted_from_snapshot_id uuid references staging.published_snapshots(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  constraint staging_published_snapshots_channel_check check (
    snapshot_channel in ('staging', 'production')
  )
);

create index if not exists staging_institutions_publish_allowed_idx
  on staging.institutions(publish_allowed);
create index if not exists staging_products_institution_idx
  on staging.products(institution_id);
create index if not exists staging_products_publish_allowed_idx
  on staging.products(publish_allowed, active_public, seed_position);
create index if not exists staging_crawl_runs_source_idx
  on staging.crawl_runs(institution_source_id, started_at desc);
create index if not exists staging_product_snapshots_product_idx
  on staging.product_snapshots(product_id, created_at desc);
create index if not exists staging_change_events_product_idx
  on staging.change_events(product_id, created_at desc);
create index if not exists staging_review_queue_status_idx
  on staging.review_queue(status, priority, created_at desc);
create index if not exists staging_published_snapshots_channel_idx
  on staging.published_snapshots(snapshot_channel, generated_at desc);

drop trigger if exists staging_institutions_updated_at on staging.institutions;
create trigger staging_institutions_updated_at
  before update on staging.institutions
  for each row execute function staging.set_updated_at();

drop trigger if exists staging_institution_sources_updated_at on staging.institution_sources;
create trigger staging_institution_sources_updated_at
  before update on staging.institution_sources
  for each row execute function staging.set_updated_at();

drop trigger if exists staging_products_updated_at on staging.products;
create trigger staging_products_updated_at
  before update on staging.products
  for each row execute function staging.set_updated_at();

create or replace function public.get_latest_rate_snapshot(requested_channel text)
returns table (
  snapshot_channel text,
  payload jsonb,
  source_product_ids text[],
  provider_count integer,
  product_count integer,
  generated_at timestamptz
)
language sql
security definer
set search_path = public, staging
as $$
  select
    ps.snapshot_channel,
    ps.payload,
    ps.source_product_ids,
    ps.provider_count,
    ps.product_count,
    ps.generated_at
  from staging.published_snapshots ps
  where ps.snapshot_channel = requested_channel
  order by ps.generated_at desc
  limit 1
$$;

create or replace function public.build_rate_snapshot(requested_channel text, snapshot_notes text default null)
returns table (
  out_snapshot_id uuid,
  out_snapshot_channel text,
  out_product_count integer,
  out_provider_count integer,
  out_generated_at timestamptz
)
language plpgsql
security definer
set search_path = public, staging
as $$
begin
  return query
  with latest_snapshots as (
    select distinct on (ps.product_id)
      ps.product_id,
      ps.structured_payload
    from staging.product_snapshots ps
    where ps.review_status = 'approved'
    order by ps.product_id, ps.created_at desc
  ),
  eligible as (
    select
      p.id,
      p.seed_position,
      ls.structured_payload
    from staging.products p
    join latest_snapshots ls on ls.product_id = p.id
    where p.publish_allowed = true
      and p.active_public = true
    order by p.seed_position
  ),
  inserted as (
    insert into staging.published_snapshots (
      snapshot_channel,
      payload,
      source_product_ids,
      provider_count,
      product_count,
      notes,
      metadata,
      generated_at
    )
    select
      requested_channel,
      coalesce(jsonb_agg(eligible.structured_payload order by eligible.seed_position), '[]'::jsonb),
      coalesce(array_agg(eligible.id order by eligible.seed_position), '{}'::text[]),
      count(distinct (eligible.structured_payload ->> 'provider')),
      count(*),
      snapshot_notes,
      jsonb_build_object('generated_by', 'public.build_rate_snapshot'),
      now()
    from eligible
    returning
      id,
      snapshot_channel,
      product_count,
      provider_count,
      generated_at
  )
  select
    inserted.id as out_snapshot_id,
    inserted.snapshot_channel as out_snapshot_channel,
    inserted.product_count as out_product_count,
    inserted.provider_count as out_provider_count,
    inserted.generated_at as out_generated_at
  from inserted;
end;
$$;

create or replace function public.promote_rate_snapshot()
returns table (
  out_snapshot_id uuid,
  out_snapshot_channel text,
  out_product_count integer,
  out_provider_count integer,
  out_generated_at timestamptz
)
language plpgsql
security definer
set search_path = public, staging
as $$
declare
  source_snapshot staging.published_snapshots%rowtype;
begin
  select *
  into source_snapshot
  from staging.published_snapshots
  where snapshot_channel = 'staging'
  order by generated_at desc
  limit 1;

  if source_snapshot.id is null then
    raise exception 'No staging snapshot found to promote.';
  end if;

  return query
  insert into staging.published_snapshots (
    snapshot_channel,
    payload,
    source_product_ids,
    provider_count,
    product_count,
    promoted_from_snapshot_id,
    notes,
    metadata,
    generated_at
  )
  values (
    'production',
    source_snapshot.payload,
    source_snapshot.source_product_ids,
    source_snapshot.provider_count,
    source_snapshot.product_count,
    source_snapshot.id,
    format('Promoted from staging snapshot %s', source_snapshot.id),
    jsonb_build_object('generated_by', 'public.promote_rate_snapshot'),
    now()
  )
  returning
    id as out_snapshot_id,
    snapshot_channel as out_snapshot_channel,
    product_count as out_product_count,
    provider_count as out_provider_count,
    generated_at as out_generated_at;
end;
$$;

grant usage on schema staging to service_role;
grant all privileges on all tables in schema staging to service_role;
grant all privileges on all sequences in schema staging to service_role;
grant all privileges on all functions in schema staging to service_role;

alter default privileges in schema staging
  grant all on tables to service_role;
alter default privileges in schema staging
  grant all on sequences to service_role;
alter default privileges in schema staging
  grant all on functions to service_role;

grant execute on function public.get_latest_rate_snapshot(text) to anon, authenticated, service_role;
grant execute on function public.build_rate_snapshot(text, text) to service_role;
grant execute on function public.promote_rate_snapshot() to service_role;
