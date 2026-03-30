import { RateProduct } from '@/types';
import { fetchAaveBaseUSDC } from './defi';
import fs from 'fs';
import path from 'path';

async function getStaticRates(): Promise<RateProduct[]> {
  const filePath = path.join(process.cwd(), 'data', 'rates.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents) as RateProduct[];
}

export async function getLiveRates(): Promise<RateProduct[]> {
  const staticRates = await getStaticRates();
  const defiRate = await fetchAaveBaseUSDC();
  
  return staticRates.map((r) => {
    if (r.id === 'aave-v3-usdc-base' && defiRate) {
      return { 
        ...r, 
        grossRate: defiRate.apy / 100, 
        afterTaxRate: defiRate.apy / 100 
      };
    }
    return r;
  });
}
