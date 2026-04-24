import fs from 'fs';
import path from 'path';

import type { RateProduct } from '@/types';
import type { RateSnapshotChannel } from '@/types/rate-pipeline';

import { createSupabaseAdminClient } from './supabase-admin';
import { fetchAaveBaseUSDC } from './defi';
import { normalizeRateProduct } from './score';

type SnapshotRecord = Record<string, unknown>;
type SnapshotProductMapping = {
  publicId: string;
  preferSeedName?: boolean;
  defaults?: Partial<RateProduct>;
};
type HydratedSnapshotEntry = {
  rate: RateProduct;
  score: number;
  index: number;
};

const PROVIDER_DEFAULTS: Record<string, { logo: string; affiliateUrl: string }> = {
  'maya-bank': { logo: '/logos/maya.svg', affiliateUrl: 'https://official.maya.ph/be7m/gmsb47rr' },
  'tonik-digital-bank': { logo: '/logos/tonik.svg', affiliateUrl: 'https://tonikbank.com/' },
  'uno-digital-bank': { logo: '/logos/uno.svg', affiliateUrl: 'https://www.uno.bank/' },
  'gotyme-bank': { logo: '/logos/gotyme.svg', affiliateUrl: 'https://www.gotyme.com.ph/' },
  maribank: { logo: '/logos/maribank.svg', affiliateUrl: 'https://maribank.ph/c/earnfreemoney?referralCode=AA799662' },
  'uniondigital-bank': { logo: '/logos/uniondigital.svg', affiliateUrl: 'https://uniondigitalbank.io/' },
  ofbank: { logo: '/logos/ofbank.svg', affiliateUrl: 'https://www.ofbank.com.ph/' },
  'cimb-gcash': { logo: '/logos/cimb.svg', affiliateUrl: 'https://www.gcash.com/services/gsave' },
  'cimb-bank': { logo: '/logos/cimb.svg', affiliateUrl: 'https://www.cimbbank.com.ph/' },
  'salmon-bank': { logo: '/logos/salmon.svg', affiliateUrl: 'https://salmon.ph/salmonbank-deposits' },
  netbank: { logo: '/logos/netbank.svg', affiliateUrl: 'https://netbank.ph/netbank-mobile/' },
  ownbank: { logo: '/logos/ownbank.svg', affiliateUrl: 'https://s.ownbank.com.ph/cjZct3' },
  komo: { logo: '/logos/komo.svg', affiliateUrl: 'https://www.komo.ph/' },
  diskartech: { logo: '/logos/diskartech.svg', affiliateUrl: 'https://diskartech.ph/' },
  banko: { logo: '/logos/banko.svg', affiliateUrl: 'https://www.banko.com.ph/' },
  landbank: { logo: '/logos/landbank.svg', affiliateUrl: 'https://www.landbank.com/' },
  dbp: { logo: '/logos/dbp.svg', affiliateUrl: 'https://www.dbp.ph/' },
};

function normalizeProviderKey(key: string | null): string | null {
  if (!key) return null;
  const normalized = key.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (normalized.startsWith('cimb') || normalized.includes('cimb-bank')) {
    return normalized.includes('gcash') || normalized.includes('gsave') ? 'cimb-gcash' : 'cimb-bank';
  }
  return normalized;
}

const MANUAL_PUBLIC_RATE_IDS = new Set(['pagibig-mp2']);
const DENIED_SNAPSHOT_PRODUCT_IDS = new Set([
  'ownbank-time-deposit',
  'ownbank:ownbank-time-deposit',
]);

function bankDefaults(
  provider: string,
  providerKey: string,
  overrides: Partial<RateProduct> = {},
): Partial<RateProduct> {
  const normalizedKey = normalizeProviderKey(providerKey);
  const defaults = normalizedKey ? PROVIDER_DEFAULTS[normalizedKey] : undefined;
  return {
    provider,
    logo: defaults?.logo ?? '',
    category: 'banks',
    taxExempt: false,
    payoutFrequency: 'daily',
    lockInDays: 0,
    riskLevel: 'Low',
    pdic: true,
    insurer: 'PDIC',
    affiliateUrl: defaults?.affiliateUrl ?? '',
    referralCode: '',
    payoutAmount: 0,
    trueValueScore: 3,
    conditions: [],
    ...overrides,
  };
}

