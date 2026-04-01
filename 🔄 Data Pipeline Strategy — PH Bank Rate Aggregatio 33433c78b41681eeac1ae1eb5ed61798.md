# 🔄 Data Pipeline Strategy — PH Bank Rate Aggregation

# The Core Reality: No Public APIs Exist in PH Banking

Philippine banks do not publish public APIs for rate data. Zero. Not Maya, not BDO, not BPI. The BSP has no centralized rate feed. The BTr has a website but no developer API.

This is fundamentally different from markets with Open Banking mandates (UK) or aggregation infrastructure (US/Plaid). There is no:

```
fetch('https://api.maya.ph/v1/rates')       // ❌ Does not exist
fetch('https://api.bsp.gov.ph/deposit-rates') // ❌ Does not exist
```

> **The fragmentation is the moat.** Because this is hard to build, competitors can't replicate it overnight. Once the pipeline is running reliably, Truva owns the only normalized, daily-updated PH financial rate dataset in existence.
> 

---

# What Data Actually Exists and How to Access It

| Source | Data Available | Access Method | Reliability |
| --- | --- | --- | --- |
| Maya, Tonik, GoTyme, UNO, CIMB | Savings rates | HTML scraping from marketing pages | High — pages are stable |
| BTr (Bureau of Treasury) | T-Bill auction results, RTB rates | Website data files | Medium — manual check needed |
| Pag-IBIG | MP2 annual dividend | PDF announcements | Low frequency (annual) |
| BSP | Aggregate sector data only | Published PDF reports | Not per-bank |
| UITF providers | NAVPS per fund | Per-fund provider pages | Scrapeable, one page per fund |
| DefiLlama | USDC/USDT yields on Aave, Morpho, Compound | **Free REST API, no key required** | Excellent — real-time |

---

# Pipeline Architecture

## Tier 1: Automated Scraping via n8n (Core Pipeline)

For all PH bank rates, web scraping is the industry-standard method — it's what every rate aggregator globally used before APIs existed. n8n (already in our stack) handles this with zero code:

```
Schedule trigger (daily 6AM Manila time)
  → HTTP Request node (fetch Maya savings page)
  → HTML Extract node (pull rate from DOM selector)
  → Set node (normalize to standard schema)
  → Supabase Upsert (rates table, keyed by bank + product + date)
```

One n8n workflow per bank. ~8 banks = ~8 workflows. Setup time: ~1 day. Then runs autonomously forever.

**Fragility risk:** Banks can change their HTML structure, breaking the parser. **Mitigation:** Monitor for null/unexpected values in Supabase and trigger a Slack/email alert. In practice, bank marketing pages are extremely stable — rates change but page structure rarely does.

## Tier 2: Manual + Scheduled Human Updates

Some data cannot be reliably automated at MVP stage:

| Data Source | Update Frequency | Method |
| --- | --- | --- |
| Pag-IBIG MP2 dividend | Once per year (announced Jan/Feb) | Manual update on announcement |
| RTBs | Varies — only when BTr opens a new tranche | Manual update on announcement |
| UITF NAVs | Daily | Scrapeable Month 2+ (one page per fund) |
| TD rates from traditional banks (BDO, BPI) | Occasionally | Manual check or bank branch call |
| SSS PESO Fund, GSIS programs | Annually | Manual |

**Honest assessment at launch:** ~60% of data automated, ~40% semi-manual. Manual maintenance takes ~2 hours/week and decreases as scraper coverage expands.

## Tier 3: DefiLlama API (The One Clean Pipeline)

This is the only real API in the stack — free, real-time, no authentication required:

```jsx
// DefiLlama API — free, no key, real-time
const res = await fetch('https://yields.llama.fi/pools')
const { data } = await res.json()

// Filter for PH-relevant products
const aaveBase = data.filter(p =>
  p.project === 'aave-v3' &&
  p.chain === 'Base' &&
  p.symbol === 'USDC'
)
// Returns: apyBase, apyMean30d, tvlUsd — updated live
```

Cover: USDC on Aave v3 (Base), Morpho, Compound. USDT on major audited protocols. This is Truva's unique differentiator — no PH tool plugs into this today.

---

# Supabase Data Schema (Core Tables)

```sql
-- Master rates table
create table rates (
  id uuid primary key default gen_random_uuid(),
  bank_slug text not null,          -- 'maya', 'tonik', 'uno'
  product_type text not null,       -- 'savings', 'td', 'defi', 'government'
  rate_pct decimal(6,4) not null,   -- 15.0000
  after_tax_rate decimal(6,4),      -- 12.0000 (rate * 0.8 for 20% FWT)
  conditions text,                  -- 'Requires ₱500-35K spend/month'
  balance_cap decimal(15,2),        -- max balance this rate applies to
  lock_in_days int,                 -- 0 = liquid
  pdic_covered boolean,
  currency text default 'PHP',
  updated_at timestamptz default now(),
  source_url text                   -- where we scraped it from
);

-- Rate change history (for historical API tier)
create table rate_history (
  id uuid primary key default gen_random_uuid(),
  bank_slug text not null,
  product_type text not null,
  rate_pct decimal(6,4) not null,
  recorded_at timestamptz default now()
);
```

---

# Build Sequence

| Phase | Timing | Action |
| --- | --- | --- |
| **Manual seed** | Week 1 | Manually populate Supabase with current rates for top 8 digital banks. Don't over-engineer before you have users. |
| **Core scrapers** | Week 3–4 | n8n workflows for Maya, Tonik, UNO, GoTyme, CIMB. Automate what changes most often. |
| **DeFi integration** | Week 3–4 | DefiLlama API call on page load or daily cron. Easiest pipeline in the stack. |
| **Gov't + UITFs** | Month 2 | BTr T-Bill data, NAVPS scrapers per UITF fund. |
| **Full automation** | Month 3+ | Rate change detection triggers email alerts. n8n monitors for null values and alerts on scraper failure. |

---

# The Strategic Implication: Data-First Architecture

Build the entire data pipeline with **API-first architecture** from Day 1, even if the public API isn't live until Month 12. Every scraper, every rate update, every after-tax calculation should be a discrete internal endpoint. The consumer UI just calls our own internal API.

This means:

- The consumer product and the future B2B API share the same data infrastructure — zero additional build cost
- Rate change detection, historical tracking, and alerting are natural byproducts of the pipeline
- When the public API launches, it's a matter of adding authentication and rate limiting to existing endpoints — not rebuilding anything

**The CoinGecko parallel:** CoinGecko's moat is not the data itself — it's being the developer standard. Once other apps call `api.truva.ph/v1/rates`, switching requires rebuilding integrations. The free widget (Month 3) creates this dependency before we ask for money.

---

*Added: April 2026 | Source: Data pipeline strategy session*