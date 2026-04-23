export type MmfCurrency = 'PHP' | 'USD';
export type MmfFundType = 'UITF' | 'Mutual Fund';

export interface MmfFundForComputation {
  id: string;
  slug: string;
  name: string;
  provider: string;
  fund_type: MmfFundType;
  currency: MmfCurrency;
  trust_fee_pct: number | null;
  benchmark_key: string | null;
}

export interface OfficialFundRate {
  slug: string;
  sourceName: string;
  sourceUrl: string;
  date: string;
  navpu: number;
  grossYield: number;
  source: 'uitf_com_ph' | 'pifa';
}

export interface OfficialBenchmarkRate {
  key: string;
  label: string;
  date: string;
  rate: number;
  source_url: string;
}

export interface DailyRatePayload {
  fund_id: string;
  date: string;
  navpu: number;
  gross_yield_1y: number;
  after_tax_yield: number;
  net_yield: number;
  benchmark_rate: number | null;
  vs_benchmark: number | null;
  data_source: string;
}

interface UitfSourceConfig {
  bankId: number;
  currency: MmfCurrency;
  sourceName: string;
}

interface ParsedUitfRow {
  sourceDate: string;
  sourceUrl: string;
  sourceName: string;
  navpu: number;
  grossYield: number;
}

const UITF_BASE_URL = 'https://www.uitf.com.ph/daily_navpu.php';
const PIFA_URL = 'https://pifa.com.ph/facts-figures/';
const BPI_MONITOR_URL = 'https://www.bpi.com.ph/group/bpiwealth/analyst-insights/investment-funds-monitor';

export const BTR_91D_OFFICIAL_RATE: OfficialBenchmarkRate = {
  key: 'BTR_91D',
  label: '91-day T-Bill (BTr auction)',
  date: '2026-04-20',
  rate: 0.04542,
  source_url: 'https://www.treasury.gov.ph/wp-content/uploads/2026/04/Treasury-Bills-Auction-Results-on-20-April-2026-.pdf',
};

export const UITF_SOURCE_CONFIG: Record<string, UitfSourceConfig> = {
  'atram-peso-money-market-fund': {
    bankId: 31,
    currency: 'PHP',
    sourceName: 'ATRAM Peso Money Market Fund (A Unit Class)',
  },
  'bdo-peso-money-market-fund': {
    bankId: 6,
    currency: 'PHP',
    sourceName: 'BDO PESO MONEY MARKET FUND',
  },
  'bpi-money-market-fund': {
    bankId: 3,
    currency: 'PHP',
    sourceName: 'BPI MONEY MARKET FUND',
  },
  'chinabank-cash-fund': {
    bankId: 7,
    currency: 'PHP',
    sourceName: 'CHINABANK CASH FUND',
  },
  'chinabank-money-market-fund': {
    bankId: 7,
    currency: 'PHP',
    sourceName: 'CHINABANK MONEY MARKET FUND',
  },
  'dbp-unlad-panimula-mmf-class-iii': {
    bankId: 26,
    currency: 'PHP',
    sourceName: 'CLASS III - UNLAD PANIMULA MM FUND',
  },
  'eastwest-peso-money-market-fund': {
    bankId: 8,
    currency: 'PHP',
    sourceName: 'EastWest Peso Money Market Fund',
  },
  'landbank-money-market-plus-fund': {
    bankId: 9,
    currency: 'PHP',
    sourceName: 'LANDBANK Money Market Plus Fund',
  },
  'manulife-money-market-fund-class-a': {
    bankId: 39,
    currency: 'PHP',
    sourceName: 'Manulife Money Market Fund (Class A)',
  },
  'metro-money-market-fund': {
    bankId: 1,
    currency: 'PHP',
    sourceName: 'Metro Money Market Fund',
  },
  'pnb-prestige-peso-money-market-fund': {
    bankId: 2,
    currency: 'PHP',
    sourceName: 'PNB PRESTIGE PESO MONEY MARKET FUND (Formerly PNB Peso Fixed Income Fund)',
  },
  'psbank-money-market-fund': {
    bankId: 32,
    currency: 'PHP',
    sourceName: 'PSBANK MONEY MARKET FUND',
  },
  'rcbc-peso-money-market-fund': {
    bankId: 11,
    currency: 'PHP',
    sourceName: 'RCBC PESO MONEY MARKET FUND',
  },
  'sb-peso-cash-management-fund': {
    bankId: 12,
    currency: 'PHP',
    sourceName: 'SB PESO CASH MANAGEMENT FUND',
  },
  'sb-peso-money-market-fund': {
    bankId: 12,
    currency: 'PHP',
    sourceName: 'SB PESO MONEY MARKET FUND',
  },
  'bdo-dollar-money-market-fund': {
    bankId: 6,
    currency: 'USD',
    sourceName: 'BDO DOLLAR MONEY MARKET FUND',
  },
  'chinabank-dollar-cash-fund': {
    bankId: 7,
    currency: 'USD',
    sourceName: 'CHINABANK DOLLAR CASH FUND',
  },
  'landbank-us-dollar-money-market-fund': {
    bankId: 9,
    currency: 'USD',
    sourceName: 'LANDBANK US$ Money Market Fund',
  },
  'metro-dollar-money-market-fund': {
    bankId: 1,
    currency: 'USD',
    sourceName: 'Metro$ Money Market Fund',
  },
  'pnb-prime-dollar-money-market-fund': {
    bankId: 2,
    currency: 'USD',
    sourceName: 'PNB PRIME DOLLAR MONEY MARKET FUND',
  },
};

