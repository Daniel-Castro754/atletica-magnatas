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

-- ── Políticas RLS ─────────────────────────────────────────────────────────────

-- Leitura pública: visitantes e admin podem ler qualquer chave
create policy "Leitura publica"
  on site_config for select
  using (true);

-- Escrita administrativa: somente usuários autenticados via Supabase Auth
-- O frontend usa supabase.auth.signInWithPassword() para obter uma sessão;
-- o cliente Supabase inclui o JWT nas requisições automaticamente.
-- Sem sessão válida, qualquer tentativa de INSERT/UPDATE/DELETE é rejeitada
-- pelo banco de dados, independente da lógica do frontend.
drop policy if exists "Escrita total" on site_config;

create policy "Escrita autenticada"
  on site_config for all
  using     (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ── Tabela de pedidos (separada de site_config) ──────────────────────────────
-- Cada linha = um pedido. Isso permite políticas de acesso granulares:
-- clientes podem criar pedidos sem autenticação; admin lê e atualiza com auth.
--
-- Migração: após aplicar este schema, o conteúdo antigo de site_config onde
-- id = 'magnatas_orders' pode ser removido com:
--   delete from site_config where id = 'magnatas_orders';

create table if not exists orders (
  id          text        primary key,
  data        jsonb       not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table orders enable row level security;

-- Clientes podem criar pedidos sem estarem autenticados
create policy "Criar pedido publico"
  on orders for insert
  with check (true);

-- Somente admins autenticados podem ler pedidos (dados pessoais do cliente)
create policy "Leitura de pedidos admin"
  on orders for select
  using (auth.uid() is not null);

-- Somente admins autenticados podem atualizar status do pedido
create policy "Atualizar pedido admin"
  on orders for update
  using     (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Somente admins autenticados podem deletar pedidos
create policy "Deletar pedido admin"
  on orders for delete
  using (auth.uid() is not null);

-- ── Criar usuário admin no Supabase Auth ──────────────────────────────────────
-- Execute UMA VEZ no SQL Editor (substitua e-mail e senha reais):
--
--   select auth.create_user(
--     '{"email": "diretoria@suaatletica.com", "password": "SenhaSegura123!"}'::jsonb
--   );
--
-- Ou crie via: Dashboard → Authentication → Users → "Invite user" / "Add user"
-- A senha NÃO precisa estar em nenhum arquivo de código ou .env em produção.
-- ─────────────────────────────────────────────────────────────────────────────
