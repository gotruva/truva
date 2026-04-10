import fs from 'fs';
import path from 'path';

import type { RateProduct } from '@/types';
import type { RateSnapshotChannel } from '@/types/rate-pipeline';

import { createSupabaseAdminClient } from './supabase-admin';
import { fetchAaveBaseUSDC } from './defi';

function getLocalRates(): RateProduct[] {
  const filePath = path.join(process.cwd(), 'data', 'rates.json');

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContents);
    if (!Array.isArray(parsed)) throw new Error('rates.json must be an array');
    return parsed as RateProduct[];
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

async function getPublishedSnapshotRates(channel: RateSnapshotChannel): Promise<RateProduct[] | null> {
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
  return Array.isArray(snapshot?.payload) ? (snapshot.payload as RateProduct[]) : null;
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
