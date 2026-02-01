-- ============================================
-- TABELA DE FECHAMENTOS DE CAIXA
-- ============================================

create table if not exists fechamentos_caixa (
  id bigint generated always as identity primary key,
  data date not null,
  periodo text not null, -- 'dia' ou 'mes'
  total numeric not null,
  total_pedidos integer not null,
  pix_valor numeric not null default 0,
  pix_quantidade integer not null default 0,
  dinheiro_valor numeric not null default 0,
  dinheiro_quantidade integer not null default 0,
  cartao_valor numeric not null default 0,
  cartao_quantidade integer not null default 0,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists fechamentos_caixa_data_idx on fechamentos_caixa(data);
create index if not exists fechamentos_caixa_periodo_idx on fechamentos_caixa(periodo);

-- RLS
alter table fechamentos_caixa enable row level security;

-- Apenas admins podem inserir fechamentos
create policy "admin_can_insert_fechamentos"
on fechamentos_caixa
for insert
to authenticated
with check (
  exists (
    select 1
    from admins
    where admins.user_id = auth.uid()
      and admins.ativo = true
  -- Migration 007
  -- Criação da tabela de fechamentos de caixa para controle financeiro.
  -- Data: 2026-01-28
  )
-- Apenas admins podem ver fechamentos
create policy "admin_can_select_fechamentos"
on fechamentos_caixa
for select
to authenticated
using (
  exists (
    select 1
    from admins
    where admins.user_id = auth.uid()
      and admins.ativo = true
  )
);

