import dotenv from 'dotenv';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const client = createSupabaseAdminClient('public');
  if (!client) {
    throw new Error('Missing Supabase admin environment variables. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const { data, error } = await client.rpc('promote_rate_snapshot');
  if (error) throw error;

  const snapshot = Array.isArray(data) ? data[0] : data;
  if (!snapshot) {
    throw new Error('No production snapshot row was returned by promote_rate_snapshot.');
  }

  console.log(
    `Promoted to ${snapshot.out_snapshot_channel} snapshot ${snapshot.out_snapshot_id} with ${snapshot.out_product_count} products across ${snapshot.out_provider_count} providers.`,
  );
}

main().catch((error) => {
  console.error('Snapshot promotion failed:', error);
  process.exit(1);
});
