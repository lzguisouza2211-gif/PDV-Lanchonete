-- ============================================
-- POLICIES RLS PARA PEDIDOS
-- ============================================
-- 
-- SEGURANÇA:
-- - Anon: Pode apenas INSERT e SELECT de pedidos sem user_id
-- - Anon: NÃO pode UPDATE ou DELETE (garantido pela ausência de policies)
-- - Authenticated: Pode INSERT e SELECT de seus próprios pedidos
-- - Admin: Pode SELECT, UPDATE e DELETE de todos os pedidos
-- 
-- IMPORTANTE: Apenas admins podem alterar status de pedidos
-- ============================================

-- Remover policies antigas conflitantes
drop policy if exists "anon_insert_pedidos" on pedidos;
drop policy if exists "authenticated_can_insert_pedidos" on pedidos;
drop policy if exists "admin_can_read_all_pedidos" on pedidos;
drop policy if exists "admin_can_update_pedidos" on pedidos;
drop policy if exists "anon_can_insert_pedidos" on pedidos;
drop policy if exists "anon_can_view_own_pedidos" on pedidos;
drop policy if exists "authenticated_can_view_own_pedidos" on pedidos;
drop policy if exists "admin_can_delete_pedidos" on pedidos;

-- ============================================
-- POLICIES PARA ANON (usuários não autenticados)
-- ============================================

-- Anon pode inserir pedidos (sem user_id obrigatório)
create policy "anon_can_insert_pedidos"
on pedidos
for insert
to anon
with check (true);

-- Anon pode ver pedidos sem user_id (pedidos anônimos)
-- Nota: Anon não pode ver pedidos de outros usuários autenticados
create policy "anon_can_view_own_pedidos"
on pedidos
for select
to anon
using (
  user_id is null
);

-- ============================================
-- POLICIES PARA AUTHENTICATED (usuários autenticados)
-- ============================================

-- Authenticated pode inserir pedidos
create policy "authenticated_can_insert_pedidos"
on pedidos
for insert
to authenticated
with check (true);

-- Authenticated pode ver seus próprios pedidos
create policy "authenticated_can_view_own_pedidos"
on pedidos
for select
to authenticated
using (
  user_id = auth.uid()
);

-- ============================================
-- POLICIES PARA ADMIN (administradores)
-- ============================================

-- Admin pode ver todos os pedidos
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

-- Admin pode atualizar pedidos
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
)
with check (
  exists (
    select 1
    from admins
    where admins.user_id = auth.uid()
      and admins.ativo = true
  )
);

-- Admin pode deletar pedidos (se necessário)
create policy "admin_can_delete_pedidos"
on pedidos
for delete
to authenticated
using (
  exists (
    select 1
    from admins
    where admins.user_id = auth.uid()
      and admins.ativo = true
  )
);

