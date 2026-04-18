import assert from 'assert';

import dotenv from 'dotenv';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

interface MmfFundRow {
  id: string;
  slug: string;
  name: string;
  provider: string;
}

interface MmfDailyRateRow {
  fund_id: string;
  date: string;
  gross_yield_1y: number | null;
  after_tax_yield: number | null;
  net_yield: number | null;
  benchmark_rate: number | null;
  vs_benchmark: number | null;
  data_source: string | null;
}

function getArgValue(name: string): string | null {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function getPhtDate(value = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);

  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get('year')}-${byType.get('month')}-${byType.get('day')}`;
}

function formatFundList(funds: MmfFundRow[]) {
  return funds.map((fund) => `${fund.provider} - ${fund.name}`).join('; ');
}

function isCloseTo(left: number, right: number) {
  return Math.abs(left - right) < 0.000001;
}

async function main() {
  const client = createSupabaseAdminClient('public');
  if (!client) {
    console.log('Skipping MMF automation verification because Supabase admin environment variables are not configured.');
    return;
  }

  const checkDate = getArgValue('date') ?? getPhtDate();
  const requireScraper = process.argv.includes('--require-scraper');

  const tableNames = ['money_market_funds', 'mmf_daily_rates', 'benchmark_rates', 'mmf_current'] as const;
  for (const tableName of tableNames) {
    const { count, error } = await client.from(tableName).select('*', { count: 'exact', head: true });
    assert(!error, `${tableName} is not readable: ${error?.message}`);
    assert(typeof count === 'number' && count > 0, `${tableName} should contain rows.`);
    console.log(`${tableName}: ${count} rows`);
  }

  const { data: funds, error: fundsError } = await client
    .from('money_market_funds')
    .select('id, slug, name, provider, currency, benchmark_key')
    .eq('is_active', true)
    .in('currency', ['PHP', 'USD'])
    .eq('fund_type', 'UITF')
    .eq('navpu_source', 'uitf_com_ph')
    .returns<(MmfFundRow & { currency: string, benchmark_key: string })[]>();

  assert(!fundsError, `Failed to load MMF automation targets: ${fundsError?.message}`);
  assert(funds && funds.length > 0, 'Expected at least one active UITF automation target.');

  const fundIds = funds.map((fund) => fund.id);
  const { data: rows, error: ratesError } = await client
    .from('mmf_daily_rates')
    .select('fund_id, date, gross_yield_1y, after_tax_yield, net_yield, benchmark_rate, vs_benchmark, data_source')
    .eq('date', checkDate)
    .in('fund_id', fundIds)
    .returns<MmfDailyRateRow[]>();

  assert(!ratesError, `Failed to load MMF daily rows for ${checkDate}: ${ratesError?.message}`);

  const rowByFundId = new Map((rows ?? []).map((row) => [row.fund_id, row]));
  const missingFunds = funds.filter((fund) => !rowByFundId.has(fund.id));
  assert.equal(
    missingFunds.length,
    0,
    `Missing ${checkDate} MMF daily rows for: ${formatFundList(missingFunds)}`,
  );

  const invalidYieldFunds = funds.filter((fund) => {
    const row = rowByFundId.get(fund.id);
    return !row || row.gross_yield_1y === null || row.after_tax_yield === null || row.net_yield === null;
  });
  assert.equal(
    invalidYieldFunds.length,
    0,
    `Missing yield values for: ${formatFundList(invalidYieldFunds)}`,
  );

  const invalidBenchmarkFunds = funds.filter((fund) => {
    const row = rowByFundId.get(fund.id);
    return !row || row.benchmark_rate === null || row.vs_benchmark === null;
  });
  assert.equal(
    invalidBenchmarkFunds.length,
    0,
    `Missing benchmark values for: ${formatFundList(invalidBenchmarkFunds)}`,
  );

  const manualFunds = funds.filter((fund) => rowByFundId.get(fund.id)?.data_source !== 'scraper');
  if (requireScraper) {
    assert.equal(
      manualFunds.length,
      0,
      `Rows must be scraper-sourced before acceptance. Still manual/stale: ${formatFundList(manualFunds)}`,
    );
  } else if (manualFunds.length > 0) {
    console.warn(
      `Warning: ${manualFunds.length} UITF rows are not scraper-sourced yet. Run with --require-scraper after n8n is live.`,
    );
  }

  // Load benchmarks
  const { data: benchmarksData, error: benchmarkError } = await client
    .from('benchmark_rates')
    .select('key, date, rate')
    .in('key', ['BTR_91D', 'US_TBILL_90D'])
    .lte('date', checkDate)
    .order('date', { ascending: false });

  assert(!benchmarkError, `Failed to load benchmarks: ${benchmarkError?.message}`);
  
  const benchmarks = benchmarksData || [];
  const btr = benchmarks.find((b) => b.key === 'BTR_91D');
  const usd = benchmarks.find((b) => b.key === 'US_TBILL_90D');
  
  if (funds.some(f => f.benchmark_key === 'BTR_91D')) {
    assert(btr, `Missing BTR_91D benchmark on or before ${checkDate}.`);
  }
  if (funds.some(f => f.benchmark_key === 'US_TBILL_90D')) {
    assert(usd, `Missing US_TBILL_90D benchmark on or before ${checkDate}.`);
  }

  const incorrectBenchmarkDeltaFunds = funds.filter((fund) => {
    const row = rowByFundId.get(fund.id);
    if (!row || row.net_yield === null || row.vs_benchmark === null) return true;
    
    const benchmark = fund.benchmark_key === 'BTR_91D' ? btr : usd;
    if (!benchmark) return true;
    
    // Remember: BTR is fully taxable so we *0.8. USD might follow different tax structures, but typically BTR is 0.8
    const taxAdjustedRate = fund.benchmark_key === 'BTR_91D' ? benchmark.rate * 0.8 : benchmark.rate;
    return !isCloseTo(row.vs_benchmark, row.net_yield - taxAdjustedRate);
  });
  
  assert.equal(
    incorrectBenchmarkDeltaFunds.length,
    0,
    `Benchmark delta should compare net yield against the correct tax-adjusted benchmark rate. Check: ${formatFundList(incorrectBenchmarkDeltaFunds)}`,
  );

  console.log(
    `MMF automation verification passed for ${checkDate}: ${funds.length} targets verified.`,
  );
}

main().catch((error) => {
  console.error('MMF automation verification failed:', error);
  process.exit(1);
});
