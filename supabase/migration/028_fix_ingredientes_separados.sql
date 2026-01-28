-- Migration 028
-- Corrige separação de ingredientes em registros antigos.
-- Data: 2026-01-28
-- Corrige separadores de ingredientes na descrição
-- Substitui " e " por ", " para padronizar o separador

UPDATE cardapio
SET descricao = REPLACE(descricao, ' e ', ', ')
WHERE descricao ILIKE '% e %';

-- Verifica o resultado
SELECT 
  id,
  nome,
  descricao
FROM cardapio
WHERE descricao IS NOT NULL
ORDER BY categoria, nome;


-- Remover tabelas não utilizadas

-- Remover tabela de ingredientes indisponíveis (nunca foi implementada)
DROP TABLE IF EXISTS public.ingredientes_indispoviveis_dia CASCADE;

-- Remover tabela de addons (não é usada no fluxo de pedidos)
DROP TABLE IF EXISTS public.product_addons CASCADE;

-- Remover função de trigger relacionada se existir
DROP FUNCTION IF EXISTS public.update_product_addons_updated_at() CASCADE;