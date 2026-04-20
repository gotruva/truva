import { getAdminClient } from '@/lib/supabase-admin-server';
import { RollbackButton } from '@/components/admin/RollbackButton';

export const dynamic = 'force-dynamic';

export default async function SnapshotsPage() {
  const supabase = getAdminClient('public');

  const { data: snapshots, error } = await supabase
    .from('published_snapshots')
    .select('id, provider_count, product_count, generated_at, notes')
    .eq('snapshot_channel', 'production')
    .order('generated_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching snapshots', error);
  }

  const list = snapshots || [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Production Snapshots</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          History of all rate data published to the live gotruva.com website.
          You can roll back to any previous point in time.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Time / Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Snapshot ID</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Products</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {list.map((snap, i) => {
              const isLive = i === 0; // Since order is desc, index 0 is currently live

              return (
                <tr key={snap.id} className={isLive ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 transition-colors dark:hover:bg-slate-900/50'}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {new Date(snap.generated_at).toLocaleString()}
                    </div>
                    {snap.notes && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{snap.notes}</div>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {snap.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-slate-900 dark:text-slate-100">
                    {snap.product_count} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({snap.provider_count} prov.)</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    {isLive ? (
                      <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold leading-5 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold leading-5 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {!isLive && <RollbackButton snapshotId={snap.id} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
