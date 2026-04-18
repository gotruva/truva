import fs from 'fs';
import path from 'path';

import type { RateProduct } from '@/types';
import type { RateSnapshotChannel } from '@/types/rate-pipeline';

import { createSupabaseAdminClient } from './supabase-admin';
import { fetchAaveBaseUSDC } from './defi';
import { normalizeRateProduct } from './score';

type SnapshotRecord = Record<string, unknown>;

const PROVIDER_DEFAULTS: Record<string, { logo: string; affiliateUrl: string }> = {
  'maya-bank': { logo: '/logos/maya.svg', affiliateUrl: 'https://www.maya.ph/' },
  'tonik-digital-bank': { logo: '/logos/tonik.svg', affiliateUrl: 'https://tonikbank.com/' },
  'uno-digital-bank': { logo: '/logos/uno.svg', affiliateUrl: 'https://www.uno.bank/' },
  'gotyme-bank': { logo: '/logos/gotyme.svg', affiliateUrl: 'https://www.gotyme.com.ph/' },
  maribank: { logo: '/logos/maribank.svg', affiliateUrl: 'https://www.maribank.ph/' },
  'uniondigital-bank': { logo: '/logos/uniondigital.svg', affiliateUrl: 'https://uniondigitalbank.io/' },
  ofbank: { logo: '/logos/ofbank.svg', affiliateUrl: 'https://www.ofbank.com.ph/' },
  'cimb-gcash': { logo: '/logos/cimb.svg', affiliateUrl: 'https://www.gcash.com/services/gsave' },
  'cimb-bank': { logo: '/logos/cimb.svg', affiliateUrl: 'https://www.cimbbank.com.ph/' },
  'salmon-bank': { logo: '/logos/salmon.svg', affiliateUrl: 'https://salmon.ph/salmonbank-deposits' },
  netbank: { logo: '/logos/netbank.svg', affiliateUrl: 'https://netbank.ph/netbank-mobile/' },
  ownbank: { logo: '/logos/ownbank.svg', affiliateUrl: 'https://www.ownbank.com/' },
  komo: { logo: '/logos/komo.svg', affiliateUrl: 'https://www.komo.ph/' },
  diskartech: { logo: '/logos/diskartech.svg', affiliateUrl: 'https://diskartech.ph/' },
  banko: { logo: '/logos/banko.svg', affiliateUrl: 'https://www.banko.com.ph/' },
  landbank: { logo: '/logos/landbank.svg', affiliateUrl: 'https://www.landbank.com/' },
  dbp: { logo: '/logos/dbp.svg', affiliateUrl: 'https://www.dbp.ph/' },
};

function getLocalRates(): RateProduct[] {
  const filePath = path.join(process.cwd(), 'data', 'rates.json');

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContents);
    if (!Array.isArray(parsed)) throw new Error('rates.json must be an array');
    return parsed.map(normalizeRateProduct);
  } catch (error) {
    console.error('Failed to load rates data:', error);
    return [];
  }
}

function resolveSnapshotChannel(): RateSnapshotChannel | null {
  const configured = process.env.TRUVA_RATES_SNAPSHOT_CHANNEL;
  if (configured === 'staging' || configured === 'production') {
    return configured;
  }

  if (process.env.VERCEL_ENV === 'preview') return 'staging';
  if (process.env.VERCEL_ENV === 'production') return 'production';

  return null;
}

function isRecord(value: unknown): value is SnapshotRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function publicProductId(sourceProductId: string | null, snapshot: SnapshotRecord, index: number) {
  const rawId = getString(snapshot.id) ?? getString(snapshot.productId) ?? getString(snapshot.product_id);
  const sourceId = rawId ?? sourceProductId ?? `snapshot-${index}`;
  return sourceId.includes(':') ? sourceId.split(':').slice(1).join(':') : sourceId;
}

function providerSlug(sourceProductId: string | null, snapshot: SnapshotRecord) {
  const rawProvider = getString(snapshot.provider);
  if (rawProvider) return rawProvider;
  if (sourceProductId?.includes(':')) return sourceProductId.split(':')[0];
  return null;
}

function inferLockInDays(productId: string, productName: string) {
  const normalized = `${productId} ${productName}`.toLowerCase();
  const monthMatch = normalized.match(/(?:td-|time deposit[^0-9]*)(\d{1,2})m|(\d{1,2})\s*month/);
  const months = Number.parseInt(monthMatch?.[1] ?? monthMatch?.[2] ?? '', 10);
  if (Number.isFinite(months) && months > 0) return Math.round((365 / 12) * months);
  if (normalized.includes('time-deposit') || normalized.includes('time deposit') || normalized.includes('maxsave')) return 365;
  return 0;
}

function isTermProduct(productId: string, productName: string) {
  return inferLockInDays(productId, productName) > 0;
}

