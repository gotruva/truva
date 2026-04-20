import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/supabase-admin-server';
import { MMFEditForm } from '@/components/admin/MMFEditForm';

export const dynamic = 'force-dynamic';

export default async function MMFEditPage({ params }: { params: Promise<{ fundId: string }> }) {
  const supabase = getAdminClient('public');
  const { fundId } = await params;

  const { data: fund, error } = await supabase
    .from('money_market_funds')
    .select('*')
    .eq('id', fundId)
    .single();

  if (error || !fund) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edit MMF Metadata</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Modify the non-volatile metadata for this Money Market Fund. This does not affect automated daily yield ingestion.
        </p>
      </div>

      <MMFEditForm
        fundId={fund.id}
        provider={fund.provider}
        name={fund.name}
        initialData={fund}
      />
    </div>
  );
}
