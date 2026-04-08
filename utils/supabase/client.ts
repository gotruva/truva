import { createBrowserClient } from '@supabase/ssr'
import { hasSupabaseEnv } from '@/lib/env'

export function createClient() {
  if (!hasSupabaseEnv()) {
    throw new Error('Supabase is not configured for this environment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable client-side Supabase features.')
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