function salmonTermDefaults(months: number): Partial<RateProduct> {
  return bankDefaults('Salmon Bank', 'salmon-bank', {
    payoutFrequency: 'monthly',
    lockInDays: Math.round((365 / 12) * months),
  });
}

function unoEarnDefaults(months: 12 | 24): Partial<RateProduct> {
  return bankDefaults('UNO Digital Bank', 'uno-digital-bank', {
    name: `#UNOearn ${months}-Month`,
    payoutFrequency: 'monthly',
    lockInDays: months === 12 ? 365 : 730,
    tierType: 'flat',
    conditions: [{
      type: 'none',
      description: `${months}-month #UNOearn term. Monthly interest paid out to your #UNOready account.`,
      expiresAt: null,
    }],
  });
}

function unoBoostLockInDays(months: number) {
  return ({
    3: 91,
    4: 122,
    5: 152,
    6: 182,
    7: 213,
    8: 243,
    9: 274,
    10: 304,
    11: 335,
    12: 365,
  } as Record<number, number>)[months] ?? Math.round((365 / 12) * months);
}

function unoBoostDefaults(months: number): Partial<RateProduct> {
  return bankDefaults('UNO Digital Bank', 'uno-digital-bank', {
    name: `#UNOboost ${months}-Month`,
    payoutFrequency: 'at_maturity',
    lockInDays: unoBoostLockInDays(months),
    tierType: 'flat',
    conditions: [{
      type: 'none',
      description: `${months}-month #UNOboost term. Interest earnings are subject to 20% withholding tax.`,
      expiresAt: null,
    }],
  });
}

