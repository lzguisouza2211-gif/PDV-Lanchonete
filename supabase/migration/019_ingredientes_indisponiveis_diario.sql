-- Migration 019: Ingredientes indisponíveis por dia

create table ingredientes_indisponiveis_dia (
  id bigserial primary key,
  cardapio_id bigint not null references cardapio(id) on delete cascade,
  ingrediente text not null,
  valid_on date not null default current_date,
  created_at timestamptz not null default now()
);

-- Evita duplicar o mesmo ingrediente para o mesmo produto no mesmo dia
create unique index ingredientes_indisponiveis_dia_unique
  on ingredientes_indisponiveis_dia(cardapio_id, ingrediente, valid_on);

-- Habilitar RLS
alter table ingredientes_indisponiveis_dia enable row level security;

-- Policies (Postgres não suporta "if not exists" para policy)
drop policy if exists public_select_ingredientes_indisponiveis on ingredientes_indisponiveis_dia;
create policy public_select_ingredientes_indisponiveis
on ingredientes_indisponiveis_dia
for select
using (true);

drop policy if exists admin_manage_ingredientes_indisponiveis on ingredientes_indisponiveis_dia;
create policy admin_manage_ingredientes_indisponiveis
on ingredientes_indisponiveis_dia
for all
using (auth.uid() in (select user_id from admins where ativo = true))
with check (auth.uid() in (select user_id from admins where ativo = true));

comment on table ingredientes_indisponiveis_dia is 'Ingredientes marcados como indisponíveis por dia para cada produto';
