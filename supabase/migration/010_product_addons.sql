-- ============================================
-- TABELA DE ADICIONAIS POR PRODUTO
-- ============================================
-- Permite gerenciar extras (adicionais e remoções) por produto

create table if not exists product_addons (
  id bigint generated always as identity primary key,
  product_id bigint not null references cardapio(id) on delete cascade,
  nome text not null,
  preco numeric not null default 0,
  tipo text not null check (tipo in ('add', 'remove')),
  ativo boolean default true,
  ordem integer default 0,
  criado_at timestamptz default now(),
  atualizado_at timestamptz default now()
);

create index if not exists product_addons_product_id_idx on product_addons(product_id);
create index if not exists product_addons_ativo_idx on product_addons(ativo);

-- RLS
alter table product_addons enable row level security;

-- Leitura pública (para cardápio)
create policy "public_read_product_addons"
on product_addons
for select
using (true);

-- Apenas admins podem inserir/atualizar/deletar
create policy "admin_manage_product_addons"
on product_addons
for all
using (
  exists (
    select 1
    from admins
    where admins.user_id = auth.uid()
      and admins.ativo = true
  )
)
with check (
  exists (
    select 1
    from admins
    where admins.user_id = auth.uid()
      and admins.ativo = true
  )
);

-- Trigger para atualizar updated_at
create or replace function update_product_addons_updated_at()
returns trigger as $$
begin
  new.atualizado_at = now();
  return new;
end;
$$ language plpgsql;

create trigger product_addons_updated_at
before update on product_addons
for each row
execute function update_product_addons_updated_at();

