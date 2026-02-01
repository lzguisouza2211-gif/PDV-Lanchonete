-- Migration 059
-- Correção de Policies para whatsapp_notifications
-- Problema: Policy conflitante em 046 bloqueava INSERT de anon/sistema
-- Data: 2026-02-01

-- Remove policies conflitantes criadas em 046
DROP POLICY IF EXISTS "Allow insert whatsapp_notifications" ON whatsapp_notifications;
DROP POLICY IF EXISTS "Allow update whatsapp_notifications admin" ON whatsapp_notifications;
DROP POLICY IF EXISTS "Allow delete whatsapp_notifications admin" ON whatsapp_notifications;
DROP POLICY IF EXISTS "Allow read whatsapp_notifications" ON whatsapp_notifications;

-- Recreate policies com regras corretas

-- ANON pode inserir notificações
CREATE POLICY "anon_can_insert_whatsapp_notifications"
ON whatsapp_notifications
FOR INSERT
TO anon
WITH CHECK (true);

-- AUTHENTICATED pode inserir notificações
CREATE POLICY "authenticated_can_insert_whatsapp_notifications"
ON whatsapp_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Todos podem ler notificações
CREATE POLICY "allow_select_whatsapp_notifications"
ON whatsapp_notifications
FOR SELECT
USING (true);

-- ADMIN pode atualizar notificações
CREATE POLICY "admin_can_update_whatsapp_notifications"
ON whatsapp_notifications
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

-- ADMIN pode deletar notificações
CREATE POLICY "admin_can_delete_whatsapp_notifications"
ON whatsapp_notifications
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
