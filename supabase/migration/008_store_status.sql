-- Migration 008
-- Criação da tabela para status da loja (aberta/fechada).
-- Data: 2026-01-28
create table if not exists store_status (
  id smallint primary key default 1,
  is_open boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into store_status (id, is_open)
values (1, true)
on conflict (id) do nothing;

alter table store_status enable row level security;

create policy "public_read_store_status"
on store_status
for select
using (true);

create policy "admin_update_store_status"
on store_status
for update
using (
  auth.uid() in (
    select user_id from admins where ativo = true
  )
)
with check (
  auth.uid() in (
    select user_id from admins where ativo = true
  )
);


