import { notFound } from 'next/navigation';
import { getAdminClient } from '@/lib/supabase-admin-server';
import { RateEditForm } from '@/components/admin/RateEditForm';

export const dynamic = 'force-dynamic';

export default async function RateEditPage({ params }: { params: Promise<{ productId: string }> }) {
  const supabase = getAdminClient('staging');
  const { productId } = await params;

  // Fetch product info
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, provider_display_name, product_name')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    notFound();
  }

  // Fetch the latest snapshot for initial payload
  // We grab the freshest regardless of status since we're editing the latest state. Or we could grab the latest approved.
  const { data: snapshot } = await supabase
    .from('product_snapshots')
    .select('structured_payload')
    .eq('product_id', productId)
    .order('captured_at', { ascending: false })
    .limit(1)
    .single();

  const initialPayload = snapshot?.structured_payload || {};

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manual Rate Edit</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Modify the rate facts for this product. Manual edits can bypass the automated scraper pipeline.
        </p>
      </div>

      <RateEditForm
        productId={product.id}
        providerName={product.provider_display_name}
        productName={product.product_name}
        initialPayload={initialPayload}
      />
    </div>
  );
}
