-- 055: Ajusta mensagem WhatsApp para exibir itens, adicionais, retirados e troco
-- Data: 2026-01-29
-- ============================================
-- Esta migration ajusta a função enqueue_whatsapp_notification para detalhar os itens do pedido na mensagem enviada ao cliente

CREATE OR REPLACE FUNCTION public.format_pedido_itens_from_table(pedido_id BIGINT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  resultado TEXT := '';
  item RECORD;
  adicional RECORD;
  retirado RECORD;
BEGIN
  FOR item IN 
    SELECT nome, quantidade, adicionais, retirados, observacoes
    FROM pedido_itens
    WHERE pedido_itens.pedido_id = format_pedido_itens_from_table.pedido_id
  LOOP
    resultado := resultado || '🍔 ' || item.quantidade || 'x ' || item.nome || E'\n';
    -- Adicionais
    IF item.adicionais IS NOT NULL AND jsonb_array_length(item.adicionais) > 0 THEN
      FOR adicional IN SELECT value->>'nome' as nome FROM jsonb_array_elements(item.adicionais)
      LOOP
        resultado := resultado || '   + ' || adicional.nome || E'\n';
      END LOOP;
    END IF;
    -- Retirados
    IF item.retirados IS NOT NULL AND jsonb_array_length(item.retirados) > 0 THEN
      FOR retirado IN SELECT value->>'nome' as nome FROM jsonb_array_elements(item.retirados)
      LOOP
        resultado := resultado || '   - Sem ' || retirado.nome || E'\n';
      END LOOP;
    END IF;
    -- Observações
    IF item.observacoes IS NOT NULL AND TRIM(item.observacoes) != '' THEN
      resultado := resultado || '   📝 ' || item.observacoes || E'\n';
    END IF;
    resultado := resultado || E'\n';
  END LOOP;
  RETURN resultado;
END;
$$;

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
    -- (mantém lógica de status, sem alteração)
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Recria o trigger (opcional, se necessário)
DROP TRIGGER IF EXISTS trg_whatsapp_notification ON public.pedidos;
CREATE TRIGGER trg_whatsapp_notification
AFTER INSERT OR UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_notification();

-- ============================================
-- FIM DA MIGRATION 055
-- ============================================
