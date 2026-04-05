import { DefiRate } from '@/types';

export async function fetchAaveBaseUSDC(): Promise<DefiRate | null> {
  try {
    const res = await fetch('https://yields.llama.fi/pools', {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      throw new Error(`DeFi upstream returned ${res.status}`);
    }
    const { data } = await res.json();
    const pool = data.find(
      (p: { project: string; chain: string; symbol: string; apy: number; apyMean30d: number; tvlUsd: number }) => p.project === 'aave-v3' && p.chain === 'Base' && p.symbol === 'USDC'
    );
    if (!pool) return null;
    return { apy: pool.apy, apyMean30d: pool.apyMean30d, tvlUsd: pool.tvlUsd };
  } catch (error) {
    console.error('Failed to fetch Aave Base USDC rate:', error);
    return null; // degrade gracefully
  }
}
