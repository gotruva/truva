-- Credit cards table
-- Source of truth for all Philippine credit card products.
-- The scraper (scripts/scrape-cards.ts) writes here after updating data/credit-cards.json.
-- The Next.js app reads from the JSON file at build time (SSG); Supabase is used for
-- future admin features (sponsored placement management, affiliate URL updates, etc.)

create table if not exists credit_cards (
  id                          text        primary key,
  name                        text        not null,
  provider                    text        not null,
  logo                        text        not null,
  category                    text        not null default 'credit-cards',
  annual_fee                  integer     not null,
  annual_fee_waiver_condition text,
  monthly_interest_rate       numeric     not null,
  reward_type                 text        not null,
  minimum_monthly_income      integer     not null,
  welcome_promo               text,
  perks                       jsonb       not null default '[]',
  best_for                    text,
  pros                        jsonb       not null default '[]',
  cons                        jsonb       not null default '[]',
  faqs                        jsonb       not null default '[]',
  eligibility_summary         text,
  editor_verdict              text,
  is_sponsored                boolean     not null default false,
  sponsored_disclosure        text,
  affiliate_url               text        not null default '',
  palago_score                integer     not null default 3,
  scraped_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Indexes
create index if not exists credit_cards_provider_idx   on credit_cards(provider);
create index if not exists credit_cards_reward_type_idx on credit_cards(reward_type);
create index if not exists credit_cards_updated_at_idx  on credit_cards(updated_at);

-- Auto-update updated_at on row change
create or replace function update_credit_cards_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger credit_cards_updated_at
  before update on credit_cards
  for each row execute function update_credit_cards_updated_at();

-- RLS
alter table credit_cards enable row level security;

-- Public read (used by any future dynamic fetch)
create policy "Public read"
  on credit_cards for select
  to anon, authenticated
  using (true);

-- Only service role (scraper) can write
create policy "Service role write"
  on credit_cards for all
  to service_role
  using (true)
  with check (true);
