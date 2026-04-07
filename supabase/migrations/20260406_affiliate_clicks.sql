-- Affiliate click tracking table
-- Logs every click on a /go/[slug] redirect link

create table if not exists affiliate_clicks (
  id           uuid        default gen_random_uuid() primary key,
  created_at   timestamptz default now(),
  product_id   text        not null,   -- e.g. "maya-savings"
  provider     text        not null,   -- e.g. "Maya Bank"
  category     text        not null,   -- e.g. "banks"
  referrer     text,                   -- page on truva the user came from
  user_id      uuid references auth.users(id) on delete set null
);

-- Indexes for analytics queries
create index affiliate_clicks_product_id_idx  on affiliate_clicks(product_id);
create index affiliate_clicks_created_at_idx  on affiliate_clicks(created_at);

-- RLS
alter table affiliate_clicks enable row level security;

-- Anyone (including anonymous) can insert a click
create policy "Allow anonymous inserts"
  on affiliate_clicks for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users can read (for future dashboard)
create policy "Allow authenticated reads"
  on affiliate_clicks for select
  to authenticated
  using (true);
