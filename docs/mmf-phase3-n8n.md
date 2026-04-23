# MMF Phase 3 n8n Automation Runbook

Phase 3 replaces manually seeded money market fund rate rows with daily n8n automation for the MVP scope:

- PHP UITFs from `uitf.com.ph`
- USD UITFs from `uitf.com.ph`
- ALFM and FAMI mutual-fund rows from PIFA, with ALFM cross-checks against BPI Wealth when both sources publish the same source date
- BTr 91-day Treasury bill benchmark updates
- NY Fed 90-day SOFR average updates for USD benchmark rows
- Telegram health alerts after the daily scrape window

The public app contract stays unchanged. `/banking/money-market-funds` reads `public.mmf_current`, and n8n writes only to `public.mmf_daily_rates` and `public.benchmark_rates`.

## Repo artifacts

| Artifact | Purpose |
|---|---|
| `supabase/migrations/20260416_mmf_automation.sql` | Recreates the live MMF schema, seed fund metadata, `mmf_current` view, RLS policies, and helper RPCs. |
| `supabase/migrations/20260422_mmf_source_accuracy.sql` | Widens rate precision, adds FAMI PIFA metadata, and updates health reporting for all active MMFs. |
| `docs/n8n/mmf-uitf-daily.workflow.json` | Workflow 1: daily PHP UITF scrape and daily-rate upsert. |
| `docs/n8n/mmf-uitf-daily-usd.workflow.json` | Workflow 1b: daily USD UITF scrape and daily-rate upsert. |
| `docs/n8n/mmf-bpi-wealth-mutual-daily.workflow.json` | Workflow 2: daily PIFA mutual-fund scrape and daily-rate upsert. |
| `docs/n8n/mmf-btr-benchmark.workflow.json` | Workflow 3: BTr benchmark scrape, benchmark upsert, and `vs_benchmark` recalculation. |
| `docs/n8n/mmf-us-benchmark.workflow.json` | Workflow 4: NY Fed 90-day SOFR average benchmark upsert and USD `vs_benchmark` recalculation. |
| `docs/n8n/mmf-btr-benchmark-manual.workflow.json` | Manual BTr fallback for cases where the BTr site blocks self-hosted n8n with Incapsula/WAF. |
| `docs/n8n/mmf-health-check.workflow.json` | Workflow 5: daily health report and Telegram alert. |
| `docs/n8n/*.inline-supabase.template.workflow.json` | Legacy quick-start templates. Prefer the canonical environment-variable workflows above because they include the source-date scraper fixes. |
| `scripts/verify-mmf-automation.ts` | Read-only local verification against Supabase. |

## Credentials

Keep all secrets in n8n credentials or n8n environment variables. Do not commit secret values.

Required n8n values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Telegram bot credential named `Truva Telegram Bot`
- Telegram chat ID entered in the `Send Telegram Alert` node

The exported workflows use environment-variable expressions for Supabase headers and a Telegram credential placeholder. After import, confirm the Telegram node points at the real credential and replace `REPLACE_WITH_TELEGRAM_CHAT_ID` with the destination chat ID.

n8n 2.x can block `$env` access when `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`. If the Supabase HTTP Request nodes fail with `access to env vars denied`, set `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` for the n8n instance and any task-runner container, then restart n8n. If you cannot allow env access, use the inline-template workflows and replace the Supabase placeholders inside n8n instead of committing secrets.

n8n 2.x Code nodes cannot make HTTP requests, so these workflows keep network calls in HTTP Request nodes and use Code nodes only for parsing, matching, and payload shaping.

The `*.inline-supabase.template.workflow.json` variants are kept for reference, but the canonical workflows are the environment-variable versions listed above. If a template is used for local experimentation, port the source-date changes first and replace these placeholders inside n8n before running:

- `https://REPLACE_WITH_SUPABASE_PROJECT.supabase.co`
- `REPLACE_WITH_SUPABASE_SERVICE_ROLE_KEY`
- `REPLACE_WITH_TELEGRAM_CHAT_ID` for the health-check workflow

Treat any workflow export that contains the real service-role key as secret material. Do not commit it back to the repo.

## Supabase setup

Apply the migration before enabling workflows in a new environment:

```bash
supabase db push
```

Or run `supabase/migrations/20260416_mmf_automation.sql` in the Supabase SQL editor.

Important objects:

