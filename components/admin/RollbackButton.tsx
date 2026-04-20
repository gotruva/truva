'use client';

import { useState } from 'react';
import { rollbackSnapshot } from '@/lib/admin-actions';

export function RollbackButton({ snapshotId }: { snapshotId: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleRollback = async () => {
    if (!confirm('Are you sure you want to rollback to this snapshot? The live production rate data will be replaced.')) {
      return;
    }

    setIsPending(true);
    try {
      await rollbackSnapshot(snapshotId);
      alert('Successfully rolled back data.');
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleRollback}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 transition-colors"
    >
      {isPending ? 'Rolling back...' : 'Re-publish'}
    </button>
  );
}
