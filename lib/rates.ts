import { RateProduct } from '@/types';
import { fetchAaveBaseUSDC } from './defi';
import fs from 'fs';
import path from 'path';

async function getStaticRates(): Promise<RateProduct[]> {
  const filePath = path.join(process.cwd(), 'data', 'rates.json');
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContents);
    if (!Array.isArray(parsed)) throw new Error('rates.json must be an array');
    return parsed as RateProduct[];
  } catch (err) {
    console.error('Failed to load rates data:', err);
    return [];
  }
}

export function getPublicRatesFromList(rates: RateProduct[]): RateProduct[] {
  return rates.filter((rate) => rate.category === 'banks');
}

export async function getPublicRates(): Promise<RateProduct[]> {
  return getPublicRatesFromList(await getStaticRates());
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
  const staticRates = await getStaticRates();
  const defiRate = await fetchAaveBaseUSDC();
  
  return staticRates.map((r) => {
    if (r.id === 'aave-v3-usdc-base' && defiRate) {
      const liveGross = defiRate.apy / 100;
      return { 
        ...r, 
        headlineRate: liveGross,
        baseRate: { grossRate: liveGross, afterTaxRate: liveGross },
        tiers: [
          { minBalance: 0, maxBalance: null, grossRate: liveGross, afterTaxRate: liveGross }
        ],
      };
    }
    return r;
  });
}
