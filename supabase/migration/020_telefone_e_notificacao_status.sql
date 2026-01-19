-- ============================================
-- Migration 020: Telefone do cliente e notificações WhatsApp por status
-- ============================================

-- 1. Adicionar coluna telefone na tabela pedidos
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS telefone TEXT;

COMMENT ON COLUMN pedidos.telefone IS 'Telefone do cliente para notificações WhatsApp';

-- 2. Atualizar função de notificação para enviar em todas mudanças de status
CREATE OR REPLACE FUNCTION public.notify_pedido_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  status_msg TEXT;
BEGIN
  -- Só notifica se o status mudou
  IF old.status IS DISTINCT FROM new.status THEN
    
    -- Define mensagem baseada no status
    CASE new.status
      WHEN 'Recebido' THEN
        status_msg := '✅ Pedido recebido! Estamos preparando seu pedido.';
      WHEN 'Confirmacao' THEN
        status_msg := '👨‍🍳 Pedido confirmado! Sua comida está sendo preparada.';
      WHEN 'Preparando' THEN
        status_msg := '🔥 Seu pedido está sendo preparado com carinho!';
      WHEN 'Pronto' THEN
        status_msg := '🎉 Pedido pronto! Você já pode retirar ou aguardar a entrega.';
      WHEN 'Saiu para entrega' THEN
        status_msg := '🛵 Pedido saiu para entrega! Logo estará aí.';
      WHEN 'Concluído' THEN
        status_msg := '✨ Pedido concluído! Obrigado pela preferência!';
      WHEN 'Cancelado' THEN
        status_msg := '❌ Pedido cancelado. Entre em contato conosco se tiver dúvidas.';
      ELSE
        status_msg := '📦 Status do pedido atualizado: ' || new.status;
    END CASE;

    -- Envia notificação via webhook N8N (apenas se houver telefone)
    IF new.telefone IS NOT NULL AND new.telefone != '' THEN
      PERFORM
        net.http_post(
          url := 'http://localhost:5678/webhook/pedido-status',
          headers := jsonb_build_object(
            'Content-Type', 'application/json'
          ),
          body := jsonb_build_object(
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
          )
        );
    END IF;

  END IF;

  RETURN new;
END;
$$;

-- 3. Remover trigger antigo e criar novo
DROP TRIGGER IF EXISTS trg_notify_pedido_confirmado ON pedidos;
DROP TRIGGER IF EXISTS trg_notify_pedido_status_change ON pedidos;

CREATE TRIGGER trg_notify_pedido_status_change
AFTER UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION public.notify_pedido_status_change();

COMMENT ON FUNCTION public.notify_pedido_status_change() IS 
'Envia notificação WhatsApp via N8N quando o status do pedido muda';
