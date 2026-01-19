-- Remove todos os triggers de notificação que dependem do schema 'net'
-- Mantém apenas o trigger de updated_at que funciona corretamente

-- Drop triggers
DROP TRIGGER IF EXISTS trg_enqueue_whatsapp_notification ON public.pedidos;
DROP TRIGGER IF EXISTS trg_notify_pedido_status ON public.pedidos;
DROP TRIGGER IF EXISTS trg_notify_pedido_status_change ON public.pedidos;

-- Drop functions
DROP FUNCTION IF EXISTS public.enqueue_whatsapp_notification();
DROP FUNCTION IF EXISTS public.notify_pedido_status();
DROP FUNCTION IF EXISTS public.notify_pedido_status_change();

-- O trigger trg_set_updated_at e sua função set_updated_at são mantidos
-- pois não dependem de extensões externas
