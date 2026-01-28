-- Migration 029
-- Criação das tabelas de ingredientes auxiliares.
-- Data: 2026-01-28
-- Migration: Criar tabelas para ingredientes adicionáveis e removíveis
-- Data: 2026-01-19

-- Tabela de ingredientes que podem ser ADICIONADOS aos produtos
create table if not exists public.adicional (
  id bigserial primary key,
  product_id bigint not null references public.cardapio(id) on delete cascade,
  nome text not null,
  preco numeric(10, 2) not null default 0,
  ativo boolean default true,
  ordem integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de ingredientes que podem ser RETIRADOS dos produtos
create table if not exists public.retirar_ingred (
  id bigserial primary key,
  product_id bigint not null references public.cardapio(id) on delete cascade,
  nome text not null,
  ativo boolean default true,
  ordem integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices para melhor performance
create index if not exists adicional_product_id_idx on public.adicional(product_id);
create index if not exists adicional_ativo_idx on public.adicional(ativo);
create index if not exists retirar_ingred_product_id_idx on public.retirar_ingred(product_id);
create index if not exists retirar_ingred_ativo_idx on public.retirar_ingred(ativo);

-- Habilitar RLS
alter table public.adicional enable row level security;
alter table public.retirar_ingred enable row level security;

-- Policies para ADICIONAL
create policy "public_read_adicional"
on public.adicional
for select
using (ativo = true);

create policy "admin_manage_adicional"
on public.adicional
for all
using (
  exists(
    select 1 from public.admins 
    where admins.user_id = auth.uid()
  )
);

-- Policies para RETIRAR_INGRED
create policy "public_read_retirar_ingred"
on public.retirar_ingred
for select
using (ativo = true);

create policy "admin_manage_retirar_ingred"
on public.retirar_ingred
for all
using (
  exists(
    select 1 from public.admins 
    where admins.user_id = auth.uid()
  )
);

-- Função para atualizar timestamp
create or replace function public.update_adicional_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_retirar_ingred_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para atualizar timestamp
create trigger adicional_updated_at
before update on public.adicional
for each row
execute function public.update_adicional_updated_at();

create trigger retirar_ingred_updated_at
before update on public.retirar_ingred
for each row
execute function public.update_retirar_ingred_updated_at();
