-- Migration 063
-- Reativa enqueue de notificações por mudança de status em pedidos
-- Data: 2026-02-05
-- ============================================

CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  mensagem_cliente TEXT;
  é_novo_pedido BOOLEAN;
  itens_formatado TEXT;
  troco_str TEXT;
BEGIN
  IF NEW.phone IS NULL OR TRIM(NEW.phone) = '' THEN
    RETURN NEW;
  END IF;

  é_novo_pedido := (TG_OP = 'INSERT');

  IF é_novo_pedido THEN
    itens_formatado := public.format_pedido_itens_from_table(NEW.id);
    troco_str := '';
    IF NEW.troco IS NOT NULL AND TRIM(COALESCE(NEW.troco::TEXT, '')) <> '' THEN
      troco_str := E'\nTroco: R$ ' || to_char(COALESCE(NEW.troco::numeric, 0), 'FM999990.00');
    END IF;
    mensagem_cliente :=
      '✅ *Pedido Recebido*' || E'\n\n' ||
      'Olá, *' || NEW.cliente || '*' || E'\n\n' ||
      'Seu pedido:' || E'\n' ||
      itens_formatado || E'\n' ||
      'foi confirmado!!' || E'\n\n' ||
      '💰 Total: R$ ' || to_char(COALESCE(NEW.total, 0), 'FM999990.00') || troco_str || E'\n' ||
      'Pagamento: ' || COALESCE(NEW.formapagamento, 'não informado') || E'\n' ||
      'Tipo: ' || COALESCE(NEW.tipoentrega, 'não informado');
    INSERT INTO whatsapp_notifications
      (pedido_id, cliente, phone, message, status_anterior, status_novo, created_at)
    VALUES
      (NEW.id, NEW.cliente, NEW.phone, mensagem_cliente, NULL, NEW.status, NOW());
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'Em preparo' THEN
      mensagem_cliente := '👨‍🍳 Seu pedido está em preparo!';
    ELSIF NEW.status = 'Finalizado' THEN
      IF NEW.tipoentrega = 'entrega' THEN
        mensagem_cliente := '🏍️ Seu pedido saiu para entrega!';
      ELSE
        mensagem_cliente := '✅ Seu pedido está pronto!';
      END IF;
    ELSE
      mensagem_cliente := '📦 Status do seu pedido: ' || NEW.status;
    END IF;

    INSERT INTO whatsapp_notifications
      (pedido_id, cliente, phone, message, status_anterior, status_novo, created_at)
    VALUES
      (NEW.id, NEW.cliente, NEW.phone, mensagem_cliente, OLD.status, NEW.status, NOW());
  END IF;
  RETURN NEW;
END;
$$;

-- Garante trigger atualizado
DROP TRIGGER IF EXISTS trg_whatsapp_notification ON public.pedidos;
CREATE TRIGGER trg_whatsapp_notification
AFTER INSERT OR UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_notification();

-- ============================================
-- FIM DA MIGRATION 063
-- ============================================
