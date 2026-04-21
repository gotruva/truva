import assert from 'assert';

import dotenv from 'dotenv';

import { getPublishedSnapshotRates } from '@/lib/rates';
import { buildPublishedRateSnapshot, loadSeedRates } from '@/lib/rate-pipeline';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

function verifyOwnBankPublicRates(rates: { id: string; provider: string; headlineRate: number }[], label: string) {
  assert(
    !rates.some((rate) => rate.id === 'ownbank-time-deposit'),
    `${label} must not include stale generic OwnBank 8% time deposit.`,
  );

  const ownIt = rates.find((rate) => rate.id === 'ownbank-savings');
  if (ownIt) {
    assert.equal(ownIt.headlineRate, 0.038, `${label} Own It Savings should be 3.80% gross.`);
  }

  const ownbankTimeDeposits = rates.filter((rate) => (
    rate.provider === 'OwnBank' && rate.id.startsWith('ownbank-td-')
  ));
  assert(
    ownbankTimeDeposits.every((rate) => rate.headlineRate <= 0.052000001),
    `${label} OwnBank time-deposit terms should not exceed the official 5.20% gross rate.`,
  );
}

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
  verifyOwnBankPublicRates(snapshot.payload, 'Local published snapshot');

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
  const materializedIds = materializedRates.map((rate) => rate.id);
  assert.equal(
    materializedIds.length,
    new Set(materializedIds).size,
    'Materialized staging snapshot contains duplicate public product IDs.',
  );
  assert(
    materializedRates.every((rate) => rate.id && rate.name && rate.category),
    'Every materialized staging rate needs public product identity fields.',
  );
  verifyOwnBankPublicRates(materializedRates, 'Materialized staging snapshot');
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
