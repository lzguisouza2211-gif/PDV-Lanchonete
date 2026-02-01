-- 056: Restaura coluna itens em pedidos e cria trigger para popular pedido_itens
-- Data: 2026-01-29
-- ============================================

-- Adiciona a coluna itens (jsonb) de volta na tabela pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS itens jsonb;

-- Cria função para inserir itens na tabela pedido_itens ao inserir pedido
CREATE OR REPLACE FUNCTION public.inserir_pedido_itens_apos_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.itens IS NOT NULL THEN
    INSERT INTO pedido_itens (pedido_id, nome, quantidade, adicionais, retirados, observacoes, preco)
    SELECT NEW.id,
           item->>'nome',
           COALESCE((item->>'quantidade')::int, 1),
           item->'adicionais',
           item->'retirados',
           item->>'observacoes',
           COALESCE((item->>'preco')::numeric, 0)
    FROM jsonb_array_elements(NEW.itens) AS item;
  END IF;
  RETURN NEW;
END;
$$;

-- Cria trigger para rodar após INSERT em pedidos
DROP TRIGGER IF EXISTS trg_inserir_pedido_itens ON public.pedidos;
CREATE TRIGGER trg_inserir_pedido_itens
AFTER INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.inserir_pedido_itens_apos_pedido();

-- ============================================
-- FIM DA MIGRATION 056
-- ============================================
