-- Migration 064
-- Recria policies de whatsapp_notifications para ambientes sem essas policies
-- Data: 2026-02-05

-- Remove policies antigas se existirem
DROP POLICY IF EXISTS "Allow delete whatsapp_notifications admin" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "Allow insert whatsapp_notifications" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "Allow read whatsapp_notifications" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "Allow update whatsapp_notifications admin" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "allow_select_whatsapp_notifications" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "anon_can_insert_whatsapp_notifications" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "authenticated_can_insert_whatsapp_notifications" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "admin_can_delete_whatsapp_notifications" ON public.whatsapp_notifications;
DROP POLICY IF EXISTS "admin_can_update_whatsapp_notifications" ON public.whatsapp_notifications;

-- Admin pode deletar
CREATE POLICY "Allow delete whatsapp_notifications admin"
ON public.whatsapp_notifications
FOR DELETE
TO public
USING (auth.role() = 'admin'::text);

-- Authenticated pode inserir
CREATE POLICY "Allow insert whatsapp_notifications"
ON public.whatsapp_notifications
FOR INSERT
TO public
WITH CHECK (auth.role() = 'authenticated'::text);

-- Leitura liberada
CREATE POLICY "Allow read whatsapp_notifications"
ON public.whatsapp_notifications
FOR SELECT
TO public
USING (true);

-- Admin pode atualizar (role admin)
CREATE POLICY "Allow update whatsapp_notifications admin"
ON public.whatsapp_notifications
FOR UPDATE
TO public
USING (auth.role() = 'admin'::text);

-- Alias de leitura
CREATE POLICY "allow_select_whatsapp_notifications"
ON public.whatsapp_notifications
FOR SELECT
TO public
USING (true);

-- Anon pode inserir
CREATE POLICY "anon_can_insert_whatsapp_notifications"
ON public.whatsapp_notifications
FOR INSERT
TO anon
WITH CHECK (true);

-- Authenticated pode inserir (policy específica)
CREATE POLICY "authenticated_can_insert_whatsapp_notifications"
ON public.whatsapp_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin policy por tabela admins
CREATE POLICY "admin_can_delete_whatsapp_notifications"
ON public.whatsapp_notifications
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM admins
    WHERE admins.user_id = auth.uid()
      AND admins.ativo = true
  )
);

CREATE POLICY "admin_can_update_whatsapp_notifications"
ON public.whatsapp_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM admins
    WHERE admins.user_id = auth.uid()
      AND admins.ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM admins
    WHERE admins.user_id = auth.uid()
      AND admins.ativo = true
  )
);
