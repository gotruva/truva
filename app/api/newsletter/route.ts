import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Resend } from 'resend';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

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
    const parsed = emailSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    
    const email = parsed.data.email;

    // 1. Attempt to log in Supabase `subscribers` table if Auth/DB configured
    const supabase = await createSupabaseServerClient();
    try {
      const { error: dbError } = await supabase
        .from('subscribers')
        .insert({ email });
      if (dbError && dbError.code !== '23505') {
         console.warn('Supabase insertion warning (safe to ignore if table missing):', dbError);
      }
    } catch (e) {
      console.warn('Supabase not fully configured yet.', e);
    }

    // 2. Transmit Welcome Email via Resend if Key exists
    if (process.env.RESEND_API_KEY) {
       try {
           const resend = new Resend(process.env.RESEND_API_KEY);
           await resend.emails.send({
             from: 'Truva <onboarding@resend.dev>', // Replace with your verified domain
             to: email,
             subject: 'Welcome to Truva — The PH Savings Pulse',
             html: '<p>You are on the list! We will send you the highest yielding Philippine digital bank accounts and time deposits straight to your inbox.</p>',
           });
       } catch (emailErr) {
           console.error('Resend email error:', emailErr);
           // Do not throw; we want UI to show success assuming they meant to signup
       }
    }
    
    return NextResponse.json({ success: true, message: 'Subscribed successfully! Watch your inbox.' });
    
  } catch (error) {
    console.error('Newsletter Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
