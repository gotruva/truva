# MMF Phase 3 n8n Automation Runbook

Phase 3 replaces manually seeded money market fund rate rows with daily n8n automation for the MVP scope:

- PHP UITFs from `uitf.com.ph`
- BTr 91-day Treasury bill benchmark updates
- Telegram health alerts after the daily scrape window

The public app contract stays unchanged. `/banking/money-market-funds` reads `public.mmf_current`, and n8n writes only to `public.mmf_daily_rates` and `public.benchmark_rates`.

## Repo artifacts

| Artifact | Purpose |
|---|---|
| `supabase/migrations/20260416_mmf_automation.sql` | Recreates the live MMF schema, seed fund metadata, `mmf_current` view, RLS policies, and helper RPCs. |
| `docs/n8n/mmf-uitf-daily.workflow.json` | Workflow 1: daily PHP UITF scrape and daily-rate upsert. |
| `docs/n8n/mmf-btr-benchmark.workflow.json` | Workflow 3: BTr benchmark scrape, benchmark upsert, and `vs_benchmark` recalculation. |
| `docs/n8n/mmf-health-check.workflow.json` | Workflow 5: daily health report and Telegram alert. |
| `scripts/verify-mmf-automation.ts` | Read-only local verification against Supabase. |

## Credentials

Keep all secrets in n8n credentials or n8n environment variables. Do not commit secret values.

Required n8n values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Telegram bot credential named `Truva Telegram Bot`
- `TELEGRAM_CHAT_ID`

The exported workflows use environment-variable expressions for Supabase headers and a Telegram credential placeholder. After import, confirm the Telegram node points at the real credential.

## Supabase setup

Apply the migration before enabling workflows in a new environment:

```bash
supabase db push
```

Or run `supabase/migrations/20260416_mmf_automation.sql` in the Supabase SQL editor.

Important objects:

- `money_market_funds`: static fund metadata. n8n must not mutate this table during MVP automation.
- `mmf_daily_rates`: daily NAVPU and yield rows. Workflow 1 writes here.
- `benchmark_rates`: benchmark rows. Workflow 3 writes here.
- `mmf_current`: frontend view used by `/banking/money-market-funds`.
- `recalculate_mmf_benchmark(requested_key text, requested_date date)`: refreshes `benchmark_rate` and `vs_benchmark`.
- `get_mmf_health_report(check_date date)`: returns missing/stale PHP UITF rows for Telegram.

## Workflow 1: PHP UITF daily scraper

Schedule: daily at 6:30 PM PHT.

Source:

```text
https://www.uitf.com.ph/top-funds.php?class_id=4&currency=PHP&radio1=yoy
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

- Match by `uitf_fund_id` when the source row exposes `fund_id`.
- Otherwise normalize names and match only against the explicit allowlist in the workflow Code node.
- Throw on unmatched source rows or unmatched target funds. Do not guess.

Yield math:

```text
gross_yield_1y = source 1Y return / 100
after_tax_yield = gross_yield_1y * 0.80
net_yield = after_tax_yield - trust_fee_pct
vs_benchmark = net_yield - latest BTR_91D benchmark rate
```

Writes:

- Upsert `mmf_daily_rates` on `(fund_id, date)`.
- Set `data_source = 'scraper'`.
- Use Asia/Manila date, not server-local date.

Manual test:

1. Run the workflow manually.
2. Confirm the transform node reports matched funds equal to active PHP UITF targets.
3. Confirm `mmf_daily_rates.data_source = 'scraper'` for today's PHP UITF rows.
4. Run:

```bash
npm run mmf:verify -- --require-scraper
```

## Workflow 3: BTr benchmark updater

Schedule: Mondays at 3:30 PM PHT.

Source:

```text
https://www.treasury.gov.ph/?cat=14
```

Behavior:

- Find the newest post that contains Treasury Bills Auction Results.
- Parse the 91-day weighted average accepted yield.
- Upsert `benchmark_rates` with `key = 'BTR_91D'`.
- Call `recalculate_mmf_benchmark('BTR_91D', today_pht)` after upsert.

Manual test:

1. Run manually after a BTr auction result is published.
2. Confirm one `benchmark_rates` row exists for `BTR_91D` and today's PHT date.
3. Confirm today's BTR-backed `mmf_daily_rates.vs_benchmark` values are updated.

## Workflow 5: Telegram health check

Schedule: daily at 8:00 PM PHT.

The workflow calls `get_mmf_health_report(today_pht)` and sends one Telegram message.

Alert conditions:

- `no_daily_row`: active PHP UITF target has no row for today.
- `missing_yield`: gross, after-tax, or net yield is null.
- `missing_benchmark`: benchmark rate or benchmark delta is null.
- `not_scraper`: row exists but is not scraper-sourced.

Expected message when healthy:

```text
Truva MMF health: OK
Date: YYYY-MM-DD
All active PHP UITF targets have scraper-sourced rows with yields and BTR_91D benchmark values.
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

App regression:

```bash
npx eslint app/banking/page.tsx app/banking/articles/page.tsx app/banking/money-market-funds/page.tsx components/mmf components/banking/BankPickCard.tsx lib/banking.ts lib/rates.ts types/index.ts
npm run build
```

## Rollout order

1. Apply the migration in the target Supabase project.
2. Import `mmf-btr-benchmark.workflow.json`; configure credentials; run manually.
3. Import `mmf-uitf-daily.workflow.json`; configure credentials; run manually.
4. Run `npm run mmf:verify -- --require-scraper`.
5. Import `mmf-health-check.workflow.json`; configure Telegram; run manually.
6. Enable the schedules only after all manual runs pass.

## Follow-up after MVP

- Workflow 2: individual bank-site and mutual-fund scrapers.
- Workflow 4: SOFR and US 90-day T-Bill updates for USD funds.
- Align homepage UITF cards with `mmf_current` instead of legacy `RateProduct` UITF rows.
- Replace the silent catch in `app/banking/money-market-funds/page.tsx` with logged server diagnostics if operational visibility is still thin after Telegram alerts.
