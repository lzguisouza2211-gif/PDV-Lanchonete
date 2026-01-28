-- Migration 036
-- Criação da tabela de ingredientes indisponíveis.
-- Data: 2026-01-28
ALTER TABLE ingredientes_indisponiveis_dia
ADD COLUMN IF NOT EXISTS indisponivel BOOLEAN DEFAULT TRUE;