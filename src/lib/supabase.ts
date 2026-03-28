import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Cliente Supabase. Pode ser null se as variáveis de ambiente não estiverem
 * configuradas (dev sem .env.local), garantindo fallback para localStorage.
 */
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const DEV = import.meta.env.DEV;

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
    if (error) {
      if (DEV) console.warn(`[supabase] getSupabaseConfig("${key}") erro:`, error);
      return null;
    }
    if (!data) return null;
    return data.value as T;
  } catch (err) {
    if (DEV) console.warn(`[supabase] getSupabaseConfig("${key}") exceção:`, err);
    return null;
  }
}

/**
 * Grava um valor na tabela site_config (upsert por id).
 * Fire-and-forget — falhas são silenciosas em produção para não bloquear a UI.
 */
export async function setSupabaseConfig<T>(key: string, value: T): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: key, value, updated_at: new Date().toISOString() });
    if (error) {
      if (DEV) console.warn(`[supabase] setSupabaseConfig("${key}") erro:`, error);
      return false;
    }
    return true;
  } catch (err) {
    if (DEV) console.warn(`[supabase] setSupabaseConfig("${key}") exceção:`, err);
    return false;
  }
}

/**
 * Busca config da nuvem, normaliza via callback e persiste no localStorage.
 * Retorna o valor normalizado ou null se Supabase não estiver disponível ou a chave não existir.
 */
export async function syncConfigFromSupabase<T>(
  key: string,
  normalize: (raw: unknown) => T
): Promise<T | null> {
  const raw = await getSupabaseConfig<unknown>(key);
  if (raw === null) return null;
  const merged = normalize(raw);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(merged));
    }
  } catch {}
  return merged;
}