const SCRAPER_PRODUCT_MAPPINGS: Record<string, SnapshotProductMapping> = {
  'maya-bank:maya-savings': { publicId: 'maya-savings' },
  'maya-bank:maya-time-deposit-plus': { publicId: 'maya-td-6mo', preferSeedName: true },
  'maya-time-deposit-plus': { publicId: 'maya-td-6mo', preferSeedName: true },
  'maya-bank:maya-savings-promo': {
    publicId: 'maya-savings-promo',
    defaults: bankDefaults('Maya Bank', 'maya-bank', {
      name: 'Maya Savings (Boosted)',
      tierType: 'blended',
      conditions: [{
        type: 'promo',
        description: 'Activity-based boost promo. Bonus tiers require qualifying Maya transactions. Boosted rate applies only on first ₱100,000.',
        expiresAt: null,
      }],
    }),
  },
  'maya-savings-promo': {
    publicId: 'maya-savings-promo',
    defaults: bankDefaults('Maya Bank', 'maya-bank', {
      name: 'Maya Savings (Boosted)',
      tierType: 'blended',
      conditions: [{
        type: 'promo',
        description: 'Activity-based boost promo. Bonus tiers require qualifying Maya transactions. Boosted rate applies only on first ₱100,000.',
        expiresAt: null,
      }],
    }),
  },
  'tonik-digital-bank:tonik-account': { publicId: 'tonik-account' },
  'tonik-digital-bank:tonik-time-deposit': { publicId: 'tonik-td-12mo', preferSeedName: true },
  'tonik-time-deposit': { publicId: 'tonik-td-12mo', preferSeedName: true },
  'gotyme-bank:gotyme-savings': { publicId: 'gotyme-savings' },
  'ofbank:ofbank-savings': { publicId: 'ofbank-savings' },
  'uno-digital-bank:uno-savings': { publicId: 'uno-ready' },
  'uno-savings': { publicId: 'uno-ready' },
  'uno-digital-bank:uno-boost-3mo': { publicId: 'uno-boost-3mo', preferSeedName: true, defaults: unoBoostDefaults(3) },
  'uno-boost-3mo': { publicId: 'uno-boost-3mo', preferSeedName: true, defaults: unoBoostDefaults(3) },
  'uno-digital-bank:uno-boost-4mo': { publicId: 'uno-boost-4mo', preferSeedName: true, defaults: unoBoostDefaults(4) },
  'uno-boost-4mo': { publicId: 'uno-boost-4mo', preferSeedName: true, defaults: unoBoostDefaults(4) },
  'uno-digital-bank:uno-boost-5mo': { publicId: 'uno-boost-5mo', preferSeedName: true, defaults: unoBoostDefaults(5) },
  'uno-boost-5mo': { publicId: 'uno-boost-5mo', preferSeedName: true, defaults: unoBoostDefaults(5) },
  'uno-digital-bank:uno-boost-6mo': { publicId: 'uno-boost-6mo', preferSeedName: true, defaults: unoBoostDefaults(6) },
  'uno-boost-6mo': { publicId: 'uno-boost-6mo', preferSeedName: true, defaults: unoBoostDefaults(6) },
  'uno-digital-bank:uno-boost-7mo': { publicId: 'uno-boost-7mo', preferSeedName: true, defaults: unoBoostDefaults(7) },
  'uno-boost-7mo': { publicId: 'uno-boost-7mo', preferSeedName: true, defaults: unoBoostDefaults(7) },
  'uno-digital-bank:uno-boost-8mo': { publicId: 'uno-boost-8mo', preferSeedName: true, defaults: unoBoostDefaults(8) },
  'uno-boost-8mo': { publicId: 'uno-boost-8mo', preferSeedName: true, defaults: unoBoostDefaults(8) },
  'uno-digital-bank:uno-boost-9mo': { publicId: 'uno-boost-9mo', preferSeedName: true, defaults: unoBoostDefaults(9) },
  'uno-boost-9mo': { publicId: 'uno-boost-9mo', preferSeedName: true, defaults: unoBoostDefaults(9) },
  'uno-digital-bank:uno-boost-10mo': { publicId: 'uno-boost-10mo', preferSeedName: true, defaults: unoBoostDefaults(10) },
  'uno-boost-10mo': { publicId: 'uno-boost-10mo', preferSeedName: true, defaults: unoBoostDefaults(10) },
  'uno-digital-bank:uno-boost-11mo': { publicId: 'uno-boost-11mo', preferSeedName: true, defaults: unoBoostDefaults(11) },
  'uno-boost-11mo': { publicId: 'uno-boost-11mo', preferSeedName: true, defaults: unoBoostDefaults(11) },
  'uno-digital-bank:uno-boost-12mo': { publicId: 'uno-boost-12mo', preferSeedName: true, defaults: unoBoostDefaults(12) },
  'uno-boost-12mo': { publicId: 'uno-boost-12mo', preferSeedName: true, defaults: unoBoostDefaults(12) },
  'uno-digital-bank:uno-earn-12mo': { publicId: 'uno-td-365', preferSeedName: true, defaults: unoEarnDefaults(12) },
  'uno-earn-12mo': { publicId: 'uno-td-365', preferSeedName: true, defaults: unoEarnDefaults(12) },
  'uno-digital-bank:uno-earn-24mo': { publicId: 'uno-td-730', preferSeedName: true, defaults: unoEarnDefaults(24) },
  'uno-earn-24mo': { publicId: 'uno-td-730', preferSeedName: true, defaults: unoEarnDefaults(24) },
  'uno-digital-bank:uno-time-deposit': { publicId: 'uno-td-365', preferSeedName: true },
  'uno-time-deposit': { publicId: 'uno-td-365', preferSeedName: true },
  'maribank:maribank-savings': { publicId: 'maribank-savings' },
  'uniondigital-bank:uniondigital-savings': { publicId: 'uniondigital-savings' },
  'uniondigital-bank:uniondigital-time-deposit': { publicId: 'uniondigital-td', preferSeedName: true },
  'uniondigital-time-deposit': { publicId: 'uniondigital-td', preferSeedName: true },
  'cimb-gcash:cimb-gsave': { publicId: 'cimb-gsave' },
  'cimb-bank:cimb-upsave': {
    publicId: 'cimb-upsave',
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', {
      name: 'CIMB UpSave',
      tierType: 'flat',
    }),
  },
  'cimb-upsave': {
    publicId: 'cimb-upsave',
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', {
      name: 'CIMB UpSave',
      tierType: 'flat',
    }),
  },
  'cimb-bank:cimb-maxsave': {
    publicId: 'cimb-maxsave-3mo',
    preferSeedName: true,
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', { name: 'CIMB MaxSave', tierType: 'threshold' }),
  },
  'cimb-maxsave': {
    publicId: 'cimb-maxsave-3mo',
    preferSeedName: true,
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', { name: 'CIMB MaxSave', tierType: 'threshold' }),
  },
  'cimb-maxsave-regular-3m': {
    publicId: 'cimb-maxsave-3mo',
    preferSeedName: true,
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', { name: 'CIMB MaxSave 3-Month' }),
  },
  'cimb-maxsave-regular-6m': {
    publicId: 'cimb-maxsave-6mo',
    preferSeedName: true,
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', { name: 'CIMB MaxSave 6-Month' }),
  },
  'cimb-maxsave-regular-12m': {
    publicId: 'cimb-maxsave-12mo',
    preferSeedName: true,
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', { name: 'CIMB MaxSave 12-Month' }),
  },
  'cimb-maxsave-regular-24m': {
    publicId: 'cimb-maxsave-24mo',
    preferSeedName: true,
    defaults: bankDefaults('CIMB Bank Philippines', 'cimb-bank', { name: 'CIMB MaxSave 24-Month' }),
  },
  'salmon-bank:salmon-savings': {
    publicId: 'salmon-savings',
    defaults: bankDefaults('Salmon Bank', 'salmon-bank', { name: 'Salmon Savings', tierType: 'flat' }),
  },
  'salmon-savings': {
    publicId: 'salmon-savings',
    defaults: bankDefaults('Salmon Bank', 'salmon-bank', { name: 'Salmon Savings', tierType: 'flat' }),
  },
  'salmon-bank:salmon-bank-on-eight': {
    publicId: 'salmon-td-12mo',
    preferSeedName: true,
    defaults: bankDefaults('Salmon Bank', 'salmon-bank', {
      name: 'Salmon Bank Time Deposit 12-Month',
      payoutFrequency: 'at_maturity',
      lockInDays: 365,
      tierType: 'threshold',
      conditions: [{
        type: 'promo',
        description: 'Promotional time deposit rate subject to Salmon Bank eligibility and promo mechanics.',
        expiresAt: null,
      }],
    }),
  },
  'salmon-bank-on-eight': {
    publicId: 'salmon-td-12mo',
    preferSeedName: true,
    defaults: bankDefaults('Salmon Bank', 'salmon-bank', {
      name: 'Salmon Bank Time Deposit 12-Month',
      payoutFrequency: 'at_maturity',
      lockInDays: 365,
      tierType: 'threshold',
      conditions: [{
        type: 'promo',
        description: 'Promotional time deposit rate subject to Salmon Bank eligibility and promo mechanics.',
        expiresAt: null,
      }],
    }),
  },
  'salmon-bank:salmon-td-6mo': { publicId: 'salmon-td-6mo', defaults: salmonTermDefaults(6) },
  'salmon-td-6mo': { publicId: 'salmon-td-6mo', defaults: salmonTermDefaults(6) },
  'salmon-bank:salmon-td-9mo': { publicId: 'salmon-td-9mo', defaults: salmonTermDefaults(9) },
  'salmon-td-9mo': { publicId: 'salmon-td-9mo', defaults: salmonTermDefaults(9) },
  'salmon-bank:salmon-td-12mo': { publicId: 'salmon-td-12mo', defaults: salmonTermDefaults(12) },
  'salmon-td-12mo': { publicId: 'salmon-td-12mo', defaults: salmonTermDefaults(12) },
  'salmon-bank:salmon-td-24mo': { publicId: 'salmon-td-24mo', defaults: salmonTermDefaults(24) },
  'salmon-td-24mo': { publicId: 'salmon-td-24mo', defaults: salmonTermDefaults(24) },
  'salmon-bank:salmon-td-36mo': { publicId: 'salmon-td-36mo', defaults: salmonTermDefaults(36) },
  'salmon-td-36mo': { publicId: 'salmon-td-36mo', defaults: salmonTermDefaults(36) },
  'salmon-bank:salmon-td-48mo': { publicId: 'salmon-td-48mo', defaults: salmonTermDefaults(48) },
  'salmon-td-48mo': { publicId: 'salmon-td-48mo', defaults: salmonTermDefaults(48) },
  'salmon-bank:salmon-td-60mo': { publicId: 'salmon-td-60mo', defaults: salmonTermDefaults(60) },
  'salmon-td-60mo': { publicId: 'salmon-td-60mo', defaults: salmonTermDefaults(60) },
  'salmon-td-12m-5000': { publicId: 'salmon-td-12mo', preferSeedName: true, defaults: salmonTermDefaults(12) },
  'salmon-td-60m-5000': { publicId: 'salmon-td-60mo', preferSeedName: true, defaults: salmonTermDefaults(60) },
  'salmon-td-12m-500000': { publicId: 'salmon-td-12mo', preferSeedName: true, defaults: salmonTermDefaults(12) },
  'salmon-td-60m-500000': { publicId: 'salmon-td-60mo', preferSeedName: true, defaults: salmonTermDefaults(60) },
  'salmon-td-12m-1000000': { publicId: 'salmon-td-12mo', preferSeedName: true, defaults: salmonTermDefaults(12) },
  'salmon-td-60m-1000000': { publicId: 'salmon-td-60mo', preferSeedName: true, defaults: salmonTermDefaults(60) },
  'netbank:netbank-savings': { publicId: 'netbank-savings' },
  'netbank-savings-new': { publicId: 'netbank-savings' },
  'netbank-savings-existing': { publicId: 'netbank-savings' },
  'netbank:netbank-time-deposit': { publicId: 'netbank-td-12mo', preferSeedName: true },
  'netbank-time-deposit': { publicId: 'netbank-td-12mo', preferSeedName: true },
  'ownbank:ownbank-savings': {
    publicId: 'ownbank-savings',
    defaults: bankDefaults('OwnBank', 'ownbank', { name: 'OwnBank Savings', tierType: 'flat' }),
  },
  'ownbank-savings': {
    publicId: 'ownbank-savings',
    defaults: bankDefaults('OwnBank', 'ownbank', { name: 'OwnBank Savings', tierType: 'flat' }),
  },
  'komo:komo-savings': { publicId: 'komo-savings' },
  'diskartech:diskartech-savings': { publicId: 'diskartech-savings' },
  'banko:banko-todo-savings': { publicId: 'bpi-banko-savings' },
  'banko-todo-savings': { publicId: 'bpi-banko-savings' },
  'landbank:landbank-passbook-savings': {
    publicId: 'landbank-passbook-savings',
    defaults: bankDefaults('Landbank', 'landbank', { name: 'LANDBANK Regular Passbook Savings', tierType: 'threshold' }),
  },
  'landbank-passbook-savings': {
    publicId: 'landbank-passbook-savings',
    defaults: bankDefaults('Landbank', 'landbank', { name: 'LANDBANK Regular Passbook Savings', tierType: 'threshold' }),
  },
  'dbp:dbp-savings': { publicId: 'dbp-savings' },
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

