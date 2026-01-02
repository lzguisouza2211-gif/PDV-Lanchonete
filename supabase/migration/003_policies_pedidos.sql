-- POLICY CORRETA PARA ANON
create policy "anon_can_insert_pedidos"
on pedidos
for insert
to anon
with check (true);

--policy admin
create policy "admin_read_pedidos"
on pedidos
for select
to authenticated
using (
  auth.jwt() ->> 'role' = 'admin'
);
