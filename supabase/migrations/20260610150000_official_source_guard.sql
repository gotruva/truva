-- Official-source guard: Truva only publishes credit-card data traceable to
-- the issuer's own website. This registry + violations view makes that rule
-- queryable and part of the batch runbook (check the view before and after
-- every listing batch — it must always return zero rows).
--
-- Context: a 2026-06-10 audit found two PNB rows scraped from moneymax.ph
-- (a competitor comparison site). They are held with listed = false in
-- credit_card_overrides until re-scraped from pnb.com.ph.

create table public.official_source_domains (
  domain text primary key,
  bank text not null,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.official_source_domains is
  'Domains owned by banks/issuers that are acceptable as credit-card data sources. A live card whose source_url is outside this list is a policy violation (see credit_card_source_violations).';

alter table public.official_source_domains enable row level security;

insert into public.official_source_domains (domain, bank, notes) values
  ('www.bdo.com.ph', 'BDO Unibank', null),
  ('www.bpi.com.ph', 'Bank of the Philippine Islands', null),
  ('www.metrobank.com.ph', 'Metrobank', null),
  ('metrobankcard.com', 'Metrobank', 'Legacy Metrobank Card Corporation domain'),
  ('www.metrobankcard.com', 'Metrobank', 'Legacy Metrobank Card Corporation domain'),
  ('rcbccredit.com', 'RCBC', 'RCBC credit-card division site'),
  ('www.rcbccredit.com', 'RCBC', 'RCBC credit-card division site'),
  ('www.securitybank.com', 'Security Bank', null),
  ('online.aub.ph', 'Asia United Bank', null),
  ('www.aub.ph', 'Asia United Bank', null),
  ('www.chinabank.ph', 'Chinabank', null),
  ('www.eastwestbanker.com', 'EastWest Bank', null),
  ('www.hsbc.com.ph', 'HSBC Philippines', null),
  ('www.unionbankph.com', 'UnionBank of the Philippines', null),
  ('www.pnb.com.ph', 'Philippine National Bank', null),
  ('www.maybank.com.ph', 'Maybank Philippines', null),
  ('www.maybankpremierwealth.com', 'Maybank Philippines', 'Maybank premier segment site'),
  ('www.equicomsavings.com', 'Equicom Savings Bank', null);

-- Zero rows = compliant. Any row here is a card being shown publicly with a
-- source that is not the issuer's own website.
create view public.credit_card_source_violations as
select
  t.normalized_card_key,
  t.bank,
  t.source_url,
  substring(t.source_url from 'https?://([^/]+)') as source_domain
from public.truva_credit_cards t
where not exists (
  select 1 from public.official_source_domains d
  where d.domain = substring(t.source_url from 'https?://([^/]+)')
);

grant select on public.credit_card_source_violations to anon, authenticated, service_role;
