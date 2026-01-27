-- Migration 044: Adiciona coluna 'pg' (boolean) na tabela ingredientes_indisponiveis_dia
-- true = permite troca grátis, false = não permite

ALTER TABLE ingredientes_indisponiveis_dia
ADD COLUMN pg boolean NOT NULL DEFAULT true;

-- Atualiza os registros já existentes para garantir consistência
UPDATE ingredientes_indisponiveis_dia
SET pg = CASE
  WHEN lower(ingrediente) IN ('maionese', 'tomate', 'pão de hamburguer', 'pão de hambúrguer') THEN false
  ELSE true
END;

-- Comentário: ao inserir um novo ingrediente indisponível, defina pg conforme a regra de negócio.
-- Exemplo de insert para maionese:
-- INSERT INTO ingredientes_indisponiveis_dia (ingrediente, valid_on, pg) VALUES ('maionese', '2026-01-26', false);