- `money_market_funds`: static fund metadata. n8n must not mutate this table during MVP automation.
- `mmf_daily_rates`: daily NAVPU/NAVPS and yield rows. UITF and mutual-fund workflows write here.
- `benchmark_rates`: benchmark rows. Benchmark workflows write here.
- `mmf_current`: frontend view used by `/banking/money-market-funds`.
- `recalculate_mmf_benchmark(requested_key text, requested_date date)`: refreshes `benchmark_rate` and `vs_benchmark`.
- `get_mmf_health_report(check_date date)`: returns missing/stale/incomplete rows across all active MMFs for Telegram.

## Workflow 1: PHP UITF daily scraper

Schedule: daily at 6:30 PM PHT.

Source:

```text
https://www.uitf.com.ph/daily_navpu.php?bank_id=<provider_bank_id>
```

Scope:

```sql
select *
from money_market_funds
where is_active = true
  and currency = 'PHP'
  and fund_type = 'UITF'
  and navpu_source = 'uitf_com_ph';
```

Matching rules:

- Fetch the daily NAVPU page for each configured source bank ID.
- Match each fund by exact normalized provider row name from the workflow source map.
- Throw on unmatched source rows or unmatched target funds. Do not guess or fall back to top-funds ranking aliases.

Yield math:

```text
gross_yield_1y = source 1Y return / 100
after_tax_yield = gross_yield_1y * 0.80
net_yield = after_tax_yield - trust_fee_pct
vs_benchmark = net_yield - (latest BTR_91D benchmark rate * 0.80)
```

`trust_fee_pct` is stored as a decimal value. For example, 0.0050 means 0.50%. `benchmark_rates.rate` keeps the raw BTr auction rate, while `vs_benchmark` compares against the after-tax T-Bill benchmark so the public `vs T-Bill` column is tax-comparable.

Writes:

- Upsert `mmf_daily_rates` on `(fund_id, date)`.
- Set `data_source = 'scraper'`.
- Use the source page's `UITF NAVpus as of ...` date, not the workflow run date.

Manual test:

1. Run the workflow manually.
2. Confirm the transform node reports matched funds equal to active PHP UITF targets.
3. Confirm `mmf_daily_rates.data_source = 'scraper'` for the UITF source date.
4. Run:

```bash
npm run mmf:verify -- --require-scraper
```

## Workflow 1b: USD UITF daily scraper

Schedule: daily at 6:35 PM PHT.

Source and matching are the same as Workflow 1, except the target scope is active USD UITFs and `vs_benchmark` compares against the latest `US_TBILL_90D` benchmark without the PHP BTr tax adjustment.

## Workflow 2: PIFA mutual-fund scraper

Schedule: daily at 6:45 PM PHT.

Source:

```text
https://pifa.com.ph/facts-figures/
```

ALFM secondary cross-check:

```text
https://www.bpi.com.ph/group/bpiwealth/analyst-insights/investment-funds-monitor
```

Scope:

```sql
select *
from money_market_funds
where is_active = true
  and currency = 'PHP'
  and fund_type = 'Mutual Fund'
  and navpu_source = 'bank_website';
```

Yield math:

```text
gross_yield_1y = PIFA published 1-year return / 100
after_tax_yield = gross_yield_1y
net_yield = gross_yield_1y
vs_benchmark = net_yield - (latest BTR_91D benchmark rate * 0.80)
```

Mutual-fund published NAV-based one-year returns already reflect fund-level expenses, so this workflow must not apply the UITF `gross * 0.80 - trust_fee_pct` transform. If PIFA and BPI publish ALFM rows for the same source date, the workflow throws on any ALFM mismatch; if BPI lags by a date, PIFA remains the primary source.

## Workflow 3: BTr benchmark updater

Schedule: Mondays at 3:30 PM PHT.

Source:

```text
https://www.treasury.gov.ph/wp-content/uploads/YYYY/MM/Treasury-Bills-Auction-Results-on-DD-Month-YYYY.pdf
```

Behavior:

- Generate candidate official BTr PDF URLs for the latest Monday and the five prior Mondays.
- Try both official filename variants, with and without the trailing hyphen before `.pdf`.
- Download the first available PDF directly and extract text with n8n's Extract From File node.
- Parse the 91-day annual average accepted yield.
- Upsert `benchmark_rates` with `key = 'BTR_91D'` and the PDF auction date as the effective benchmark date.
- Call `recalculate_mmf_benchmark('BTR_91D', auction_date)` after upsert.

The direct-PDF approach avoids the BTr listing page, which can return `Request unsuccessful. Incapsula incident ID` to self-hosted n8n servers. If direct PDF downloads are also blocked, use `mmf-btr-benchmark-manual.workflow.json` or the inline Supabase template variant while moving the fetch to a different free runtime such as the deployed Next/Vercel app.

Manual test:

