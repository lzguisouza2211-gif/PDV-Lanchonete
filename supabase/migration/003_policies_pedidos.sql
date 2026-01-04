-- POLICY CORRETA PARA ANON
create policy "authenticated_can_insert_pedidos"
on pedidos
for insert
to authenticated
with check (true);

--policy admin
create policy "admin_can_read_all_pedidos"
on pedidos
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

create policy "admin_can_update_pedidos"
on pedidos
for update
to authenticated
using (
  exists (
    select 1
    from admins
    where admins.user_id = auth.uid()
      and admins.ativo = true
  )
);

