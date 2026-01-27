-- Atualiza a coluna ingredientes na tabela cardapio
-- Onde ingredientes = '["pao"]', troca para '["pao hamburguer"]'

UPDATE cardapio
SET ingredientes = '["pao hamburguer"]'::jsonb
WHERE ingredientes = '["pao"]'::jsonb;
