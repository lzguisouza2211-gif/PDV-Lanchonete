-- Migration 065 warning
-- Corrige search_path mutable em funções para segurança
-- Data: 2026-02-05

-- set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- inserir_pedido_itens_apos_pedido
CREATE OR REPLACE FUNCTION public.inserir_pedido_itens_apos_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insere os itens do pedido na tabela pedido_itens
  IF NEW.itens IS NOT NULL AND NEW.itens != '[]'::jsonb THEN
    INSERT INTO pedido_itens (pedido_id, produto_nome, quantidade, preco_unitario, observacoes, adicionais, retirados, categoria, extras)
    SELECT
      NEW.id,
      (item->>'produto')::text,
      (item->>'quantidade')::integer,
      (item->>'preco')::numeric,
      (item->>'observacoes')::text,
      COALESCE((item->'adicionais')::jsonb, '[]'::jsonb),
      COALESCE((item->'retirados')::jsonb, '[]'::jsonb),
      (item->>'categoria')::text,
      COALESCE((item->'extras')::jsonb, '[]'::jsonb)
    FROM jsonb_array_elements(NEW.itens) AS item;
  END IF;

  RETURN NEW;
END;
$$;

-- calcular_total_item
CREATE OR REPLACE FUNCTION public.calcular_total_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_adicionais numeric := 0;
  total_extras numeric := 0;
BEGIN
  -- Calcula total de adicionais
  IF NEW.adicionais IS NOT NULL THEN
    SELECT COALESCE(SUM((adicional->>'preco')::numeric), 0)
    INTO total_adicionais
    FROM jsonb_array_elements(NEW.adicionais) AS adicional;
  END IF;

  -- Calcula total de extras
  IF NEW.extras IS NOT NULL THEN
    SELECT COALESCE(SUM((extra->>'preco')::numeric), 0)
    INTO total_extras
    FROM jsonb_array_elements(NEW.extras) AS extra;
  END IF;

  -- Total = (preço unitário + adicionais + extras) * quantidade
  NEW.total = (NEW.preco_unitario + total_adicionais + total_extras) * NEW.quantidade;

  RETURN NEW;
END;
$$;

-- update_adicional_updated_at
CREATE OR REPLACE FUNCTION public.update_adicional_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- update_retirar_ingred_updated_at
CREATE OR REPLACE FUNCTION public.update_retirar_ingred_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- enqueue_new_order_notification
CREATE OR REPLACE FUNCTION public.enqueue_new_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO whatsapp_notifications (
    pedido_id,
    cliente,
    phone,
    status_anterior,
    status_novo,
    message
  ) VALUES (
    NEW.id,
    NEW.cliente,
    NEW.telefone,
    NULL,
    NEW.status,
    format('✅ *Pedido Recebido*\n\nOlá, *%s*\n\nSeu pedido foi confirmado!', NEW.cliente)
  );

  RETURN NEW;
END;
$$;

-- format_pedido_itens
CREATE OR REPLACE FUNCTION public.format_pedido_itens(itens_json jsonb)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  resultado TEXT := '';
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(itens_json)
  LOOP
    resultado := resultado || format(
      '• %sx %s\n',
      item->>'quantidade',
      item->>'produto'
    );
  END LOOP;

  RETURN resultado;
END;
$$;

-- atualiza_atualizado_em_produtos_disponibilidade
CREATE OR REPLACE FUNCTION public.atualiza_atualizado_em_produtos_disponibilidade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$;

-- format_pedido_itens_from_table
CREATE OR REPLACE FUNCTION public.format_pedido_itens_from_table(p_pedido_id bigint)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  resultado TEXT := '';
BEGIN
  SELECT string_agg(
    format('• %sx %s', quantidade, produto_nome),
    E'\n'
  )
  INTO resultado
  FROM pedido_itens
  WHERE pedido_id = p_pedido_id;

  RETURN COALESCE(resultado, '');
END;
$$;

-- enqueue_whatsapp_notification (principal)
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  itens_formatados TEXT;
  mensagem TEXT;
BEGIN
  -- Formata os itens do pedido
  itens_formatados := public.format_pedido_itens_from_table(NEW.id);

  -- Monta a mensagem
  mensagem := format(
    E'✅ *Pedido Recebido*\n\nOlá, *%s*\n\nSeu pedido:\n\n%s\n\nfoi confirmado!!\n\n💰 Total: R$ %.2f\nPagamento: %s\nTipo: %s',
    NEW.cliente,
    itens_formatados,
    NEW.total,
    NEW.formapagamento,
    NEW.tipoentrega
  );

  -- Insere notificação
  INSERT INTO whatsapp_notifications (
    pedido_id,
    cliente,
    phone,
    status_anterior,
    status_novo,
    message
  ) VALUES (
    NEW.id,
    NEW.cliente,
    NEW.telefone,
    OLD.status,
    NEW.status,
    mensagem
  );

  RETURN NEW;
END;
$$;

-- Comentário
COMMENT ON MIGRATION '065_fix_function_search_path' IS 'Corrige search_path mutable em todas as funções para segurança';
