-- Partner inquiry submissions from the "Partner with Truva" footer form

create table if not exists partner_inquiries (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default now(),
  name        text        not null,
  company     text        not null,
  email       text        not null
);

-- RLS
alter table partner_inquiries enable row level security;

-- Anyone can submit an inquiry
create policy "Allow anonymous inserts"
  on partner_inquiries for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users can read (for internal review)
create policy "Allow authenticated reads"
  on partner_inquiries for select
  to authenticated
  using (true);
