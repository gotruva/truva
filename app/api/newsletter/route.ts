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
           console.log('Sending email to:', email);
           console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
           const resend = new Resend(process.env.RESEND_API_KEY);
           await resend.emails.send({
             from: 'Truva <onboarding@resend.dev>', // Replace with your verified domain
             to: email,
             subject: 'Welcome to Truva — The PH Savings Pulse',
             html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Truva</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a56db;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:1.5px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Philippine Savings Intelligence</p>
              <h1 style="margin:0;font-size:32px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Truva</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">You're on the list.</h2>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#374151;">
                Every week, we cut through the noise and show you the <strong>highest after-tax yields</strong> from Philippine digital banks, time deposits, government bonds, and more — in plain language.
              </p>

              <!-- Highlight box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-left:4px solid #1a56db;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">Why after-tax matters</p>
                    <p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:#1d4ed8;">
                      A 6% gross rate is really 4.8% after the 20% withholding tax. We do the math so you don't have to.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#374151;">
                Your first rate digest is coming soon. In the meantime, check out the live comparison table at <a href="https://truva.ph" style="color:#1a56db;font-weight:600;text-decoration:none;">truva.ph</a>.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1a56db;border-radius:8px;">
                    <a href="https://truva.ph" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">View today's top rates →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                You're receiving this because you signed up at truva.ph.<br />
                No spam, ever. <a href="#" style="color:#6b7280;text-decoration:underline;">Unsubscribe anytime.</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
           });
           console.log('Email sent successfully to:', email);
       } catch (emailErr) {
           console.error('Resend email error:', emailErr);
           // Do not throw; we want UI to show success assuming they meant to signup
       }
    } else {
       console.log('RESEND_API_KEY not found in environment');
    }
    
    return NextResponse.json({ success: true, message: 'Subscribed successfully! Watch your inbox.' });
    
  } catch (error) {
    console.error('Newsletter Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
