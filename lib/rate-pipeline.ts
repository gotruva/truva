import fs from 'fs';
import path from 'path';

import type { CreditCardProduct, RateProduct } from '@/types';
import type { BaselineManifest, PublishedRateSnapshot } from '@/types/rate-pipeline';

import { getSeedProductClassification } from './rate-pipeline-config';

const DATA_DIR = path.join(process.cwd(), 'data');
const RATES_PATH = path.join(DATA_DIR, 'rates.json');
const CREDIT_CARDS_PATH = path.join(DATA_DIR, 'credit-cards.json');

export interface SeedFactDraft {
  factKey: string;
  value: unknown;
  evidenceText: string;
  sourceUrl: string;
  confidence: number;
  isMaterial: boolean;
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch (error) {
    console.error(`Failed to read JSON file at ${filePath}`, error);
    return fallback;
  }
}

export function loadSeedRates(): RateProduct[] {
  return readJsonFile<RateProduct[]>(RATES_PATH, []);
}

export function loadSeedCreditCards(): CreditCardProduct[] {
  return readJsonFile<CreditCardProduct[]>(CREDIT_CARDS_PATH, []);
}

export function ensureDirectory(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function getBaselineRootDir() {
  return path.join(process.cwd(), 'baseline', 'pre-staging-rate-pipeline');
}

export function copySeedFile(sourcePath: string, destinationPath: string) {
  ensureDirectory(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
}

export function buildPublishedRatePayload(rates: RateProduct[]): RateProduct[] {
  return rates.filter((rate) => getSeedProductClassification(rate).keepInPublishedSnapshot);
}

export function buildPublishedRateSnapshot(
  channel: PublishedRateSnapshot['snapshotChannel'],
  rates: RateProduct[],
  generatedAt = new Date().toISOString(),
): PublishedRateSnapshot {
  const payload = buildPublishedRatePayload(rates);
  const providerCount = new Set(payload.map((rate) => rate.provider)).size;

  return {
    snapshotChannel: channel,
    generatedAt,
    productCount: payload.length,
    providerCount,
    payload,
    sourceProductIds: payload.map((rate) => rate.id),
  };
}

export function buildBaselineManifest(
  rates: RateProduct[],
  gitRef: string,
  exportedSupabaseTables: string[],
): BaselineManifest {
  const seedProviders = [...new Set(rates.map((rate) => rate.provider))].sort();
  const publishedSnapshot = buildPublishedRateSnapshot('staging', rates);
  const publicSeedProductCount = rates.filter((rate) => rate.category === 'banks').length;

  return {
    generatedAt: new Date().toISOString(),
    gitRef,
    seedProductCount: rates.length,
    seedProviderCount: seedProviders.length,
    seedProviders,
    publicSeedProductCount,
    publishedCandidateProductCount: publishedSnapshot.productCount,
    publishedCandidateProviderCount: publishedSnapshot.providerCount,
    publishedCandidateProviders: [...new Set(publishedSnapshot.payload.map((rate) => rate.provider))].sort(),
    removedProductIds: rates
      .filter((rate) => !publishedSnapshot.sourceProductIds.includes(rate.id))
      .map((rate) => rate.id),
    manualAnnualProductIds: publishedSnapshot.payload
      .filter((rate) => getSeedProductClassification(rate).sourceMode === 'manual_annual')
      .map((rate) => rate.id),
    maxLastVerified: rates.reduce((latest, rate) => (rate.lastVerified > latest ? rate.lastVerified : latest), ''),
    exportedSupabaseTables,
  };
}

export function getSeedSourceUrl(rate: RateProduct) {
  return `seed://data/rates.json#${rate.id}`;
}

export function buildSeedFacts(rate: RateProduct): SeedFactDraft[] {
  const evidenceText = `Imported from the current approved Truva seed dataset for ${rate.name}.`;
  const sourceUrl = getSeedSourceUrl(rate);

  return [
    { factKey: 'headline_rate', value: rate.headlineRate, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'base_rate', value: rate.baseRate, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'tier_type', value: rate.tierType, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'tiers', value: rate.tiers, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'conditions', value: rate.conditions, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'payout_frequency', value: rate.payoutFrequency, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'lock_in_days', value: rate.lockInDays, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'risk_level', value: rate.riskLevel, evidenceText, sourceUrl, confidence: 1, isMaterial: false },
    { factKey: 'pdic', value: rate.pdic, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'insurer', value: rate.insurer, evidenceText, sourceUrl, confidence: 1, isMaterial: true },
    { factKey: 'last_verified', value: rate.lastVerified, evidenceText, sourceUrl, confidence: 1, isMaterial: false },
    { factKey: 'affiliate_url', value: rate.affiliateUrl, evidenceText, sourceUrl, confidence: 1, isMaterial: false },
    { factKey: 'referral_code', value: rate.referralCode, evidenceText, sourceUrl, confidence: 1, isMaterial: false },
    { factKey: 'payout_amount', value: rate.payoutAmount, evidenceText, sourceUrl, confidence: 1, isMaterial: false },
    { factKey: 'true_value_score', value: rate.trueValueScore, evidenceText, sourceUrl, confidence: 1, isMaterial: false },
  ];
}

export function getSeedRatesPath() {
  return RATES_PATH;
}

export function getSeedCreditCardsPath() {
  return CREDIT_CARDS_PATH;
}

