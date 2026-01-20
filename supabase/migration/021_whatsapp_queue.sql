-- ============================================
-- Migration 021: Fila de notificações WhatsApp
-- ============================================

-- Tabela para enfileirar notificações de status de pedidos
CREATE TABLE IF NOT EXISTS whatsapp_notifications (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id        BIGINT NOT NULL,
  cliente          TEXT,
  telefone         TEXT,
  status_anterior  TEXT,
  status_novo      TEXT,
  mensagem         TEXT,
  payload          JSONB,
  status           TEXT NOT NULL DEFAULT 'pending', -- pending | sent | error
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at     TIMESTAMPTZ
);

COMMENT ON TABLE whatsapp_notifications IS 'Fila para envio de mensagens WhatsApp via n8n';
COMMENT ON COLUMN whatsapp_notifications.status IS 'pending | sent | error';

-- Índices úteis
CREATE INDEX IF NOT EXISTS whatsapp_notifications_status_idx ON whatsapp_notifications(status);
CREATE INDEX IF NOT EXISTS whatsapp_notifications_pedido_idx ON whatsapp_notifications(pedido_id);

-- Função: enfileira notificação a cada mudança de status de pedido
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  status_msg TEXT;
BEGIN
  IF old.status IS DISTINCT FROM new.status AND new.telefone IS NOT NULL AND new.telefone <> '' THEN
    CASE new.status
      WHEN 'Recebido' THEN status_msg := '✅ Pedido recebido! Estamos preparando seu pedido.';
      WHEN 'Confirmacao' THEN status_msg := '👨‍🍳 Pedido confirmado! Sua comida está sendo preparada.';
      WHEN 'Preparando' THEN status_msg := '🔥 Seu pedido está sendo preparado com carinho!';
      WHEN 'Pronto' THEN status_msg := '🎉 Pedido pronto! Você já pode retirar ou aguardar a entrega.';
      WHEN 'Saiu para entrega' THEN status_msg := '🛵 Pedido saiu para entrega! Logo estará aí.';
      WHEN 'Concluído' THEN status_msg := '✨ Pedido concluído! Obrigado pela preferência!';
      WHEN 'Cancelado' THEN status_msg := '❌ Pedido cancelado. Entre em contato conosco se tiver dúvidas.';
      ELSE status_msg := '📦 Status do pedido atualizado: ' || new.status;
    END CASE;

    INSERT INTO whatsapp_notifications (
      pedido_id, cliente, telefone, status_anterior, status_novo, mensagem, payload, status
    ) VALUES (
      new.id,
      new.cliente,
      new.telefone,
      old.status,
      new.status,
      status_msg,
      jsonb_build_object(
        'pedido_id', new.id,
        'cliente', new.cliente,
        'telefone', new.telefone,
        'total', new.total,
        'status_anterior', old.status,
        'status_novo', new.status,
        'mensagem', status_msg,
        'tipoentrega', new.tipoentrega,
        'endereco', new.endereco,
        'formapagamento', new.formapagamento,
        'created_at', new.created_at
      ),
      'pending'
    );
  END IF;

  RETURN new;
END;
$$;

-- Trigger: enfileira após update de pedidos
DROP TRIGGER IF EXISTS trg_enqueue_whatsapp_notification ON pedidos;
CREATE TRIGGER trg_enqueue_whatsapp_notification
AFTER UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_notification();

-- (Opcional) RLS pode ser adicionada conforme necessidade; mantido público por simplicidade