function stripProviderPrefix(productId: string) {
  return productId.includes(':') ? productId.split(':').slice(1).join(':') : productId;
}

function isDeniedSnapshotProduct(rawValue: unknown, sourceProductId: string | null) {
  const raw = isRecord(rawValue) ? rawValue : {};
  const productIds = [
    sourceProductId,
    getString(raw.id),
    getString(raw.productId),
    getString(raw.product_id),
  ].filter((value): value is string => Boolean(value));

  return productIds.some((productId) => (
    DENIED_SNAPSHOT_PRODUCT_IDS.has(productId)
    || DENIED_SNAPSHOT_PRODUCT_IDS.has(stripProviderPrefix(productId))
  ));
}

function getSnapshotMapping(snapshotKey: string, sourceProductId: string | null) {
  return SCRAPER_PRODUCT_MAPPINGS[snapshotKey]
    ?? (sourceProductId ? SCRAPER_PRODUCT_MAPPINGS[sourceProductId] : undefined)
    ?? SCRAPER_PRODUCT_MAPPINGS[stripProviderPrefix(snapshotKey)]
    ?? (sourceProductId ? SCRAPER_PRODUCT_MAPPINGS[stripProviderPrefix(sourceProductId)] : undefined);
}

function resolveSnapshotIdentity(sourceProductId: string | null, snapshot: SnapshotRecord, index: number) {
  const structuredId = getString(snapshot.id);

  if (structuredId) {
    const mapping = SCRAPER_PRODUCT_MAPPINGS[structuredId] ?? SCRAPER_PRODUCT_MAPPINGS[stripProviderPrefix(structuredId)];
    return {
      snapshotKey: structuredId,
      publicId: mapping?.publicId ?? stripProviderPrefix(structuredId),
      mapping,
    };
  }

  const snapshotKey = getString(snapshot.productId)
    ?? getString(snapshot.product_id)
    ?? sourceProductId
    ?? `snapshot-${index}`;
  const mapping = getSnapshotMapping(snapshotKey, sourceProductId);

  return {
    snapshotKey,
    publicId: mapping?.publicId ?? stripProviderPrefix(snapshotKey),
    mapping,
  };
}

