-- Adiciona coluna telefone obrigatória na tabela pedidos
alter table public.pedidos
add column if not exists telefone text;

-- Preenche registros existentes com placeholder
update public.pedidos
set telefone = coalesce(nullif(telefone, ''), '(00)00000-0000');

-- Define NOT NULL após preencher
alter table public.pedidos
alter column telefone set not null;
