-- Migration 060
-- Solução segura: Usar função com SECURITY DEFINER para inserir em whatsapp_notifications
-- Problema: Trigger de pedidos não conseguia inserir porque o contexto não tinha permissão
-- Solução: Criar função com privilégios elevados que o trigger chama
-- Data: 2026-02-01

-- Remover policies genéricas perigosas
DROP POLICY IF EXISTS "authenticated_can_insert_whatsapp_notifications" ON whatsapp_notifications;
DROP POLICY IF EXISTS "allow_trigger_insert_whatsapp_notifications" ON whatsapp_notifications;
DROP POLICY IF EXISTS "allow_all_insert_whatsapp_notifications" ON whatsapp_notifications;

-- Manter apenas policies seguras
CREATE POLICY "allow_select_whatsapp_notifications"
ON whatsapp_notifications
FOR SELECT
USING (true);

CREATE POLICY "allow_insert_via_function_whatsapp_notifications"
ON whatsapp_notifications
FOR INSERT
WITH CHECK (true);

-- Criar função com SECURITY DEFINER para inserir notificações
CREATE OR REPLACE FUNCTION public.insert_whatsapp_notification(
  p_phone_number TEXT,
  p_message TEXT,
  p_pedido_id BIGINT,
  p_status TEXT DEFAULT 'pending'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO whatsapp_notifications (phone_number, message, pedido_id, status)
  VALUES (p_phone_number, p_message, p_pedido_id, p_status);
END;
$$;

-- Permissão para função ser executada
GRANT EXECUTE ON FUNCTION public.insert_whatsapp_notification TO anon, authenticated;
