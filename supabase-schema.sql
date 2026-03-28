-- ============================================================
-- Magnatas Atlética — Supabase Schema
-- Executar no SQL Editor do Supabase Dashboard
-- ============================================================

-- Tabela única flexível para todos os dados do site.
-- Usa JSONB para preservar os tipos TypeScript existentes sem mapeamento.
--
-- Chaves usadas:
--   'magnatas_branding_config'   → BrandingConfig
--   'magnatas_site_content'      → SiteContentConfig
--   'magnatas_events_config'     → EventsConfig (eventos + categorias + pageContent)
--   'magnatas_governance_content'→ GovernanceContent
--   'magnatas_product_catalog'   → Product[]
--   'magnatas_orders'            → { version: 2, orders: SubmittedOrder[] }

create table if not exists site_config (
  id          text        primary key,
  value       jsonb       not null,
  updated_at  timestamptz default now()
);

-- Row Level Security
alter table site_config enable row level security;

-- Leitura pública (visitantes veem produtos, eventos, branding)
create policy "Leitura publica"
  on site_config for select
  using (true);

-- Escrita total via anon key (protegida pela chave anon do Supabase)
-- Em produção, restringir com autenticação para escrita de admin
create policy "Escrita total"
  on site_config for all
  using (true)
  with check (true);
