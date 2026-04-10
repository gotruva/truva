import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import dotenv from 'dotenv';

import {
  buildBaselineManifest,
  buildPublishedRateSnapshot,
  copySeedFile,
  ensureDirectory,
  getBaselineRootDir,
  getSeedCreditCardsPath,
  getSeedRatesPath,
  loadSeedRates,
} from '@/lib/rate-pipeline';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config();

const PUBLIC_TABLES_TO_EXPORT = ['credit_cards', 'affiliate_clicks', 'partner_inquiries'];

async function exportSupabaseTables(rootDir: string) {
  const client = createSupabaseAdminClient('public');
  if (!client) return [] as string[];

  const exported: string[] = [];
  const supabaseDir = path.join(rootDir, 'supabase-public');
  ensureDirectory(supabaseDir);

  for (const table of PUBLIC_TABLES_TO_EXPORT) {
    const { data, error } = await client.from(table).select('*');
    if (error) {
      console.warn(`Skipping Supabase export for ${table}: ${error.message}`);
      continue;
    }

    fs.writeFileSync(
      path.join(supabaseDir, `${table}.json`),
      JSON.stringify(data ?? [], null, 2),
    );
    exported.push(table);
  }

  return exported;
}

async function main() {
  const rootDir = getBaselineRootDir();
  ensureDirectory(rootDir);

  copySeedFile(getSeedRatesPath(), path.join(rootDir, 'rates.json'));
  copySeedFile(getSeedCreditCardsPath(), path.join(rootDir, 'credit-cards.json'));

  const rates = loadSeedRates();
  fs.writeFileSync(
    path.join(rootDir, 'current_public_snapshot.json'),
    JSON.stringify(rates, null, 2),
  );
  fs.writeFileSync(
    path.join(rootDir, 'next_published_candidate_snapshot.json'),
    JSON.stringify(buildPublishedRateSnapshot('staging', rates), null, 2),
  );

  const exportedSupabaseTables = await exportSupabaseTables(rootDir);
  const gitRef = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const manifest = buildBaselineManifest(rates, gitRef, exportedSupabaseTables);

  fs.writeFileSync(
    path.join(rootDir, 'baseline-manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  console.log(`Baseline exported to ${rootDir}`);
  console.log(`Seed products: ${manifest.seedProductCount}`);
  console.log(`Published candidate products: ${manifest.publishedCandidateProductCount}`);
  if (exportedSupabaseTables.length) {
    console.log(`Exported Supabase tables: ${exportedSupabaseTables.join(', ')}`);
  } else {
    console.log('No Supabase public tables exported. Check runtime env if you expected them.');
  }
}

main().catch((error) => {
  console.error('Baseline export failed:', error);
  process.exit(1);
});