1. Run manually after a BTr auction result is published.
2. Confirm one `benchmark_rates` row exists for `BTR_91D` and the auction date.
3. Confirm same-date BTR-backed `mmf_daily_rates.vs_benchmark` values are updated.

## Workflow 4: US benchmark updater

Schedule: Tuesdays at 8:00 AM PHT.

Source:

```text
https://markets.newyorkfed.org/api/rates/all/latest.json
```

Behavior:

- Read the `SOFRAI.average90day` value and `SOFRAI.effectiveDate`.
- Upsert `US_TBILL_90D` using the NY Fed effective date, not the workflow run date.
- Call `recalculate_mmf_benchmark('US_TBILL_90D', effectiveDate)` after upsert.

## Workflow 5: Telegram health check

Schedule: daily at 8:00 PM PHT.

The workflow calls `get_mmf_health_report(today_pht)` and sends one Telegram message.

Alert conditions:

- `no_daily_row`: active MMF target has no current row.
- `stale_source_date`: latest row lags the current source-date group.
- `missing_yield`: gross, after-tax, or net yield is null.
- `missing_benchmark`: benchmark rate or benchmark delta is null.
- `missing_navpu`: NAVPU/NAVPS is null.
- `not_scraper`: row exists but is not scraper-sourced.

Expected message when healthy:

```text
Truva MMF health: OK
Date: YYYY-MM-DD
All active MMF rows have current source dates, NAVPU/NAVPS, yields, and benchmark comparisons.
```

Expected message when unhealthy:

```text
Truva MMF health: ACTION NEEDED
Date: YYYY-MM-DD
Issues: N
- Provider - Fund: issue_type - detail
```

## Verification commands

Pre-workflow read-only check:

```bash
npm run mmf:verify
```

Acceptance check after Workflow 1 is live:

```bash
npm run mmf:verify -- --require-scraper
```

Production frontend smoke check:

```bash
curl -sI https://www.gotruva.com/banking/money-market-funds
curl -sL https://www.gotruva.com/banking/money-market-funds | rg "as of|BDO Peso Money Market Fund|Net yield = ROI-YOY|published one-year NAV return"
```

The money-market-funds page must stay dynamic on Vercel:

- Keep `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` on `/banking/money-market-funds`.
- Confirm the production response has `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`.
- The table/card net-yield display must show each row's `rate_date` as `as of ...`.
- The banking overview must not call the preview "UITFs" only; the top PHP cards can be mutual funds.

App regression:

```bash
npx eslint app/banking/page.tsx app/banking/articles/page.tsx app/banking/money-market-funds/page.tsx components/mmf components/banking/BankPickCard.tsx lib/banking.ts lib/rates.ts types/index.ts
npm run build
```

## Regression guardrails

- UITF workflows must fetch `daily_navpu.php?bank_id=...`, not `top-funds.php`.
- UITF payload dates must come from the source page's `NAVpus as of ...` date, not from the workflow run date.
- UITF rows must include NAVPU/NAVPS; a `scraper` row with null NAVPU is not production-ready.
- PHP UITF workflows should have `Build Source Requests` and `Fetch UITF Provider Sources`; old copies with `Fetch UITF Source`, `today = phtDate()`, or `navpu: null` should be disabled or deleted.
- Mutual-fund rows use PIFA published one-year NAV return as net yield; do not apply UITF tax/trust-fee math to ALFM/FAMI.
- Health checks compare source freshness within provider/source groups. One provider can legitimately publish later than another.
- After any scraper, n8n, or schema edit, run the source-aware verifier and the health RPC before enabling schedules.

## Rollout order

1. Apply the migration in the target Supabase project.
2. Import `mmf-btr-benchmark.workflow.json`; configure credentials; run manually.
3. Import `mmf-us-benchmark.workflow.json`; configure credentials; run manually.
4. Import `mmf-uitf-daily.workflow.json`; configure credentials; run manually.
5. Import `mmf-uitf-daily-usd.workflow.json`; configure credentials; run manually.
6. Import `mmf-bpi-wealth-mutual-daily.workflow.json`; configure credentials; run manually.
7. Run `npm run mmf:verify -- --require-scraper`.
8. Import `mmf-health-check.workflow.json`; configure Telegram; run manually.
9. Enable the schedules only after all manual runs pass.

## Follow-up after MVP

- Individual bank-site and non-BPI mutual-fund scrapers.
- Align homepage UITF cards with `mmf_current` instead of legacy `RateProduct` UITF rows.
- Replace the silent catch in `app/banking/money-market-funds/page.tsx` with logged server diagnostics if operational visibility is still thin after Telegram alerts.
