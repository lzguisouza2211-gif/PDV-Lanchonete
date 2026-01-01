alter table pedidos
add column if not exists user_id uuid references auth.users(id);

alter table pedidos enable row level security;

-- Permitir que usuários autenticados insiram pedidos vinculados ao seu próprio ID
create policy "user can insert pedido"
on pedidos for insert with check (
    auth.uid() = user_id
);

-- Permitir que usuários autenticados vejam apenas seus próprios pedidos
create policy "user can select own pedidos"
on pedidos for select using (
    auth.uid() = user_id
);

--permitir que admin selecione, atualize e delete pedidos
create policy "admin can read all pedidos"
on pedidos for select using (
    auth.jwt() ->> 'role' = 'admin'
);

create policy "admin can delete pedidos"
on pedidos for delete using (
    auth.jwt() ->> 'role' = 'admin'
);

create policy "admin can update pedidos"
on pedidos for update using (
    auth.jwt() ->> 'role' = 'admin'
);