import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';
import { hasSupabaseEnv } from '@/lib/env';
import { getClientIp, isAllowedOrigin, checkRateLimit, isBodyTooLarge } from '@/lib/apiSecurity';

const feedbackSchema = z.object({
  type: z.enum(['Bug', 'Feature Request', 'Other']),
  message: z.string().min(10).max(500).trim(),
  email: z.string().email().max(254).optional().or(z.literal('')),
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
        { error: 'Feedback is not configured in this local environment yet.' },
        { status: 503 }
      );
    }

    const ip = getClientIp(req);
    const { allowed, retryAfterSec } = checkRateLimit(
      `feedback:${ip}`,
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

    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { type, message, email } = parsed.data;

    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase
      .from('feedback')
      .insert({ type, message, email: email || null });

    if (dbError) {
      console.error('Supabase feedback error:', dbError);
      return NextResponse.json({ error: 'Failed to submit feedback. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Thanks for your feedback!' });

  } catch (error) {
    console.error('Feedback Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
