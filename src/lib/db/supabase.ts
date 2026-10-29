import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Aceita a URL do projeto mesmo que tenha sido colada com sufixos (ex.: /rest/v1/)
 * ou com a URL do painel (supabase.com/dashboard/project/<ref>), devolvendo só a origem.
 */
function normalizeUrl(raw: string): string {
  const v = raw.trim().replace(/^["']|["']$/g, '');
  try {
    const u = new URL(v);
    const m = u.pathname.match(/\/project\/([a-z0-9]+)/i);
    if (u.hostname.endsWith('supabase.com') && m) return `https://${m[1]}.supabase.co`;
    return u.origin;
  } catch {
    return v;
  }
}

/** Cliente Supabase exclusivo do servidor (service_role). Nunca importar no navegador. */
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('[Supabase] Variáveis SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY ausentes.');
    throw new Error('Supabase não configurado');
  }
  client = createClient(normalizeUrl(url), key.trim().replace(/^["']|["']$/g, ''), {
    auth: { persistSession: false },
  });
  return client;
}

export const IMAGE_BUCKET = 'site-images';
