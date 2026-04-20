import Link from 'next/link';
import { getAdminClient } from '@/lib/supabase-admin-server';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const supabase = getAdminClient('staging');
  const publicSupabase = getAdminClient('public');

  console.log('[AdminOverview] Fetching dashboard data...');
  const todayStr = new Date().toISOString().split('T')[0];
  const [
    { count: pendingReviewsCount },
    { count: activeProductsCount },
    { data: recentChanges },
    { data: lastPublished },
    { data: mmfHealth }
  ] = await Promise.all([
    supabase.from('review_queue').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active_public', true),
    supabase.from('change_events').select('id, product_id, summary, created_at, review_status').order('created_at', { ascending: false }).limit(5),
    publicSupabase.from('product_snapshots').select('captured_at').order('captured_at', { ascending: false }).limit(1),
    publicSupabase.rpc('get_mmf_health_report', { check_date: todayStr })
  ]);
  const healthIssueCount = mmfHealth?.length || 0;
  console.log('[AdminOverview] Data fetched successfully.');


  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Overview</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Monitor your rate extraction pipeline and manage Truva's public catalog.
        </p>
      </div>

      {healthIssueCount > 0 && (
        <Link href="/admin/mmf" className="mb-8 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:hover:bg-rose-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
              ⚠️
            </div>
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-200">
                {healthIssueCount} Data Health Issue{healthIssueCount !== 1 ? 's' : ''} Detected
              </p>
              <p className="text-sm text-rose-700 dark:text-rose-400">
                Missing or stale MMF daily rates for {todayStr}. These issues are visible to users.
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-rose-700 underline underline-offset-4 dark:text-rose-400">
            View & Resolve →
          </span>
        </Link>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Reviews</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{pendingReviewsCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Public Products</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{activeProductsCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Live Data Captured At</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {lastPublished?.[0]?.captured_at ? new Date(lastPublished[0].captured_at).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/rates/review"
              className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 transition-colors hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300">
                🔍
              </div>
              <div>
                <p className="font-medium text-indigo-900 dark:text-indigo-200">Review Queue</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400">Process incoming scraped rates</p>
              </div>
            </Link>
            <Link
              href="/admin/rates/catalog"
              className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-colors hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
                📚
              </div>
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-200">Rate Catalog</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">View & edit all products</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Change Events */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Change Events</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {recentChanges && recentChanges.length > 0 ? (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentChanges.map((event) => (
                  <li key={event.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.product_id}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        event.review_status === 'pending_review' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        event.review_status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {event.review_status}
                      </span>
                    </div>
                    {event.summary && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.summary}</p>}
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No recent change events recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
