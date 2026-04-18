import assert from 'assert';

import dotenv from 'dotenv';

import { getPublishedSnapshotRates } from '@/lib/rates';
import { buildPublishedRateSnapshot, loadSeedRates } from '@/lib/rate-pipeline';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

function verifyLocalSnapshot() {
  const rates = loadSeedRates();
  const snapshot = buildPublishedRateSnapshot('staging', rates);
  const ids = snapshot.payload.map((rate) => rate.id);

  assert.equal(ids.length, new Set(ids).size, 'Published snapshot contains duplicate product IDs.');
  assert(snapshot.payload.some((rate) => rate.id === 'pagibig-mp2'), 'Pag-IBIG MP2 must remain in the published snapshot.');
  assert(!snapshot.payload.some((rate) => rate.provider === 'Bureau of Treasury'), 'Bureau of Treasury products must be excluded from the published snapshot.');
  assert(!snapshot.payload.some((rate) => rate.category === 'uitfs'), 'UITF products must be excluded from the published snapshot until automated.');
  assert(!snapshot.payload.some((rate) => rate.category === 'defi'), 'DeFi products must be excluded from the published snapshot until automated.');
  assert(snapshot.payload.filter((rate) => rate.category === 'banks').length > 0, 'Published snapshot should retain vetted bank products.');

  console.log(`Local snapshot verification passed (${snapshot.productCount} published products).`);
}

async function verifySupabaseSnapshot() {
  const client = createSupabaseAdminClient('public');
  if (!client) {
    console.log('Skipping Supabase snapshot verification because admin environment variables are not configured.');
    return;
  }

  const { data, error } = await client.rpc('get_latest_rate_snapshot', {
    requested_channel: 'staging',
  });

  if (error) {
    if ((error as { code?: string }).code === 'PGRST202') {
      console.log('Skipping Supabase staging verification because the snapshot RPC is not available yet. Apply the new migration first.');
      return;
    }
    throw error;
  }
  const snapshot = Array.isArray(data) ? data[0] : data;
  if (!snapshot) {
    console.log('No staging published snapshot found yet. Local verification still passed.');
    return;
  }

  const payload = Array.isArray(snapshot.payload) ? snapshot.payload : [];
  assert.equal(payload.length, snapshot.product_count, 'Staging published snapshot count does not match payload length.');
  const materializedRates = await getPublishedSnapshotRates('staging');
  assert(materializedRates?.length, 'Staging published snapshot should materialize into public rate products.');
  assert(
    materializedRates.every((rate) => rate.id && rate.name && rate.category),
    'Every materialized staging rate needs public product identity fields.',
  );
  console.log(`Supabase staging snapshot verification passed (${snapshot.product_count} products).`);
}

async function main() {
  verifyLocalSnapshot();
  await verifySupabaseSnapshot();
}

main().catch((error) => {
  console.error('Rate pipeline verification failed:', error);
  process.exit(1);
});
