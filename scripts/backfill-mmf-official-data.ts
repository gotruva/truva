import dotenv from 'dotenv';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  MUTUAL_FUND_PIFA_IDS,
  computeDailyRatePayload,
  fetchOfficialBenchmarks,
  fetchOfficialFundRates,
  formatPercent,
  type MmfFundForComputation,
} from './mmf-official-sources';

dotenv.config({ path: '.env.local' });
dotenv.config();

type FundRow = MmfFundForComputation & {
  navpu_source: string;
  is_active: boolean;
};

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function formatPayloadForLog(payload: ReturnType<typeof computeDailyRatePayload>, fund: FundRow) {
  return {
    slug: fund.slug,
    date: payload.date,
    navpu: payload.navpu,
    gross: formatPercent(payload.gross_yield_1y),
    net: formatPercent(payload.net_yield),
    benchmark: payload.benchmark_rate === null ? null : formatPercent(payload.benchmark_rate),
    vsBenchmark: payload.vs_benchmark === null ? null : formatPercent(payload.vs_benchmark),
    source: payload.data_source,
  };
}

async function main() {
  const apply = hasFlag('apply');
  const client = createSupabaseAdminClient('public');

  if (!client) {
    throw new Error('Missing Supabase admin environment variables.');
  }

  const { data: funds, error: fundsError } = await client
    .from('money_market_funds')
    .select('id, slug, name, provider, fund_type, currency, trust_fee_pct, benchmark_key, navpu_source, is_active')
    .eq('is_active', true)
    .returns<FundRow[]>();

  if (fundsError) throw fundsError;
  if (!funds?.length) throw new Error('No active money market funds found.');

  const [officialRates, officialBenchmarks] = await Promise.all([
    fetchOfficialFundRates(),
    fetchOfficialBenchmarks(),
  ]);

  const payloads = funds.map((fund) => {
    const official = officialRates.get(fund.slug);
    if (!official) throw new Error(`Missing official source rate for ${fund.slug}`);
    return computeDailyRatePayload(fund, official, officialBenchmarks, 'scraper');
  });

  console.table(payloads.map((payload) => {
    const fund = funds.find((item) => item.id === payload.fund_id);
    if (!fund) throw new Error(`Could not find fund for payload ${payload.fund_id}`);
    return formatPayloadForLog(payload, fund);
  }));

  console.log('Benchmarks:');
  console.table(officialBenchmarks.map((benchmark) => ({
    key: benchmark.key,
    date: benchmark.date,
    rate: formatPercent(benchmark.rate),
    source_url: benchmark.source_url,
  })));

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to write Supabase rows.');
    return;
  }

  const benchmarkRows = officialBenchmarks.map((benchmark) => ({
    key: benchmark.key,
    label: benchmark.label,
    date: benchmark.date,
    rate: benchmark.rate,
    source_url: benchmark.source_url,
  }));

  const { error: benchmarkError } = await client
    .from('benchmark_rates')
    .upsert(benchmarkRows, { onConflict: 'key,date' });

  if (benchmarkError) throw benchmarkError;

  const { error: ratesError } = await client
    .from('mmf_daily_rates')
    .upsert(payloads, { onConflict: 'fund_id,date' });

  if (ratesError) throw ratesError;

  for (const [slug, fundId] of Object.entries(MUTUAL_FUND_PIFA_IDS)) {
    const { error } = await client
      .from('money_market_funds')
      .update({ navpu_url: `https://pifa.com.ph/facts-figures/nav-history/?fund_id=${fundId}` })
      .eq('slug', slug);

    if (error) throw error;
  }

  for (const slug of Object.keys(MUTUAL_FUND_PIFA_IDS)) {
    const fund = funds.find((item) => item.slug === slug);
    const official = officialRates.get(slug);
    if (!fund || !official) continue;

    const { error } = await client
      .from('mmf_daily_rates')
      .delete()
      .eq('fund_id', fund.id)
      .lt('date', official.date)
      .in('data_source', ['manual', 'manual_verified_bpi_pifa']);

    if (error) throw error;
  }

  console.log(`Applied ${payloads.length} official MMF rows and ${benchmarkRows.length} benchmark rows.`);
}

main().catch((error) => {
  console.error('MMF official backfill failed:', error);
  process.exit(1);
});