function providerSlug(sourceProductId: string | null, snapshot: SnapshotRecord) {
  const rawProvider = getString(snapshot.provider) ?? getString(snapshot.providerDisplayName);
  if (rawProvider) return rawProvider;
  if (sourceProductId?.includes(':')) return sourceProductId.split(':')[0];
  return null;
}

function inferLockInDays(productId: string, productName: string) {
  const normalized = `${productId} ${productName}`.toLowerCase();
  const monthMatch = normalized.match(/(?:td-|time deposit[^0-9]*)(\d{1,2})m|(\d{1,2})[-\s]*month/);
  const months = Number.parseInt(monthMatch?.[1] ?? monthMatch?.[2] ?? '', 10);
  if (Number.isFinite(months) && months > 0) return Math.round((365 / 12) * months);
  if (normalized.includes('time-deposit') || normalized.includes('time deposit') || normalized.includes('maxsave')) return 365;
  return 0;
}

function isTermProduct(productId: string, productName: string) {
  return inferLockInDays(productId, productName) > 0;
}

function isTierType(value: unknown): value is RateProduct['tierType'] {
  return value === 'flat' || value === 'blended' || value === 'threshold';
}

function resolveTiers(
  raw: SnapshotRecord,
  seed: RateProduct | undefined,
  grossRate: number,
  afterTaxRate: number,
): RateProduct['tiers'] {
  const rawTiers = Array.isArray(raw.tiers) ? raw.tiers as RateProduct['tiers'] : null;

  if (rawTiers?.length === 1 && seed?.tiers.length === 1) {
    return [{
      ...seed.tiers[0],
      grossRate: rawTiers[0]?.grossRate ?? grossRate,
      afterTaxRate: rawTiers[0]?.afterTaxRate ?? afterTaxRate,
    }];
  }

  // Scraper has 1 capped tier but seed defines a multi-tier blended structure.
  // Take the scraper's fresh rate for tier 1; preserve seed's remaining tiers.
  if (rawTiers?.length === 1 && rawTiers[0]?.maxBalance !== null && seed && seed.tiers.length > 1) {
    return [
      { ...seed.tiers[0], grossRate: rawTiers[0].grossRate, afterTaxRate: rawTiers[0].afterTaxRate },
      ...seed.tiers.slice(1),
    ];
  }

  if (rawTiers?.length) return rawTiers;
  if (seed?.tiers.length) return seed.tiers;
  return [{ minBalance: 0, maxBalance: null, grossRate, afterTaxRate }];
}