export const MUTUAL_FUND_PIFA_IDS: Record<string, number> = {
  'alfm-money-market-fund-shares': 69,
  'alfm-money-market-fund-units': 120,
  'fami-save-and-learn-money-market-fund': 70,
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#34;|&quot;/g, '"');
}

export function stripHtml(value: string) {
  return decodeHtml(value)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeFundName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\$/g, ' dollar ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSourceDate(value: string) {
  const match = value.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!match) return null;

  const monthByName: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    dec: '12',
  };

  const month = monthByName[match[1].slice(0, 3).toLowerCase()];
  if (!month) return null;

  return `${match[3]}-${month}-${match[2].padStart(2, '0')}`;
}

function parsePifaDate(text: string) {
  const match = text.match(/As of\s+(\d{2})\/(\d{2})\/(\d{4})/i);
  if (!match) throw new Error('Could not find PIFA source date.');
  return `${match[3]}-${match[1]}-${match[2]}`;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; TruvaMMF/1.0)' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

function parseUitfProviderPage(html: string, bankId: number) {
  const sourceUrl = `${UITF_BASE_URL}?bank_id=${bankId}`;
  const text = stripHtml(html);
  const dateLabel = text.match(/NAVpus\) as of ([A-Za-z]+ \d{1,2}, \d{4})/i)?.[1];
  const sourceDate = dateLabel ? parseSourceDate(dateLabel) : null;

  if (!sourceDate) {
    throw new Error(`Could not find UITF source date for bank_id=${bankId}.`);
  }

  const rows = [...html.matchAll(/<tr[\s\S]*?<\/tr>/gi)]
    .map((match) => match[0].replace(/<!--[\s\S]*?-->/g, ' '))
    .map((row) => {
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
        .map((match) => stripHtml(match[1]))
        .filter(Boolean);

      if (cells.length < 4) return null;

      const numericCells = cells
        .slice(1)
        .map((cell) => parseNumber(cell))
        .filter((value): value is number => value !== null);

      if (numericCells.length < 3) return null;

      return {
        sourceDate,
        sourceUrl,
        sourceName: cells[0],
        navpu: numericCells[0],
        grossYield: numericCells[1] / 100,
      };
    })
    .filter((row): row is ParsedUitfRow => Boolean(row));

  return rows;
}

