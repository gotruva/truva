import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import {
  CLEAN_CARD_ASSET_ROOT,
  CREDIT_CARD_VISUAL_ASSETS,
  getCreditCardVisualAsset,
  normalizeCleanCreditCardAssetKey,
  normalizeCreditCardVisualKey,
  type CreditCardVisualAsset,
  type CreditCardVisualSourceAsset,
} from '@/lib/credit-card-visuals';
import { SCRAPE_REPORT_STATUS_MAP } from '@/lib/credit-card-visual-status';

type CreditCardVisualRow = {
  id: string;
  bank: string;
  card_name: string;
  normalized_card_key: string;
};

type CreditCardImageScrapeReportEntry = {
  normalized_card_key: string;
  bank: string;
  card_name: string;
  source_page_url: string;
  direct_image_url: string | null;
  local_asset_path: string | null;
  status: 'clean-card' | 'needs-manual-review' | 'official-unavailable';
  checked_at: string;
  notes: string;
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cleanAssetRoot = path.join(projectRoot, 'public', CLEAN_CARD_ASSET_ROOT.replace(/^\/+/, ''));
const scrapeReportPath = path.join(projectRoot, 'docs', 'credit-card-image-scrape-report.json');

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

function fileHash(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  } catch {
    return null;
  }
}

// ─── Scrape report loading ───

function loadScrapeReport(): {
  reportByKey: Map<string, CreditCardImageScrapeReportEntry>;
  reportIssues: string[];
} {
  const reportIssues: string[] = [];
  const reportByKey = new Map<string, CreditCardImageScrapeReportEntry>();

  if (!fs.existsSync(scrapeReportPath)) {
    reportIssues.push(`Missing scrape report: ${path.relative(projectRoot, scrapeReportPath)}`);
    return { reportByKey, reportIssues };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(scrapeReportPath, 'utf8'));
  } catch (error) {
    reportIssues.push(`Unable to parse scrape report: ${error instanceof Error ? error.message : String(error)}`);
    return { reportByKey, reportIssues };
  }

  if (!Array.isArray(parsed)) {
    reportIssues.push('Scrape report must be an array.');
    return { reportByKey, reportIssues };
  }

  for (const entry of parsed) {
    const candidate = entry as Partial<CreditCardImageScrapeReportEntry>;
    const key = normalizeCleanCreditCardAssetKey(candidate.normalized_card_key);

    if (!key) {
      reportIssues.push(`Scrape report entry is missing normalized_card_key: ${JSON.stringify(entry)}`);
      continue;
    }

    if (reportByKey.has(key)) {
      reportIssues.push(`Duplicate scrape report entry for ${key}`);
    }

    reportByKey.set(key, candidate as CreditCardImageScrapeReportEntry);
  }

  return { reportByKey, reportIssues };
}

// ─── Main ───

const issues: string[] = [];

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
const { reportByKey, reportIssues } = loadScrapeReport();

// ─── Check 1: report keys exactly match live rows ───

const liveKeys = new Set(rows.map(r => normalizeCleanCreditCardAssetKey(r.normalized_card_key)));
const reportKeys = new Set(reportByKey.keys());

const missingInReport = [...liveKeys].filter(k => !reportKeys.has(k));
const extraInReport = [...reportKeys].filter(k => !liveKeys.has(k));

if (missingInReport.length > 0) {
  issues.push(`Report missing entries for live keys: ${missingInReport.join(', ')}`);
}
if (extraInReport.length > 0) {
  issues.push(`Report has extra keys not in live DB: ${extraInReport.join(', ')}`);
}

// ─── Check 2: report has no duplicate keys ───

const seenReportKeys = new Map<string, number>();
for (const entry of reportByKey.values()) {
  const key = entry.normalized_card_key;
  seenReportKeys.set(key, (seenReportKeys.get(key) ?? 0) + 1);
}
for (const [key, count] of seenReportKeys) {
  if (count > 1) {
    issues.push(`Duplicate report entry for ${key} (appears ${count}x)`);
  }
}

// ─── Check 3: SCRAPE_REPORT_STATUS_MAP matches report ───

for (const liveKey of liveKeys) {
  const reportEntry = reportByKey.get(liveKey);
  const mapStatus = SCRAPE_REPORT_STATUS_MAP[liveKey];

  if (!reportEntry) continue; // already caught above

  if (mapStatus !== reportEntry.status) {
    issues.push(
      `SCRAPE_REPORT_STATUS_MAP mismatch for ${liveKey}: map says "${mapStatus}", report says "${reportEntry.status}"`,
    );
  }
}

// ─── Check 4: clean-card validation ───

const cleanCardEntries: CreditCardImageScrapeReportEntry[] = [];
const cleanFileHashes = new Map<string, string>(); // hash -> key
let cleanCount = 0;
let reviewCount = 0;
let unavailableCount = 0;

