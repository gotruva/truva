import { getAdminClient } from '@/lib/supabase-admin-server';
import { CatalogTabs } from '@/components/admin/CatalogTabs';

export const dynamic = 'force-dynamic';

export default async function RateCatalogPage() {
  const supabase = getAdminClient('staging');

  // Fetch all products joined with their latest facts through snapshots
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      provider_display_name,
      product_name,
      public_category,
      active_public,
      review_status,
      product_snapshots(
        facts(value)
      )

    `)
    .order('provider_display_name', { ascending: true })
    .order('product_name', { ascending: true });

  if (error) {
    console.error('Error fetching catalog:', error.message || error);
    throw new Error(`Failed to fetch product catalog: ${error.message}`);
  }

  // Maps the nested structure: products -> snapshots[] -> facts[]
  const formattedProducts = products.map((p) => {
    let latestRate = null;
    
    // We try to find any numeric fact value in the snapshots
    if (p.product_snapshots && Array.isArray(p.product_snapshots)) {
        // Flatten all facts from all snapshots for this product (just to find a rate)
        const allFacts = p.product_snapshots.flatMap((s: any) => s.facts || []);
        const rates = allFacts.map((f: any) => f.value).filter((v: any) => typeof v === 'number');
        if (rates.length > 0) {
            latestRate = Math.max(...rates); 
        }
    }

    return {
      id: p.id,
      provider_display_name: p.provider_display_name,
      product_name: p.product_name,
      category: p.public_category,
      active_public: Boolean(p.active_public),
      review_status: p.review_status || 'unknown',
      latest_rate: latestRate,
    };
  });


  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Rate Catalog</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Browse and toggle the published state of all financial products across the Truva ecosystem.
        </p>
      </div>

      <CatalogTabs products={formattedProducts} />
    </div>
  );
}
