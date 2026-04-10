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

for (const key of critical) {
  if (!process.env[key]) {
    if (isBuildPhase) {
      console.warn(`Build: missing env var ${key} — required at runtime.`);
    } else {
      throw new Error(`Missing required environment variable: ${key}. Check your .env.local file.`);
    }
  }
}

for (const key of optional) {
  if (!process.env[key]) {
    console.warn(`Missing optional env var: ${key} — related features will be disabled.`);
  }
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
};

export function hasSupabaseEnv() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
