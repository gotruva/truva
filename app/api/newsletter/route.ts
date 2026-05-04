import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';
import { hasSupabaseEnv } from '@/lib/env';
import { getClientIp, isAllowedOrigin, checkRateLimit, isBodyTooLarge } from '@/lib/apiSecurity';

const emailSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
  source: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isBodyTooLarge(req)) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        { error: 'Newsletter signup is not configured in this local environment yet.' },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const { allowed, retryAfterSec } = checkRateLimit(
      `newsletter:${ip}`,
      60 * 1000,
      5
    );

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = emailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { email, source } = parsed.data;

    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase
      .from('subscribers')
      .insert({ email, ...(source ? { source } : {}) });

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
