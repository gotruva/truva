import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export function getAdminClient(schema: string = 'public') {
  const client = createSupabaseAdminClient(schema);
  if (!client) {
    throw new Error('Supabase admin client could not be created. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  }
  return client;
}
