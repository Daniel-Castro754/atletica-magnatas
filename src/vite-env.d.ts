/// <reference types="vite/client" />

interface ImportMetaEnv {
  // ── Supabase (produção) ────────────────────────────────────────────────────
  // Quando definidas, o site usa Supabase Auth para login e RLS para escrita.
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;

  // ── Dev fallback ──────────────────────────────────────────────────────────
  // Usadas apenas quando Supabase NÃO está configurado (desenvolvimento local).
  // Não definir em ambiente de produção com Supabase — serão ignoradas.
  readonly VITE_ADMIN_EMAIL?: string;
  // VITE_ADMIN_PASSWORD: variável de dev, nunca definir em produção.
  // Em produção, a senha do admin é gerenciada pelo Supabase Auth.
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_BLOCKED_EMAIL?: string;

  // ── Configuração geral ────────────────────────────────────────────────────
  readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
