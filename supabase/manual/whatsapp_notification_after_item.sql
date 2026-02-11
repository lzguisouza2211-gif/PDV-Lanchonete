-- Move a notificação WhatsApp para após inserir itens
-- (evita mensagem sem itens)

-- 1) Remove o trigger antigo na tabela pedidos
DROP TRIGGER IF EXISTS trg_whatsapp_notification ON public.pedidos;

-- 2) Recria formatador com SECURITY DEFINER (evita RLS bloquear leitura)
CREATE OR REPLACE FUNCTION public.format_pedido_itens_from_table(pedido_id bigint)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 3) Cria função que enfileira a mensagem quando o primeiro item é inserido
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_after_item()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  pedido_rec RECORD;
  itens_formatado TEXT;
  mensagem_cliente TEXT;
  troco_str TEXT;
BEGIN
  -- Evita duplicidade: só enfileira se ainda não existe notificação do pedido
  IF EXISTS (
    SELECT 1 FROM whatsapp_notifications
    WHERE pedido_id = NEW.pedido_id AND status_anterior IS NULL
  ) THEN
    RETURN NEW;
  END IF;

  SELECT * INTO pedido_rec FROM public.pedidos WHERE id = NEW.pedido_id;

  IF pedido_rec.phone IS NULL OR TRIM(pedido_rec.phone) = '' THEN
    RETURN NEW;
  END IF;

  itens_formatado := public.format_pedido_itens_from_table(NEW.pedido_id);
  troco_str := '';
  IF pedido_rec.troco IS NOT NULL AND TRIM(COALESCE(pedido_rec.troco::TEXT, '')) <> '' THEN
    troco_str := E'\nTroco: R$ ' || to_char(COALESCE(pedido_rec.troco::numeric, 0), 'FM999990.00');
  END IF;

  mensagem_cliente :=
    '✅ *Pedido Recebido*' || E'\n\n' ||
    'Olá, *' || pedido_rec.cliente || '*' || E'\n\n' ||
    'Seu pedido:' || E'\n' ||
    itens_formatado || E'\n' ||
    'foi confirmado!!' || E'\n\n' ||
    '💰 Total: R$ ' || to_char(COALESCE(pedido_rec.total, 0), 'FM999990.00') || troco_str || E'\n' ||
    'Pagamento: ' || COALESCE(pedido_rec.formapagamento, 'não informado') || E'\n' ||
    'Tipo: ' || COALESCE(pedido_rec.tipoentrega, 'não informado');

  INSERT INTO whatsapp_notifications
    (pedido_id, cliente, phone, mensagem, status_anterior, status_novo, created_at)
  VALUES
    (pedido_rec.id, pedido_rec.cliente, pedido_rec.phone, mensagem_cliente, NULL, pedido_rec.status, NOW());

  RETURN NEW;
END;
$$;

-- 4) Função para notificar mudança de status (Em preparo/Finalizado/etc)
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_status_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  mensagem_cliente TEXT;
BEGIN
  IF NEW.phone IS NULL OR TRIM(NEW.phone) = '' THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
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
      (pedido_id, cliente, phone, mensagem, status_anterior, status_novo, created_at)
    VALUES
      (NEW.id, NEW.cliente, NEW.phone, mensagem_cliente, OLD.status, NEW.status, NOW());
  END IF;

  RETURN NEW;
END;
$$;

-- 5) Cria o trigger na tabela pedido_itens
DROP TRIGGER IF EXISTS trg_whatsapp_notification_itens ON public.pedido_itens;
CREATE TRIGGER trg_whatsapp_notification_itens
AFTER INSERT ON public.pedido_itens
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_after_item();

-- 6) Cria o trigger de update de status na tabela pedidos
DROP TRIGGER IF EXISTS trg_whatsapp_status_update ON public.pedidos;
CREATE TRIGGER trg_whatsapp_status_update
AFTER UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_whatsapp_status_update();
