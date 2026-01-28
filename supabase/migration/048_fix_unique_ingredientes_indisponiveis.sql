-- Migration 048
-- Corrige unique constraint em ingredientes indisponíveis.
-- Data: 2026-01-28
-- Corrige a constraint UNIQUE para funcionar com upsert no Supabase
ALTER TABLE ingredientes_indisponiveis_dia
DROP CONSTRAINT IF EXISTS ingredientes_indisponiveis_unique;

ALTER TABLE ingredientes_indisponiveis_dia
ADD CONSTRAINT ingredientes_indisponiveis_unique UNIQUE (ingrediente, valid_on);
