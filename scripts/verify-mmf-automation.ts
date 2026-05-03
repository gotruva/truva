import assert from 'assert';

import dotenv from 'dotenv';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  computeDailyRatePayload,
  fetchOfficialBenchmarks,
  fetchOfficialFundRates,
  formatPercent,
  type DailyRatePayload,
  type MmfFundForComputation,
  type OfficialBenchmarkRate,
} from './mmf-official-sources';

dotenv.config({ path: '.env.local' });
dotenv.config();

type FundRow = MmfFundForComputation & {
  navpu_source: string;
  is_active: boolean;
};

type CurrentRow = FundRow & {
  rate_date: string | null;
  navpu: number | null;
  gross_yield_1y: number | null;
  after_tax_yield: number | null;
  net_yield: number | null;
  benchmark_date: string | null;
  benchmark_rate: number | null;
  vs_benchmark: number | null;
  data_source: string | null;
};

type BenchmarkRow = {
  key: string;
  label?: string;
  date: string;
  rate: number;
  source_url: string | null;
};

function getArgValue(name: string): string | null {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function isCloseTo(left: number | null | undefined, right: number | null | undefined, tolerance = 0.00005) {
  if (left === null || left === undefined || right === null || right === undefined) return false;
  return Math.abs(Number(left) - Number(right)) <= tolerance;
}

function formatIssue(row: CurrentRow, issue: string) {
  return `${row.provider} - ${row.name}: ${issue}`;
}

function compareRateFields(row: CurrentRow, expected: DailyRatePayload) {
  const issues: string[] = [];

  if (row.rate_date !== expected.date) {
    issues.push(`source date ${row.rate_date ?? 'missing'} should be ${expected.date}`);
  }

  if (!isCloseTo(row.navpu, expected.navpu, 0.0005)) {
    issues.push(`NAVPU ${row.navpu ?? 'missing'} should be ${expected.navpu}`);
  }

  if (!isCloseTo(row.gross_yield_1y, expected.gross_yield_1y)) {
    issues.push(`gross ${row.gross_yield_1y ?? 'missing'} should be ${expected.gross_yield_1y}`);
  }

  if (!isCloseTo(row.after_tax_yield, expected.after_tax_yield)) {
    issues.push(`after-tax ${row.after_tax_yield ?? 'missing'} should be ${expected.after_tax_yield}`);
  }

  if (!isCloseTo(row.net_yield, expected.net_yield)) {
    issues.push(`net ${row.net_yield ?? 'missing'} should be ${expected.net_yield}`);
  }

  if (row.benchmark_date !== expected.benchmark_date) {
    issues.push(`benchmark date ${row.benchmark_date ?? 'missing'} should be ${expected.benchmark_date ?? 'null'}`);
  }

  if (!isCloseTo(row.benchmark_rate, expected.benchmark_rate)) {
    issues.push(`benchmark ${row.benchmark_rate ?? 'missing'} should be ${expected.benchmark_rate}`);
  }

  if (!isCloseTo(row.vs_benchmark, expected.vs_benchmark)) {
    issues.push(`vs_benchmark ${row.vs_benchmark ?? 'missing'} should be ${expected.vs_benchmark}`);
  }

  return issues;
}

async function loadBenchmarkHistory(
  client: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  officialBenchmarks: OfficialBenchmarkRate[],
) {
  const keys = [...new Set(officialBenchmarks.map((benchmark) => benchmark.key))];
  const { data, error } = await client
    .from('benchmark_rates')
    .select('key, label, date, rate, source_url')
    .in('key', keys)
    .returns<BenchmarkRow[]>();

  assert(!error, `Failed to load benchmark history: ${error?.message}`);

  const byKeyDate = new Map<string, OfficialBenchmarkRate>();
  for (const row of data ?? []) {
    byKeyDate.set(`${row.key}:${row.date}`, {
      key: row.key,
      label: row.label ?? row.key,
      date: row.date,
      rate: Number(row.rate),
      source_url: row.source_url ?? '',
    });
  }

  for (const benchmark of officialBenchmarks) {
    byKeyDate.set(`${benchmark.key}:${benchmark.date}`, benchmark);
  }

  return [...byKeyDate.values()];
}

async function main() {
  const client = createSupabaseAdminClient('public');
  if (!client) {
    console.log('Skipping MMF automation verification because Supabase admin environment variables are not configured.');
    return;
  }

  const requiredDate = getArgValue('date');
  const requireScraper = process.argv.includes('--require-scraper');

  const tableNames = ['money_market_funds', 'mmf_daily_rates', 'benchmark_rates', 'mmf_current'] as const;
  for (const tableName of tableNames) {
    const { count, error } = await client.from(tableName).select('*', { count: 'exact', head: true });
    assert(!error, `${tableName} is not readable: ${error?.message}`);
    assert(typeof count === 'number' && count > 0, `${tableName} should contain rows.`);
    console.log(`${tableName}: ${count} rows`);
  }

  const [{ data: funds, error: fundsError }, { data: currentRows, error: currentError }] = await Promise.all([
    client
      .from('money_market_funds')
      .select('id, slug, name, provider, fund_type, currency, trust_fee_pct, benchmark_key, navpu_source, is_active')
      .eq('is_active', true)
      .returns<FundRow[]>(),
    client
      .from('mmf_current')
      .select('id, slug, name, provider, fund_type, currency, trust_fee_pct, benchmark_key, rate_date, navpu, gross_yield_1y, after_tax_yield, net_yield, benchmark_date, benchmark_rate, vs_benchmark, data_source')
      .returns<CurrentRow[]>(),
  ]);

  assert(!fundsError, `Failed to load MMF fund targets: ${fundsError?.message}`);
  assert(!currentError, `Failed to load mmf_current: ${currentError?.message}`);
  assert(funds && funds.length > 0, 'Expected active MMF fund targets.');
  assert(currentRows && currentRows.length > 0, 'Expected mmf_current rows.');

  const [officialRates, officialBenchmarks] = await Promise.all([
    fetchOfficialFundRates(),
    fetchOfficialBenchmarks(),
  ]);
  const benchmarkHistory = await loadBenchmarkHistory(client, officialBenchmarks);

  const currentBySlug = new Map(currentRows.map((row) => [row.slug, row]));
  const issues: string[] = [];
  const sourceSummary: Array<Record<string, string | number | null>> = [];

  for (const fund of funds) {
    const official = officialRates.get(fund.slug);
    const current = currentBySlug.get(fund.slug);

    if (!official) {
      issues.push(`${fund.provider} - ${fund.name}: missing official source mapping`);
      continue;
    }

    if (!current) {
      issues.push(`${fund.provider} - ${fund.name}: missing mmf_current row`);
      continue;
    }

    if (requiredDate && official.date !== requiredDate) {
      issues.push(`${fund.provider} - ${fund.name}: official source date ${official.date} does not match requested --date=${requiredDate}`);
    }

    const expected = computeDailyRatePayload(fund, official, benchmarkHistory, 'scraper');
    for (const issue of compareRateFields(current, expected)) {
      issues.push(formatIssue(current, issue));
    }

    if (requireScraper && current.data_source !== 'scraper') {
      issues.push(formatIssue(current, `data_source ${current.data_source ?? 'missing'} should be scraper`));
    }

    sourceSummary.push({
      slug: fund.slug,
      source_date: official.date,
      navpu: official.navpu,
      gross: formatPercent(official.grossYield),
      expected_net: formatPercent(expected.net_yield),
      db_date: current.rate_date,
      db_net: current.net_yield === null ? null : formatPercent(current.net_yield),
      benchmark_date: current.benchmark_date,
      data_source: current.data_source,
    });
  }

  const { data: benchmarkRows, error: benchmarkError } = await client
    .from('benchmark_rates')
    .select('key, date, rate, source_url')
    .in('key', officialBenchmarks.map((benchmark) => benchmark.key))
    .returns<BenchmarkRow[]>();

  assert(!benchmarkError, `Failed to load benchmark rows: ${benchmarkError?.message}`);
  const benchmarkByKeyDate = new Map((benchmarkRows ?? []).map((row) => [`${row.key}:${row.date}`, row]));

  for (const benchmark of officialBenchmarks) {
    const dbBenchmark = benchmarkByKeyDate.get(`${benchmark.key}:${benchmark.date}`);
    if (!dbBenchmark) {
      issues.push(`${benchmark.key}: missing benchmark row for ${benchmark.date}`);
      continue;
    }

    if (!isCloseTo(dbBenchmark.rate, benchmark.rate)) {
      issues.push(`${benchmark.key}: benchmark rate ${dbBenchmark.rate} should be ${benchmark.rate}`);
    }
  }

  console.table(sourceSummary);

  assert.equal(
    issues.length,
    0,
    `MMF source verification failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`,
  );

  console.log(
    `MMF automation verification passed: ${funds.length} funds matched official sources and benchmark rows.`,
  );
}

main().catch((error) => {
  console.error('MMF automation verification failed:', error);
  process.exit(1);
});