function resolveConditions(
  raw: SnapshotRecord,
  seed: RateProduct | undefined,
  mappingDefaults: Partial<RateProduct> | undefined,
  validUntil: string | null,
): RateProduct['conditions'] {
  const baseConditions = Array.isArray(raw.conditions)
    ? raw.conditions as RateProduct['conditions']
    : seed?.conditions ?? mappingDefaults?.conditions ?? [];

  if (!validUntil) return baseConditions;

  let appliedToPromo = false;
  const conditionsWithExpiry = baseConditions.map((condition) => {
    if (condition.type === 'promo' && !condition.expiresAt) {
      appliedToPromo = true;
      return { ...condition, expiresAt: validUntil };
    }
    return condition;
  });

  if (appliedToPromo || conditionsWithExpiry.some((condition) => condition.expiresAt === validUntil)) {
    return conditionsWithExpiry;
  }

  return [
    ...conditionsWithExpiry,
    {
      type: 'time_limited',
      description: `Promotional headline rate valid until ${validUntil}.`,
      expiresAt: validUntil,
    },
  ];
}

function mergeManualPublicRates(rates: RateProduct[], localRates: RateProduct[]) {
  const existingIds = new Set(rates.map((rate) => rate.id));
  const manualRates = localRates.filter((rate) => (
    MANUAL_PUBLIC_RATE_IDS.has(rate.id) && !existingIds.has(rate.id)
  ));
  return [...rates, ...manualRates];
}