export async function fetchOfficialUitfRates(slugs?: string[]) {
  const wantedSlugs = new Set(slugs ?? Object.keys(UITF_SOURCE_CONFIG));
  const configs = Object.entries(UITF_SOURCE_CONFIG).filter(([slug]) => wantedSlugs.has(slug));
  const uniqueBankIds = [...new Set(configs.map(([, config]) => config.bankId))];
  const rowsByBankId = new Map<number, ParsedUitfRow[]>();

  await Promise.all(
    uniqueBankIds.map(async (bankId) => {
      const html = await fetchText(`${UITF_BASE_URL}?bank_id=${bankId}`);
      rowsByBankId.set(bankId, parseUitfProviderPage(html, bankId));
    }),
  );

  const rates = new Map<string, OfficialFundRate>();
  const missing: string[] = [];

  for (const [slug, config] of configs) {
    const rows = rowsByBankId.get(config.bankId) ?? [];
    const sourceRow = rows.find((row) => normalizeFundName(row.sourceName) === normalizeFundName(config.sourceName));

    if (!sourceRow) {
      missing.push(`${slug}: ${config.sourceName}`);
      continue;
    }

    rates.set(slug, {
      slug,
      sourceName: sourceRow.sourceName,
      sourceUrl: sourceRow.sourceUrl,
      date: sourceRow.sourceDate,
      navpu: sourceRow.navpu,
      grossYield: sourceRow.grossYield,
      source: 'uitf_com_ph',
    });
  }

  if (missing.length) {
    throw new Error(`Missing UITF source rows: ${missing.join('; ')}`);
  }

  return rates;
}

function readPifaMutualRow(text: string, pattern: RegExp, slug: string, date: string) {
  const match = text.match(pattern);
  if (!match) {
    throw new Error(`Could not find PIFA mutual-fund row for ${slug}.`);
  }

  return {
    slug,
    sourceName: match[1],
    sourceUrl: PIFA_URL,
    date,
    navpu: Number(match[2].replace(/,/g, '')),
    grossYield: Number(match[3]) / 100,
    source: 'pifa' as const,
  };
}

export async function fetchBpiAlfmCrossCheck() {
  const text = stripHtml(await fetchText(BPI_MONITOR_URL));
  const dateLabel = text.match(/Investment Funds Daily Monitor data as of ([A-Za-z]+ \d{1,2}, \d{4})/i)?.[1];
  const date = dateLabel ? parseSourceDate(dateLabel) : null;
  const matches = [...text.matchAll(/(ALFM Money Market Fund(?: \(Units\))?)\s+([\d,.]+)\s+-?\d+(?:\.\d+)?%\s+-?\d+(?:\.\d+)?%\s+(-?\d+(?:\.\d+)?)%/gi)];

  if (matches.length < 2) {
    throw new Error('Could not parse ALFM rows from BPI Investment Funds Monitor.');
  }

  return {
    date,
    rows: new Map<string, { navpu: number; grossYield: number }>([
      [
        'alfm-money-market-fund-shares',
        { navpu: Number(matches[0][2].replace(/,/g, '')), grossYield: Number(matches[0][3]) / 100 },
      ],
      [
        'alfm-money-market-fund-units',
        { navpu: Number(matches[1][2].replace(/,/g, '')), grossYield: Number(matches[1][3]) / 100 },
      ],
    ]),
  };
}

export async function fetchOfficialMutualFundRates({ crossCheckAlfm = true } = {}) {
  const text = stripHtml(await fetchText(PIFA_URL));
  const date = parsePifaDate(text);
  const alfmRows = [...text.matchAll(/(ALFM Money Market Fund, Inc\.)\s+([\d,.]+)\s+(-?\d+(?:\.\d+)?)%/gi)];

  if (alfmRows.length < 2) {
    throw new Error('Could not parse both ALFM PIFA rows.');
  }

  const rates = new Map<string, OfficialFundRate>([
    [
      'alfm-money-market-fund-shares',
      {
        slug: 'alfm-money-market-fund-shares',
        sourceName: alfmRows[0][1],
        sourceUrl: PIFA_URL,
        date,
        navpu: Number(alfmRows[0][2].replace(/,/g, '')),
        grossYield: Number(alfmRows[0][3]) / 100,
        source: 'pifa',
      },
    ],
    [
      'alfm-money-market-fund-units',
      {
        slug: 'alfm-money-market-fund-units',
        sourceName: `${alfmRows[1][1]} (Units)`,
        sourceUrl: PIFA_URL,
        date,
        navpu: Number(alfmRows[1][2].replace(/,/g, '')),
        grossYield: Number(alfmRows[1][3]) / 100,
        source: 'pifa',
      },
    ],
    [
      'fami-save-and-learn-money-market-fund',
      readPifaMutualRow(
        text,
        /(First Metro Save and Learn Money Market Fund, Inc\.)\s+([\d,.]+)\s+(-?\d+(?:\.\d+)?)%/i,
        'fami-save-and-learn-money-market-fund',
        date,
      ),
    ],
  ]);

  if (crossCheckAlfm) {
    const bpiCrossCheck = await fetchBpiAlfmCrossCheck();
    for (const slug of ['alfm-money-market-fund-shares', 'alfm-money-market-fund-units'] as const) {
      const pifa = rates.get(slug);
      const bpi = bpiCrossCheck.rows.get(slug);
      if (!pifa || !bpi) throw new Error(`Missing ALFM cross-check row for ${slug}.`);
      if (bpiCrossCheck.date !== pifa.date) continue;
      if (Math.abs(pifa.navpu - bpi.navpu) > 0.0001 || Math.abs(pifa.grossYield - bpi.grossYield) > 0.000001) {
        throw new Error(`ALFM cross-check mismatch for ${slug}: PIFA ${pifa.navpu}/${pifa.grossYield}, BPI ${bpi.navpu}/${bpi.grossYield}`);
      }
    }
  }

  return rates;
}

