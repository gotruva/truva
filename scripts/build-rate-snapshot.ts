import dotenv from 'dotenv';

import type { RateSnapshotChannel } from '@/types/rate-pipeline';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

function getChannel(): RateSnapshotChannel {
  const raw = process.argv.find((value) => value.startsWith('--channel='))?.split('=')[1] ?? 'staging';
  if (raw !== 'staging' && raw !== 'production') {
    throw new Error(`Unsupported snapshot channel "${raw}"`);
  }
  return raw;
}

async function main() {
  const client = createSupabaseAdminClient('public');
  if (!client) {
    throw new Error('Missing Supabase admin environment variables. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const channel = getChannel();
  const { data, error } = await client.rpc('build_rate_snapshot', {
    requested_channel: channel,
    snapshot_notes: `Built by scripts/build-rate-snapshot.ts for the ${channel} channel.`,
  });

  if (error) throw error;

  const snapshot = Array.isArray(data) ? data[0] : data;
  if (!snapshot) {
    throw new Error('No snapshot row was returned by build_rate_snapshot.');
  }

  console.log(
    `Built ${snapshot.out_snapshot_channel} snapshot ${snapshot.out_snapshot_id} with ${snapshot.out_product_count} products across ${snapshot.out_provider_count} providers.`,
  );
}

main().catch((error) => {
  console.error('Snapshot build failed:', error);
  process.exit(1);
});
