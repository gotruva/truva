import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { checkRateLimit, getClientIp, isAllowedOrigin, isBodyTooLarge } from '@/lib/apiSecurity';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { AFFILIATE_PLACEMENTS } from '@/types';

const providerExpandSchema = z.object({
  provider: z.string().min(1).max(120).trim(),
  page_path: z.string().startsWith('/').max(255),
  placement: z.enum(AFFILIATE_PLACEMENTS),
  page_view_id: z.string().min(1).max(64).trim(),
});

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isBodyTooLarge(req)) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    const ip = getClientIp(req);
    const { allowed, retryAfterSec } = checkRateLimit(`affiliate-expand:${ip}`, 60 * 1000, 240);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = providerExpandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient('public');
    if (!supabase) {
      return NextResponse.json(
        { error: 'Affiliate expansion tracking is not configured in this environment.' },
        { status: 503 },
      );
    }

    const { error } = await supabase.from('affiliate_provider_expands').insert({
      ...parsed.data,
      referrer: req.headers.get('referer') ?? null,
    });

    if (error) {
      console.error('Affiliate provider expand insert failed', {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ error: 'Failed to record provider expansion.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Affiliate provider expands route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
