import { supabase } from './supabase';

export async function uploadArquivo(
  file: File,
  pasta: 'documentos' | 'editais' | 'relatorios' | 'geral' = 'geral'
): Promise<string | null> {
  if (!supabase) return null;

  const nomeOriginal = file.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
  const nome = `${pasta}/${Date.now()}-${nomeOriginal}`;

  const { error } = await supabase.storage
    .from('arquivos')
    .upload(nome, file, { upsert: true });

  if (error) {
    console.error('Erro no upload:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('arquivos')
    .getPublicUrl(nome);

  return data.publicUrl;
}

export async function deletarArquivo(url: string): Promise<void> {
  if (!supabase) return;
  const path = url.split('/arquivos/')[1];
  if (!path) return;
  await supabase.storage.from('arquivos').remove([path]);
}
