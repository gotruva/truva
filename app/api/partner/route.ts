import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';
import { hasSupabaseEnv } from '@/lib/env';
import { getClientIp, isAllowedOrigin, checkRateLimit, isBodyTooLarge } from '@/lib/apiSecurity';

const partnerSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  company: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254),
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
        { error: 'Partner submissions are not configured in this local environment yet.' },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const { allowed, retryAfterSec } = checkRateLimit(
      `partner:${ip}`,
      60 * 1000,
      3
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

    const parsed = partnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { name, company, email } = parsed.data;

    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase
      .from('partner_inquiries')
      .insert({ name, company, email });

    if (dbError) {
      console.error('Supabase partner inquiry error:', dbError);
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Thanks! We'll be in touch soon." });

  } catch (error) {
    console.error('Partner Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
