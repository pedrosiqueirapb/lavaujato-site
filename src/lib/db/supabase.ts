import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Cliente Supabase exclusivo do servidor (service_role). Nunca importar no navegador. */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const IMAGE_BUCKET = 'site-images';
