import { createClient } from '@supabase/supabase-js';

function getAdminCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export function hasSupabaseAdminEnv() {
  return Boolean(getAdminCredentials());
}

export function createSupabaseAdminClient(schema: string = 'public') {
  const credentials = getAdminCredentials();
  if (!credentials) return null;

  return createClient(credentials.url, credentials.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema },
  });
}
