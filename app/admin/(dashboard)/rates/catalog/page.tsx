import { getAdminClient } from '@/lib/supabase-admin-server';
import { CatalogTabs } from '@/components/admin/CatalogTabs';
import { loadSeedRates } from '@/lib/rate-pipeline';
import { getDaysSinceVerified, STALE_THRESHOLD_DAYS } from '@/lib/rates';

export const dynamic = 'force-dynamic';

interface SnapshotFact {
  value: unknown;
}

interface ProductSnapshotRow {
  facts: SnapshotFact[] | null;
}

interface CatalogProductRow {
  id: string;
  provider_display_name: string;
  product_name: string;
  public_category: string | null;
  active_public: boolean | null;
  review_status: string | null;
  product_snapshots: ProductSnapshotRow[] | null;
}

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
  const typedProducts = (products ?? []) as CatalogProductRow[];
  const seedRates = loadSeedRates();
  const seedMap = new Map(seedRates.map((r) => [r.id, r]));

  const formattedProducts = typedProducts.map((product) => {
    let latestRate = null;
    
    // We try to find any numeric fact value in the snapshots
    if (product.product_snapshots && Array.isArray(product.product_snapshots)) {
      const allFacts = product.product_snapshots.flatMap((snapshot) => snapshot.facts ?? []);
      const rates = allFacts
        .map((fact) => fact.value)
        .filter((value): value is number => typeof value === 'number');

      if (rates.length > 0) {
        latestRate = Math.max(...rates); 
      }
    }

    const seed = seedMap.get(product.id);
    const daysSinceVerified = getDaysSinceVerified(seed?.lastVerified);
    const isStale = daysSinceVerified !== null && daysSinceVerified > STALE_THRESHOLD_DAYS;

    return {
      id: product.id,
      provider_display_name: product.provider_display_name,
      product_name: product.product_name,
      category: product.public_category ?? 'unknown',
      active_public: Boolean(product.active_public),
      review_status: product.review_status || 'unknown',
      latest_rate: latestRate,
      last_verified: seed?.lastVerified,
      days_since_verified: daysSinceVerified,
      is_stale: isStale,
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