function hydrateSnapshotRate(
  rawValue: unknown,
  sourceProductId: string | null,
  generatedAt: string | null,
  seedRatesById: Map<string, RateProduct>,
  index: number,
): RateProduct {
  const raw = isRecord(rawValue) ? rawValue : {};
  const id = publicProductId(sourceProductId, raw, index);
  const seed = seedRatesById.get(id);
  const providerKey = providerSlug(sourceProductId, raw);
  const defaults = providerKey ? PROVIDER_DEFAULTS[providerKey] : undefined;
  const productName = getString(raw.productName) ?? getString(raw.name) ?? seed?.name ?? id;
  const providerName = getString(raw.providerDisplayName) ?? seed?.provider ?? providerKey ?? 'Unknown Provider';
  const rawBaseRate = isRecord(raw.baseRate) ? raw.baseRate : {};
  const headlineRate = getNumber(raw.headlineRate, seed?.headlineRate ?? 0);
  const grossRate = getNumber(rawBaseRate.grossRate, seed?.baseRate.grossRate ?? headlineRate);
  const afterTaxRate = getNumber(rawBaseRate.afterTaxRate, seed?.baseRate.afterTaxRate ?? grossRate * 0.8);
  const baseRate = { grossRate, afterTaxRate };
  const tiers = Array.isArray(raw.tiers)
    ? raw.tiers as RateProduct['tiers']
    : seed?.tiers ?? [{ minBalance: 0, maxBalance: null, grossRate, afterTaxRate }];
  const lockInDays = seed?.lockInDays ?? inferLockInDays(id, productName);
  const payoutFrequency = seed?.payoutFrequency ?? (isTermProduct(id, productName) ? 'at_maturity' : 'daily');

  return normalizeRateProduct({
    id,
    name: productName,
    provider: providerName,
    logo: seed?.logo ?? defaults?.logo ?? '/logos/maya.svg',
    category: seed?.category ?? 'banks',
    headlineRate,
    baseRate,
    tierType: raw.tierType === 'blended' || raw.tierType === 'threshold' ? raw.tierType : seed?.tierType ?? 'threshold',
    tiers,
    conditions: Array.isArray(raw.conditions) ? raw.conditions as RateProduct['conditions'] : seed?.conditions ?? [],
    taxExempt: seed?.taxExempt ?? false,
    payoutFrequency,
    lockInDays,
    riskLevel: seed?.riskLevel ?? 'Low',
    pdic: seed?.pdic ?? true,
    insurer: seed?.insurer ?? 'PDIC',
    lastVerified: getString(raw.lastVerified) ?? generatedAt?.slice(0, 10) ?? seed?.lastVerified ?? '',
    limits: seed?.limits,
    affiliateUrl: seed?.affiliateUrl ?? defaults?.affiliateUrl ?? '',
    referralCode: seed?.referralCode ?? '',
    payoutAmount: seed?.payoutAmount ?? 0,
    trueValueScore: seed?.trueValueScore ?? 3,
  });
}

export async function getPublishedSnapshotRates(channel: RateSnapshotChannel): Promise<RateProduct[] | null> {
  const client = createSupabaseAdminClient('public');
  if (!client) return null;

  const { data, error } = await client.rpc('get_latest_rate_snapshot', {
    requested_channel: channel,
  });

  if (error) {
    console.warn(`Failed to load ${channel} rate snapshot from Supabase: ${error.message}`);
    return null;
  }

  const snapshot = Array.isArray(data) ? data[0] : data;
  if (!isRecord(snapshot) || !Array.isArray(snapshot.payload)) return null;

  const seedRatesById = new Map(getLocalRates().map((rate) => [rate.id, rate]));
  const sourceProductIds = Array.isArray(snapshot.source_product_ids)
    ? snapshot.source_product_ids.map((id) => getString(id))
    : [];
  const generatedAt = getString(snapshot.generated_at);

  return snapshot.payload.map((raw, index) => (
    hydrateSnapshotRate(raw, sourceProductIds[index] ?? null, generatedAt, seedRatesById, index)
  ));
}

async function getRatesCatalog(): Promise<RateProduct[]> {
  const channel = resolveSnapshotChannel();
  if (!channel) {
    return getLocalRates();
  }

  const snapshotRates = await getPublishedSnapshotRates(channel);
  return snapshotRates?.length ? snapshotRates : getLocalRates();
}

export function getPublicRatesFromList(rates: RateProduct[]): RateProduct[] {
  return rates.filter((rate) => rate.category === 'banks' || rate.category === 'uitfs' || rate.id === 'pagibig-mp2');
}

export async function getPublicRates(): Promise<RateProduct[]> {
  return getPublicRatesFromList(await getRatesCatalog());
}

export function getLatestVerifiedDate(rates: RateProduct[]): string {
  return rates.reduce((latest, rate) => (rate.lastVerified > latest ? rate.lastVerified : latest), '');
}

export function formatVerifiedDate(value: string): string {
  if (!value) return '';

  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[Number.parseInt(month, 10) - 1]} ${Number.parseInt(day, 10)}, ${year}`;
}

export async function getLiveRates(): Promise<RateProduct[]> {
  const baseRates = await getRatesCatalog();
  const defiRate = await fetchAaveBaseUSDC();

  return baseRates.map((rate) => {
    if (rate.id === 'aave-v3-usdc-base' && defiRate) {
      const liveGross = defiRate.apy / 100;
      return {
        ...rate,
        headlineRate: liveGross,
        baseRate: { grossRate: liveGross, afterTaxRate: liveGross },
        tiers: [
          { minBalance: 0, maxBalance: null, grossRate: liveGross, afterTaxRate: liveGross },
        ],
      };
    }

    return rate;
  });
}