function getSnapshotHydrationScore(rawValue: unknown, sourceProductId: string | null, publicId: string) {
  const raw = isRecord(rawValue) ? rawValue : {};
  const structuredId = getString(raw.id);
  let score = 0;

  if (structuredId) score += 100;
  if (structuredId && stripProviderPrefix(structuredId) === publicId) score += 50;
  if (sourceProductId && stripProviderPrefix(sourceProductId) === publicId) score += 20;

  return score;
}

function dedupeHydratedSnapshotRates(entries: HydratedSnapshotEntry[]) {
  const bestById = new Map<string, HydratedSnapshotEntry>();

  for (const entry of entries) {
    const existing = bestById.get(entry.rate.id);
    if (!existing || entry.score > existing.score || (entry.score === existing.score && entry.index > existing.index)) {
      bestById.set(entry.rate.id, entry);
    }
  }

  return [...bestById.values()].map((entry) => entry.rate);
}

function hydrateSnapshotRate(
  rawValue: unknown,
  sourceProductId: string | null,
  generatedAt: string | null,
  seedRatesById: Map<string, RateProduct>,
  index: number,
): RateProduct {
  const raw = isRecord(rawValue) ? rawValue : {};
  const { publicId, mapping } = resolveSnapshotIdentity(sourceProductId, raw, index);
  const mappingDefaults = mapping?.defaults;
  const id = publicId;
  const seed = seedRatesById.get(id);
  const providerKey = providerSlug(sourceProductId, raw);
  const normalizedKey = normalizeProviderKey(providerKey);
  const defaults = normalizedKey ? PROVIDER_DEFAULTS[normalizedKey] : undefined;
  const rawProductName = getString(raw.productName) ?? getString(raw.name);
  const productName = mapping?.preferSeedName
    ? seed?.name ?? rawProductName ?? mappingDefaults?.name ?? id
    : rawProductName ?? seed?.name ?? mappingDefaults?.name ?? id;
  const providerName = getString(raw.providerDisplayName) ?? seed?.provider ?? mappingDefaults?.provider ?? providerKey ?? 'Unknown Provider';
  const rawBaseRate = isRecord(raw.baseRate) ? raw.baseRate : {};
  const headlineRate = getNumber(raw.headlineRate, seed?.headlineRate ?? 0);
  const grossRate = getNumber(rawBaseRate.grossRate, seed?.baseRate.grossRate ?? headlineRate);
  const afterTaxRate = getNumber(rawBaseRate.afterTaxRate, seed?.baseRate.afterTaxRate ?? grossRate * 0.8);
  const baseRate = { grossRate, afterTaxRate };
  const tiers = resolveTiers(raw, seed, grossRate, afterTaxRate);
  const validUntil = getString(raw.validUntil) ?? getString(raw.valid_until);
  const lockInDays = seed?.lockInDays ?? mappingDefaults?.lockInDays ?? inferLockInDays(id, productName);
  const payoutFrequency = seed?.payoutFrequency
    ?? mappingDefaults?.payoutFrequency
    ?? (isTermProduct(id, productName) ? 'at_maturity' : 'daily');

  return normalizeRateProduct({
    id,
    name: productName,
    provider: providerName,
    logo: seed?.logo ?? mappingDefaults?.logo ?? defaults?.logo ?? '',
    category: seed?.category ?? mappingDefaults?.category ?? 'banks',
    headlineRate,
    baseRate,
    tierType: mappingDefaults?.tierType ?? (isTierType(raw.tierType) ? raw.tierType : seed?.tierType ?? 'threshold'),
    tiers,
    conditions: resolveConditions(raw, seed, mappingDefaults, validUntil),
    taxExempt: seed?.taxExempt ?? mappingDefaults?.taxExempt ?? false,
    payoutFrequency,
    lockInDays,
    riskLevel: seed?.riskLevel ?? mappingDefaults?.riskLevel ?? 'Low',
    pdic: seed?.pdic ?? mappingDefaults?.pdic ?? true,
    insurer: seed?.insurer ?? mappingDefaults?.insurer ?? 'PDIC',
    lastVerified: getString(raw.lastVerified) ?? generatedAt?.slice(0, 10) ?? seed?.lastVerified ?? '',
    limits: seed?.limits ?? mappingDefaults?.limits,
    affiliateUrl: seed?.affiliateUrl ?? mappingDefaults?.affiliateUrl ?? defaults?.affiliateUrl ?? '',
    referralCode: seed?.referralCode ?? mappingDefaults?.referralCode ?? '',
    payoutAmount: seed?.payoutAmount ?? mappingDefaults?.payoutAmount ?? 0,
    trueValueScore: seed?.trueValueScore ?? mappingDefaults?.trueValueScore ?? 3,
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

  const localRates = getLocalRates();
  const seedRatesById = new Map(localRates.map((rate) => [rate.id, rate]));
  const sourceProductIds = Array.isArray(snapshot.source_product_ids)
    ? snapshot.source_product_ids.map((id) => getString(id))
    : [];
  const generatedAt = getString(snapshot.generated_at);

  const hydratedRates = snapshot.payload.flatMap((raw, index) => {
    const sourceProductId = sourceProductIds[index] ?? null;
    if (isDeniedSnapshotProduct(raw, sourceProductId)) return [];

    const rate = hydrateSnapshotRate(raw, sourceProductId, generatedAt, seedRatesById, index);
    return [{
      rate,
      score: getSnapshotHydrationScore(raw, sourceProductId, rate.id),
      index,
    }];
  });
  return mergeManualPublicRates(dedupeHydratedSnapshotRates(hydratedRates), localRates);
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
  // Home page/General list should only show Banks and MP2.
  // MMFs/UITFs have their own dedicated page.
  return rates.filter((rate) => rate.category === 'banks' || rate.id === 'pagibig-mp2');
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

export async function getLastScrapedAt(): Promise<string | null> {
  const client = createSupabaseAdminClient('public');
  if (!client) return null;

  const { data, error } = await client
    .from('scrape_metadata')
    .select('ran_at')
    .eq('key', 'deposit_banks')
    .single();

  if (error || !data) return null;
  return (data as { ran_at: string }).ran_at;
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
