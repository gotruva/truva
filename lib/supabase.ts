import { createClient } from '@/utils/supabase/server';

export async function createSupabaseServerClient() {
  return await createClient();
}
