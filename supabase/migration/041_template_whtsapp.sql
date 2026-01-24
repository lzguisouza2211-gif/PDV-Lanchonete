-- ============================================
-- Migration 041: Template WhatsApp atualizado
-- Remove número do pedido, remove tempo estimado, valor formatado como real
-- ============================================

CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  mensagem_cliente TEXT;
  é_novo_pedido BOOLEAN;
  itens_formatado TEXT;
BEGIN
  IF NEW.phone IS NULL OR TRIM(NEW.phone) = '' THEN
    RETURN NEW;
  END IF;

  é_novo_pedido := (TG_OP = 'INSERT');

  IF é_novo_pedido THEN
    itens_formatado := public.format_pedido_itens(NEW.itens);

    mensagem_cliente :=
      '✅ *Pedido Recebido*' || E'\n\n' ||
      'Olá, *' || NEW.cliente || '*' || E'\n\n' ||
      'Seu pedido:' || E'\n' ||
      itens_formatado || E'\n' ||
      'foi confirmado!!' || E'\n\n' ||
      '💰 Total: R$ ' || to_char(COALESCE(NEW.total, 0), 'FM999990.00');

    INSERT INTO whatsapp_notifications
      (pedido_id, cliente, phone, message, status_anterior, status_novo, created_at)
    VALUES
      (NEW.id, NEW.cliente, NEW.phone, mensagem_cliente, NULL, NEW.status, NOW());

  -- ...restante igual...
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Aqui você pode manter a lógica dos outros status normalmente
    -- Exemplo:
    -- mensagem_cliente := '...';
    -- INSERT INTO whatsapp_notifications (...);
  END IF;

  RETURN NEW;
END;
$$;

-- Não esqueça de criar ou recriar o trigger, se necessário:
-- DROP TRIGGER IF EXISTS trg_whatsapp_notification ON public.pedidos;
-- CREATE TRIGGER trg_whatsapp_notification
-- AFTER INSERT OR UPDATE ON public.pedidos
-- FOR EACH ROW
-- EXECUTE FUNCTION public.enqueue_whatsapp_notification();