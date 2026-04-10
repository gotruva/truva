import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// IP extraction
// ---------------------------------------------------------------------------

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Origin validation (CSRF guard for browser-submitted forms)
// Requests with no Origin header (curl, server-to-server) are allowed through;
// they're covered by rate limiting instead.
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:3001']
    : ['https://gotruva.com', 'https://www.gotruva.com'];

export function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // no Origin header → not a cross-site browser request
  return ALLOWED_ORIGINS.includes(origin);
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per serverless instance)
// Good enough for MVP. Replace with Upstash when scaling to multiple regions.
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

export function checkRateLimit(
  key: string,
  windowMs: number,
  max: number
): RateLimitResult {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  entry.count += 1;
  store.set(key, entry);

  if (entry.count > max) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfterSec: 0 };
}

// ---------------------------------------------------------------------------
// Request body size guard
// ---------------------------------------------------------------------------

export function isBodyTooLarge(req: NextRequest, maxBytes = 102_400): boolean {
  const contentLength = req.headers.get('content-length');
  if (!contentLength) return false;
  return parseInt(contentLength, 10) > maxBytes;
}
