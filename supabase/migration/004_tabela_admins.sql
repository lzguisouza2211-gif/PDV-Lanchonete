--criando tabela admins
create table if not exists admins (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  nome text not null,
  email text not null,

  ativo boolean default true,
  criado_em timestamptz default now(),

  unique (user_id),
  unique (email)
);

alter table admins enable row level security;

--policies
create policy "admin_read_own_data"
on admins
for select
using (
  auth.uid() = user_id
);