export async function fetchOfficialFundRates() {
  const [uitfRates, mutualRates] = await Promise.all([
    fetchOfficialUitfRates(),
    fetchOfficialMutualFundRates(),
  ]);

  return new Map<string, OfficialFundRate>([...uitfRates, ...mutualRates]);
}

export async function fetchOfficialBenchmarks() {
  const response = await fetch('https://markets.newyorkfed.org/api/rates/all/latest.json', {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; TruvaMMF/1.0)' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch NY Fed rates: HTTP ${response.status}`);
  }

  const body = await response.json() as {
    refRates?: Array<{ type?: string; effectiveDate?: string; average90day?: number }>;
  };
  const sofrAverage = body.refRates?.find((row) => row.type === 'SOFRAI');

  if (!sofrAverage?.effectiveDate || !sofrAverage.average90day) {
    throw new Error('Missing SOFRAI average90day from NY Fed response.');
  }

  return [
    BTR_91D_OFFICIAL_RATE,
    {
      key: 'US_TBILL_90D',
      label: '90-Day SOFR Average (Proxy for US T-Bill)',
      date: sofrAverage.effectiveDate,
      rate: sofrAverage.average90day / 100,
      source_url: 'https://markets.newyorkfed.org/api/rates/all/latest.json',
    },
  ];
}

export function roundRate(value: number) {
  return Number(value.toFixed(6));
}

export function getTaxComparableBenchmarkRate(benchmark: OfficialBenchmarkRate) {
  return benchmark.key === 'BTR_91D' ? benchmark.rate * 0.8 : benchmark.rate;
}

export function latestBenchmarkOnOrBefore(
  benchmarks: OfficialBenchmarkRate[],
  key: string | null,
  date: string,
) {
  if (!key) return null;

  return [...benchmarks]
    .filter((benchmark) => benchmark.key === key && benchmark.date <= date)
    .sort((left, right) => right.date.localeCompare(left.date))[0] ?? null;
}

export function computeDailyRatePayload(
  fund: MmfFundForComputation,
  official: OfficialFundRate,
  benchmarks: OfficialBenchmarkRate[],
  dataSource = 'scraper',
): DailyRatePayload {
  const benchmark = latestBenchmarkOnOrBefore(benchmarks, fund.benchmark_key, official.date);
  const trustFee = Number(fund.trust_fee_pct ?? 0);
  const afterTaxYield = fund.fund_type === 'UITF' ? official.grossYield * 0.8 : official.grossYield;
  const netYield = fund.fund_type === 'UITF' ? afterTaxYield - trustFee : official.grossYield;
  const benchmarkRate = benchmark?.rate ?? null;
  const vsBenchmark = benchmark ? netYield - getTaxComparableBenchmarkRate(benchmark) : null;

  return {
    fund_id: fund.id,
    date: official.date,
    navpu: official.navpu,
    gross_yield_1y: roundRate(official.grossYield),
    after_tax_yield: roundRate(afterTaxYield),
    net_yield: roundRate(netYield),
    benchmark_rate: benchmarkRate === null ? null : roundRate(benchmarkRate),
    vs_benchmark: vsBenchmark === null ? null : roundRate(vsBenchmark),
    data_source: dataSource,
  };
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(4)}%`;
}
