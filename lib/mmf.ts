import type { MoneyMarketFund } from '@/types';

export const MMF_DEFAULT_AMOUNT = 10000;
const PHT_TIME_ZONE = 'Asia/Manila';

export function getPhtDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PHT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

export function formatPhtDate(dateString: string | null | undefined) {
  if (!dateString) return 'Not available';

  const date = new Date(`${dateString}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: PHT_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatPhtDateTime(dateString: string | null | undefined) {
  if (!dateString) return 'Not checked yet';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Not checked yet';

  return `${new Intl.DateTimeFormat('en-US', {
    timeZone: PHT_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)} PHT`;
}

export function formatMmfPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(2)}%`;
}

export function formatMmfMoney(
  value: number | null | undefined,
  currency: MoneyMarketFund['currency'] = 'PHP',
) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';

  return `${currency} ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value)}`;
}

export function estimateAnnualEarnings(fund: MoneyMarketFund, amount: number) {
  if (fund.net_yield === null || fund.net_yield === undefined || amount <= 0) return null;
  return amount * fund.net_yield;
}

export function formatEstimatedAnnualEarnings(fund: MoneyMarketFund, amount: number) {
  return formatMmfMoney(estimateAnnualEarnings(fund, amount), fund.currency);
}

export function redemptionLabel(days: number) {
  if (days === 0) return 'Same day';
  if (days === 1) return 'Next day';
  return `T+${days}`;
}

export function getLatestCheckedAt(funds: MoneyMarketFund[]) {
  return funds
    .map((fund) => fund.scraped_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;
}

export function getLatestRateDate(funds: MoneyMarketFund[]) {
  return funds
    .map((fund) => fund.rate_date)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;
}

function sourceStatusLabel(dataSource: string | null | undefined) {
  if (!dataSource || dataSource === 'scraper') return null;
  if (dataSource === 'auto_carry_forward') return 'carried forward';
  if (dataSource.startsWith('manual')) return 'manually verified';
  return 'pending automation confirmation';
}

export function getFundFreshnessIssue(
  fund: MoneyMarketFund,
  expectedRateDate: string | null | undefined,
): string | null {
  const staleDate = Boolean(expectedRateDate && fund.rate_date !== expectedRateDate);
  const unconfirmed = sourceStatusLabel(fund.data_source);
  const incompleteYield =
    fund.gross_yield_1y === null ||
    fund.gross_yield_1y === undefined ||
    fund.net_yield === null ||
    fund.net_yield === undefined;

  if (!staleDate && !unconfirmed && !incompleteYield) return null;

  const parts: string[] = [];
  if (staleDate) parts.push(`rate as of ${formatPhtDate(fund.rate_date)}`);
  if (unconfirmed) parts.push(unconfirmed);
  if (incompleteYield) parts.push('yield incomplete');
  return parts.join(' · ');
}

export function getPhpUitfFreshnessIssues(funds: MoneyMarketFund[], phtDate: string) {
  return funds
    .filter((fund) => fund.currency === 'PHP' && fund.fund_type === 'UITF')
    .flatMap((fund) => {
      const issues: string[] = [];

      if (fund.rate_date !== phtDate) {
        issues.push(`${fund.name}: rate date is ${fund.rate_date ?? 'missing'}`);
      }

      if (fund.data_source !== 'scraper') {
        issues.push(`${fund.name}: latest update is not confirmed`);
      }

      if (
        fund.gross_yield_1y === null ||
        fund.gross_yield_1y === undefined ||
        fund.net_yield === null ||
        fund.net_yield === undefined
      ) {
        issues.push(`${fund.name}: yield is incomplete`);
      }

      if (
        fund.benchmark_rate === null ||
        fund.benchmark_rate === undefined ||
        fund.vs_benchmark === null ||
        fund.vs_benchmark === undefined
      ) {
        issues.push(`${fund.name}: benchmark comparison is incomplete`);
      }

      return issues;
    });
}
