import { NextResponse } from 'next/server';
import { fetchAaveBaseUSDC } from '@/lib/defi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const defiRate = await fetchAaveBaseUSDC();
    if (!defiRate) {
      return NextResponse.json({ error: 'Failed to fetch DeFi rates' }, { status: 502 });
    }
    return NextResponse.json(defiRate);
  } catch {
    return NextResponse.json({ error: 'Failed to proxy DeFi rates' }, { status: 500 });
  }
}
