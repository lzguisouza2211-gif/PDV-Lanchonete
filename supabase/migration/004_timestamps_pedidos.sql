-- ============================================
-- ADD TIMESTAMPS TO PEDIDOS
-- ============================================

-- 1. created_at (data de criação)
alter table public.pedidos
add column if not exists created_at timestamptz not null default now();

-- 2. updated_at (última atualização)
alter table public.pedidos
add column if not exists updated_at timestamptz not null default now();

-- ============================================
-- TRIGGER PARA updated_at
-- ============================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_updated_at on public.pedidos;

create trigger trg_set_updated_at
before update on public.pedidos
for each row
execute procedure public.set_updated_at();

