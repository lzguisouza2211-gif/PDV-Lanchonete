-- Migration 017
-- Adiciona controle de disponibilidade de produtos.
-- Data: 2026-01-28
-- Migration 017: Adicionar coluna 'disponivel' na tabela cardapio
-- Para permitir gestão rápida de disponibilidade de produtos

ALTER TABLE cardapio 
ADD COLUMN IF NOT EXISTS disponivel BOOLEAN DEFAULT true;

-- Atualizar todos os produtos existentes como disponíveis
UPDATE cardapio 
SET disponivel = true 
WHERE disponivel IS NULL;

-- Comentário na coluna
COMMENT ON COLUMN cardapio.disponivel IS 'Indica se o produto está disponível para venda no momento';