for (const [key, entry] of reportByKey) {
  if (entry.status === 'clean-card') {
    cleanCount++;
    cleanCardEntries.push(entry);

    if (!entry.direct_image_url) {
      issues.push(`clean-card ${key} is missing direct_image_url`);
    }
    if (!entry.local_asset_path) {
      issues.push(`clean-card ${key} is missing local_asset_path`);
    } else {
      const fullPath = publicAssetPath(entry.local_asset_path);
      if (!fs.existsSync(fullPath)) {
        issues.push(`clean-card ${key} has local_asset_path ${entry.local_asset_path} but file does not exist`);
      } else {
        // Check duplicate hash
        const hash = fileHash(fullPath);
        if (hash) {
          const existingKey = cleanFileHashes.get(hash);
          if (existingKey) {
            issues.push(
              `clean-card ${key} has identical file hash to ${existingKey}. One or both are not unique card-face images.`,
            );
          } else if (!existingKey) {
            cleanFileHashes.set(hash, key);
          }
        }
      }
    }

    const row = rows.find(r => normalizeCleanCreditCardAssetKey(r.normalized_card_key) === key);
    if (row) {
      const asset = getCreditCardVisualAsset(row);
      if (!asset) {
        issues.push(`clean-card ${key}: getCreditCardVisualAsset returned null instead of clean-card`);
      } else {
        if (asset.status === 'truva-fallback') {
          issues.push(`clean-card ${key}: getCreditCardVisualAsset returned truva-fallback instead of real artwork`);
        }
        if (asset.status !== 'clean-card') {
          issues.push(`clean-card ${key}: getCreditCardVisualAsset returned ${asset.status} instead of clean-card`);
        }
        if (!asset.assetPath) {
          issues.push(`clean-card ${key}: getCreditCardVisualAsset returned no assetPath`);
        } else if (entry.local_asset_path && asset.assetPath !== entry.local_asset_path) {
          issues.push(
            `clean-card ${key}: getCreditCardVisualAsset returned ${asset.assetPath}, report says ${entry.local_asset_path}`,
          );
        }
      }
    }
  } else if (entry.status === 'needs-manual-review') {
    reviewCount++;
    // Verify that getCreditCardVisualAsset returns fallback for this key
    const row = rows.find(r => normalizeCleanCreditCardAssetKey(r.normalized_card_key) === key);
    if (row) {
      const asset = getCreditCardVisualAsset(row);
      if (asset && asset.status !== 'truva-fallback') {
        issues.push(
          `needs-manual-review ${key}: getCreditCardVisualAsset returned ${asset.status} instead of truva-fallback`,
        );
      }
      if (asset?.assetPath) {
        issues.push(`needs-manual-review ${key}: getCreditCardVisualAsset returned an assetPath (should be null for fallback)`);
      }
    }
  } else if (entry.status === 'official-unavailable') {
    unavailableCount++;
    const row = rows.find(r => normalizeCleanCreditCardAssetKey(r.normalized_card_key) === key);
    if (row) {
      const asset = getCreditCardVisualAsset(row);
      if (asset && asset.status !== 'truva-fallback') {
        issues.push(
          `official-unavailable ${key}: getCreditCardVisualAsset returned ${asset.status} instead of truva-fallback`,
        );
      }
      if (asset?.assetPath) {
        issues.push(
          `official-unavailable ${key}: getCreditCardVisualAsset returned an assetPath (should be null for fallback)`,
        );
      }
    }
  }
}

// ─── Check 5: No stale clean files for non-clean rows ───

if (fs.existsSync(cleanAssetRoot)) {
  const filesOnDisk = fs.readdirSync(cleanAssetRoot).filter(f => f.endsWith('.webp'));
  for (const file of filesOnDisk) {
    const key = file.replace(/\.webp$/, '');
    const reportEntry = reportByKey.get(key);
    if (reportEntry && reportEntry.status !== 'clean-card') {
      issues.push(
        `Stale file on disk: ${file} exists but report says "${reportEntry.status}". Should be removed.`,
      );
    }
    if (!reportEntry) {
      issues.push(`Orphaned file on disk (no report entry): ${file}`);
    }
  }
}

// ─── Output ───

console.log('Credit-card visual verifier');
console.log(`Rows checked: ${rows.length}`);
console.log(`Scrape report entries: ${reportByKey.size}`);
console.log(`Clean card assets: ${cleanCount}`);
console.log(`Needs manual review: ${reviewCount}`);
console.log(`Official unavailable: ${unavailableCount}`);

// Check live vs report row count
if (rows.length !== reportByKey.size) {
  console.error(`\nRow count mismatch: ${rows.length} live rows vs ${reportByKey.size} report entries`);
}

// Print all non-clean rows as fallback confirmation
const fallbackCards = [...reportByKey.values()]
  .filter(e => e.status !== 'clean-card')
  .map(e => `- ${e.bank} - ${e.card_name} (${e.normalized_card_key}): ${e.status}`);
if (fallbackCards.length > 0) {
  console.log(`\nCards resolved to fallback (${fallbackCards.length}):`);
  for (const line of fallbackCards) {
    console.log(`  ${line}`);
  }
}

if (issues.length > 0) {
  console.error('\nIssues:');
  for (const issue of issues) {
    console.error(`  ❌ ${issue}`);
  }
}

if (issues.length > 0) {
  process.exitCode = 1;
} else {
  console.log('\n✅ All credit-card visual checks passed!');
}
