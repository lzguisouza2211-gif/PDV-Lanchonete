-- Migration 041
-- Remove coluna cardapio_id da tabela ingredientes_indisponiveis_dia.
-- Data: 2026-01-28
-- Migration 049: Remove coluna cardapio_id da tabela ingredientes_indisponiveis_dia para disponibilidade global

ALTER TABLE ingredientes_indisponiveis_dia DROP CONSTRAINT ingredientes_indisponiveis_dia_cardapio_id_fkey;
ALTER TABLE ingredientes_indisponiveis_dia DROP COLUMN cardapio_id;
DROP INDEX IF EXISTS ingredientes_indisponiveis_dia_unique;
CREATE UNIQUE INDEX ingredientes_indisponiveis_dia_unique_global ON ingredientes_indisponiveis_dia(ingrediente, valid_on);

-- Atualiza comentário da tabela
COMMENT ON TABLE ingredientes_indisponiveis_dia IS 'Ingredientes marcados como indisponíveis por dia (global)';
