import { z } from 'zod';
import { DefiRate } from '@/types';

const llamaPoolSchema = z.object({
  project: z.string(),
  chain: z.string(),
  symbol: z.string(),
  apy: z.number().finite().nonnegative(),
  apyMean30d: z.number().finite().nonnegative(),
  tvlUsd: z.number().finite().nonnegative(),
});

const llamaResponseSchema = z.object({
  data: z.array(llamaPoolSchema.passthrough()),
});

export async function fetchAaveBaseUSDC(): Promise<DefiRate | null> {
  try {
    const res = await fetch('https://yields.llama.fi/pools', {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      throw new Error(`DeFi upstream returned ${res.status}`);
    }
    const raw = await res.json();
    const { data } = llamaResponseSchema.parse(raw);
    const pool = data.find((p) => p.project === 'aave-v3' && p.chain === 'Base' && p.symbol === 'USDC');
    if (!pool) return null;
    return { apy: pool.apy, apyMean30d: pool.apyMean30d, tvlUsd: pool.tvlUsd };
  } catch (error) {
    console.error('Failed to fetch Aave Base USDC rate:', error);
    return null; // degrade gracefully
  }
}
