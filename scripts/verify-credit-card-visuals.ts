import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import {
  CREDIT_CARD_VISUAL_ASSETS,
  getCreditCardVisualAsset,
  normalizeCreditCardVisualKey,
  type CreditCardVisualAsset,
} from '@/lib/credit-card-visuals';

type CreditCardVisualRow = {
  id: string;
  bank: string;
  card_name: string;
  normalized_card_key: string;
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSupabaseKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? assertEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

function publicAssetPath(assetPath: string): string {
  return path.join(projectRoot, 'public', assetPath.replace(/^\/+/, ''));
}

function describeRow(row: CreditCardVisualRow): string {
  return `${row.bank} - ${row.card_name} (${row.normalized_card_key})`;
}

function checkManifestDuplicates(): string[] {
  const seen = new Map<string, CreditCardVisualAsset>();
  const duplicates: string[] = [];

  for (const asset of CREDIT_CARD_VISUAL_ASSETS) {
    for (const key of asset.cardKeys) {
      const normalized = normalizeCreditCardVisualKey(key);
      const existing = seen.get(normalized);

      if (existing && existing !== asset) {
        duplicates.push(`${normalized} is mapped to both ${existing.sourceUrl} and ${asset.sourceUrl}`);
      }

      seen.set(normalized, asset);
    }
  }

  return duplicates;
}

const supabase = createClient(assertEnv('NEXT_PUBLIC_SUPABASE_URL'), getSupabaseKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await supabase
  .from('truva_credit_cards')
  .select('id, bank, card_name, normalized_card_key')
  .order('bank', { ascending: true })
  .order('card_name', { ascending: true });

if (error) {
  throw new Error(`Unable to load public credit cards: ${error.message}`);
}

const rows = (data ?? []) as CreditCardVisualRow[];
const duplicateAliases = checkManifestDuplicates();
const missingManifest: CreditCardVisualRow[] = [];
const missingFiles: Array<{ row: CreditCardVisualRow; asset: CreditCardVisualAsset }> = [];
const explicitFallbacks: Array<{ row: CreditCardVisualRow; asset: CreditCardVisualAsset }> = [];
let officialCount = 0;
let contextCount = 0;

for (const row of rows) {
  const asset = getCreditCardVisualAsset(row);

  if (!asset) {
    missingManifest.push(row);
    continue;
  }

  if (asset.status === 'truva-fallback') {
    explicitFallbacks.push({ row, asset });
    continue;
  }

  if (asset.status === 'official-art') officialCount += 1;
  if (asset.status === 'official-context-art') contextCount += 1;

  if (!asset.assetPath || !fs.existsSync(publicAssetPath(asset.assetPath))) {
    missingFiles.push({ row, asset });
  }
}

console.log('Credit-card visual verifier');
console.log(`Rows checked: ${rows.length}`);
console.log(`Manifest records: ${CREDIT_CARD_VISUAL_ASSETS.length}`);
console.log(`Official card art: ${officialCount}`);
console.log(`Official context art: ${contextCount}`);
console.log(`Explicit Truva fallbacks: ${explicitFallbacks.length}`);

if (explicitFallbacks.length > 0) {
  console.log('\nFallbacks marked as intentional:');
  for (const { row, asset } of explicitFallbacks) {
    console.log(`- ${describeRow(row)}: ${asset.note ?? 'official art unavailable'}`);
  }
}

if (duplicateAliases.length > 0) {
  console.error('\nDuplicate manifest aliases:');
  for (const duplicate of duplicateAliases) console.error(`- ${duplicate}`);
}

if (missingManifest.length > 0) {
  console.error('\nCards without a visual manifest decision:');
  for (const row of missingManifest) console.error(`- ${describeRow(row)}`);
}

if (missingFiles.length > 0) {
  console.error('\nManifest entries with missing local files:');
  for (const { row, asset } of missingFiles) {
    console.error(`- ${describeRow(row)} -> ${asset.assetPath ?? '(no assetPath)'}`);
  }
}

if (duplicateAliases.length > 0 || missingManifest.length > 0 || missingFiles.length > 0) {
  process.exitCode = 1;
} else {
  console.log('\nCredit-card visuals: clean');
}
