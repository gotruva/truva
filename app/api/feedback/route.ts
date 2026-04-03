import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Resend } from 'resend';

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
    try {
      const { error: dbError } = await supabase
        .from('feedback')
        .insert({ type, message, email: email || null });
      if (dbError) {
        console.warn('Supabase feedback insertion warning:', dbError);
      }
    } catch (e) {
      console.warn('Supabase not fully configured yet.', e);
    }

    if (process.env.RESEND_API_KEY && process.env.FOUNDER_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Truva <onboarding@resend.dev>',
          to: process.env.FOUNDER_EMAIL,
          subject: `[Truva Feedback] ${type}`,
          html: `
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Message:</strong> ${message}</p>
            ${email ? `<p><strong>Reply to:</strong> ${email}</p>` : ''}
          `,
        });
      } catch (emailErr) {
        console.error('Resend feedback notification error:', emailErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Thanks for your feedback!' });

  } catch (error) {
    console.error('Feedback Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
