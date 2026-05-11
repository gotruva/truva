import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { checkRateLimit, getClientIp, isAllowedOrigin, isBodyTooLarge } from '@/lib/apiSecurity';
import { createClient } from '@/utils/supabase/server';

const BANKING_EVENT_TYPES = [
  'landing_view',
  'form_started',
  'form_completed',
  'recommendation_view',
  'recommendation_apply_click',
  'list_scrolled',
  'list_apply_click',
  'faq_opened',
  'skip_to_list_click',
] as const;

const bankingEventSchema = z.object({
  event_type: z.enum(BANKING_EVENT_TYPES),
  page_view_id: z.string().min(1).max(64).trim().optional(),
  page_path: z.string().startsWith('/').max(255).optional(),
  horizon: z.enum(['anytime', 'short', 'year', 'long']).optional(),
  liquidity: z.enum(['flexible', 'lockable']).optional(),
  amount: z.number().min(0).max(1_000_000_000).optional(),
  question_id: z.number().int().min(1).max(20).optional(),
  placement: z.string().max(80).trim().optional(),
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
    const { allowed, retryAfterSec } = checkRateLimit(`banking-event:${ip}`, 60 * 1000, 120);

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

    const parsed = bankingEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('banking_landing_events').insert(parsed.data);

    if (error) {
      console.error('Banking event insert failed', {
        code: error.code,
        message: error.message,
      });
      return NextResponse.json({ error: 'Failed to record event.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Banking events route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
