import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/supabase-admin-server';
import { MMFResolveForm } from '@/components/admin/MMFResolveForm';

export const dynamic = 'force-dynamic';

export default async function MMFResolvePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const supabase = getAdminClient('public');
  const { slug } = await params;
  const { date } = await searchParams;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data: fund, error } = await supabase
    .from('money_market_funds')
    .select('id, name, provider, slug')
    .eq('slug', slug)
    .single();

  if (error || !fund) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manual Rate Resolution</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          A data health issue was identified for this fund. Manually inserting the correct yield data below will satisfy the health check and update the live website.
        </p>
      </div>

      <MMFResolveForm
        fundId={fund.id}
        slug={fund.slug}
        name={fund.name}
        provider={fund.provider}
        targetDate={targetDate}
      />
    </div>
  );
}
