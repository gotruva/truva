import Link from 'next/link';
import { getAdminClient } from '@/lib/supabase-admin-server';

export const dynamic = 'force-dynamic';

type FundRateRow = {
  net_yield: number | null;
  date: string;
};

type AdminFundRow = {
  id: string;
  name: string;
  provider: string;
  fund_type: string;
  currency: string;
  is_active: boolean;
  mmf_daily_rates: FundRateRow[] | null;
};

type HealthReportRow = {
  slug: string;
  provider: string;
  name: string;
  issue_type: string;
  detail: string;
};

export default async function MMFAdminPage() {
  const supabase = getAdminClient('public');
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Fetch MMFs with their absolute latest rate via left join (if possible) or separate query
  // Supabase postgREST can order nested relationships if told to, but simpler to just fetch funds and their latest rate
  const { data: fundsData, error: fundsError } = await supabase
    .from('money_market_funds')
    .select(`
      id,
      name,
      provider,
      fund_type,
      currency,
      is_active,
      mmf_daily_rates!left(
        net_yield,
        date
      )
    `)
    .order('provider', { ascending: true })
    .returns<AdminFundRow[]>();

  if (fundsError) {
    console.error('Error fetching MMFs:', fundsError.message || fundsError);
  }

  // format MMFs, grabbing the chronologically highest rate date (assuming order wasn't guaranteed by postgrest)
  const funds = (fundsData || []).map((fund) => {
    let latestRate: number | null = null;
    let lastUpdated: string | null = null;

    if (fund.mmf_daily_rates && Array.isArray(fund.mmf_daily_rates)) {
      // Sort descending by date
      const sortedRates = [...fund.mmf_daily_rates].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      if (sortedRates.length > 0) {
        latestRate = sortedRates[0].net_yield;
        lastUpdated = sortedRates[0].date;
      }
    }

    return {
      id: fund.id,
      name: fund.name,
      provider: fund.provider,
      fundType: fund.fund_type,
      currency: fund.currency,
      isActive: fund.is_active,
      latestRate,
      lastUpdated,
    };
  });

  // 2. Fetch Health Report
  let healthReport: HealthReportRow[] = [];
  const { data: healthData, error: healthError } = await supabase
    .rpc('get_mmf_health_report', { check_date: todayStr });
    
  if (healthError) {
    console.error('Failed to invoke get_mmf_health_report, continuing without it.', healthError.message || healthError);
  } else {
    healthReport = healthData || [];
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Money Market Funds</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage UITF and Mutual Fund metadata, and monitor the automated daily rate ingestion health.
        </p>
      </div>

      <div className="mb-12 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Provider & Fund</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Details</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Latest Yield</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Last Updated</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {funds.map((fund) => (
              <tr key={fund.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-900/50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{fund.provider}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{fund.name}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">{fund.id}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {fund.fundType}
                  </span>
                  <span className="ml-2 inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {fund.currency}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-mono text-slate-900 dark:text-slate-100">
                  {fund.latestRate ? `${(Number(fund.latestRate) * 100).toFixed(2)}%` : '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-300">
                  {fund.lastUpdated || '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                  {fund.isActive ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 text-xs font-semibold leading-5 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-2 text-xs font-semibold leading-5 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/mmf/edit/${fund.id}`}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Data Health Report</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Target Date: <span className="font-mono">{todayStr}</span>
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
        <strong>Automation schedule:</strong> The PHP UITF scraper (n8n) runs daily at <strong>6:30 PM PHT</strong>.{' '}
        <code className="rounded bg-sky-100 px-1 text-xs dark:bg-sky-900/40">no_daily_row</code> issues appearing before that time are expected and will self-resolve.{' '}
        If it is past 6:30 PM and issues persist, use <strong>Resolve → Confirm No Change</strong> to copy yesterday&apos;s rate manually. Rows inserted manually are overwritten automatically when the scraper next succeeds.
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Fund</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Details</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {healthError ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-rose-500">Failed to load health report</p>
                  <p className="text-xs text-slate-500 mt-1">{healthError.message}</p>
                </td>
              </tr>
            ) : healthReport.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                      ✓
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">All Funds Healthy</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">No issues detected in today&apos;s automated rate extraction.</p>
                  </div>
                </td>
              </tr>
            ) : (
              healthReport.map((row) => (
                <tr key={`${row.slug}-${row.issue_type}`} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-900/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{row.provider}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{row.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-rose-100 px-2 text-xs font-semibold leading-5 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                      {row.issue_type.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {row.detail}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/mmf/resolve/${row.slug}?date=${todayStr}`}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-rose-600 shadow-sm ring-1 ring-inset ring-rose-300 hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-400 dark:ring-rose-900/60 dark:hover:bg-slate-700"
                    >
                      Resolve
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
