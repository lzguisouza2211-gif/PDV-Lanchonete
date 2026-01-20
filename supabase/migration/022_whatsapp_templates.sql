-- ============================================
-- Migration 022: Templates de WhatsApp na fila
-- ============================================

-- 1) Novas colunas para template
ALTER TABLE whatsapp_notifications
ADD COLUMN IF NOT EXISTS template_id TEXT,
ADD COLUMN IF NOT EXISTS template_params JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN whatsapp_notifications.template_id IS 'Nome/ID do template no provedor (ex: wa_status_atualizado)';
COMMENT ON COLUMN whatsapp_notifications.template_params IS 'Parâmetros do template (JSON)';

-- 2) Atualizar função para popular template_id e template_params
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  status_msg TEXT;
  tpl_id TEXT;
  tpl_params JSONB := '{}'::jsonb;
BEGIN
  IF old.status IS DISTINCT FROM new.status AND new.telefone IS NOT NULL AND new.telefone <> '' THEN
    CASE new.status
      WHEN 'Recebido' THEN 
        status_msg := '✅ Pedido recebido! Estamos preparando seu pedido.';
        tpl_id := 'pedido_recebido';
      WHEN 'Confirmacao' THEN 
        status_msg := '👨‍🍳 Pedido confirmado! Sua comida está sendo preparada.';
        tpl_id := 'pedido_confirmado';
      WHEN 'Preparando' THEN 
        status_msg := '🔥 Seu pedido está sendo preparado com carinho!';
        tpl_id := 'pedido_preparando';
      WHEN 'Pronto' THEN 
        status_msg := '🎉 Pedido pronto! Você já pode retirar ou aguardar a entrega.';
        tpl_id := 'pedido_pronto';
      WHEN 'Saiu para entrega' THEN 
        status_msg := '🛵 Pedido saiu para entrega! Logo estará aí.';
        tpl_id := 'pedido_saiu_entrega';
      WHEN 'Concluído' THEN 
        status_msg := '✨ Pedido concluído! Obrigado pela preferência!';
        tpl_id := 'pedido_concluido';
      WHEN 'Cancelado' THEN 
        status_msg := '❌ Pedido cancelado. Entre em contato conosco se tiver dúvidas.';
        tpl_id := 'pedido_cancelado';
      ELSE 
        status_msg := '📦 Status do pedido atualizado: ' || new.status;
        tpl_id := 'pedido_status_atualizado';
    END CASE;

    tpl_params := jsonb_build_object(
      'cliente', new.cliente,
      'pedido_id', new.id,
      'status_novo', new.status,
      'total', new.total,
      'tipoentrega', new.tipoentrega,
      'endereco', new.endereco,
      'formapagamento', new.formapagamento
    );

    INSERT INTO whatsapp_notifications (
      pedido_id, cliente, telefone, status_anterior, status_novo, mensagem, payload, status, template_id, template_params
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
        'created_at', new.created_at,
        'template_id', tpl_id,
        'template_params', tpl_params
      ),
      'pending',
      tpl_id,
      tpl_params
    );
  END IF;

  RETURN new;
END;
$$;

-- 3) Recriar trigger (continua o mesmo nome)
DROP TRIGGER IF EXISTS trg_enqueue_whatsapp_notification ON pedidos;
CREATE TRIGGER trg_enqueue_whatsapp_notification
AFTER UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_notification();
