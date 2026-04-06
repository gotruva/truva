import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';

const feedbackSchema = z.object({
  type: z.enum(['Bug', 'Feature Request', 'Other']),
  message: z.string().min(10).max(500),
  email: z.string().email().optional().or(z.literal('')),
});

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

export async function POST(req: NextRequest) {
  try {
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
