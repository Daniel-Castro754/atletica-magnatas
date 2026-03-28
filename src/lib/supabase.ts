import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Cliente Supabase. Pode ser null se as variáveis de ambiente não estiverem
 * configuradas (dev sem .env.local), garantindo fallback para localStorage.
 */
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Lê um valor da tabela site_config pelo id (chave).
 * Retorna null se Supabase não estiver disponível ou se a chave não existir.
 */
export async function getSupabaseConfig<T>(key: string): Promise<T | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('id', key)
      .maybeSingle();
    if (error || !data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

/**
 * Grava um valor na tabela site_config (upsert por id).
 * Fire-and-forget — falhas são silenciosas para não bloquear a UI.
 */
export async function setSupabaseConfig<T>(key: string, value: T): Promise<void> {
  if (!supabase) return;
  try {
    await supabase
      .from('site_config')
      .upsert({ id: key, value, updated_at: new Date().toISOString() });
  } catch {
    // Falha silenciosa — localStorage permanece como fallback
  }
}
