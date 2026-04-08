import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';
import { hasSupabaseEnv } from '@/lib/env';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(req: NextRequest) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        { error: 'Newsletter signup is not configured in this local environment yet.' },
        { status: 503 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    let rateData = rateLimitMap.get(ip);
    if (!rateData || rateData.resetTime < now) {
      rateData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    }

    rateData.count++;
    rateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = emailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const email = parsed.data.email;

    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase
      .from('subscribers')
      .insert({ email });

    if (dbError) {
      if (dbError.code === '23505') {
        return NextResponse.json({ success: true, message: "You're already subscribed!" });
      }
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscribed! Check back soon for rate digests.' });

  } catch (error) {
    console.error('Newsletter Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
