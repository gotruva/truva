// Critical: app cannot function without these
const critical = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

// Optional: features degrade gracefully without these
const optional = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
] as const;

// NEXT_PHASE is set during `next build` — don't throw then, since some env
// vars are only injected at runtime (e.g. on Vercel). Throw only at runtime.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
};

// We check these after defining the 'env' object to ensure static replacement 
// by the bundler (Next.js/Turbopack) works correctly on the client.
if (!isBuildPhase) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL. Check your .env.local file.');
  }
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local file.');
  }
}

// Optional warns
if (!isBuildPhase) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) console.warn('Missing optional env var: SUPABASE_SERVICE_ROLE_KEY');
  if (!env.RESEND_API_KEY) console.warn('Missing optional env var: RESEND_API_KEY');
}

export function hasSupabaseEnv() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

