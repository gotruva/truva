import { NextResponse } from 'next/server';
import { getLiveRates } from '@/lib/rates';

export async function GET() {
  try {
    const rates = await getLiveRates();
    return NextResponse.json(rates);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
  }
}
