-- Migration 039
-- Popula a tabela de ingredientes indisponíveis com nomes padronizados.
-- Data: 2026-01-28
-- Popula a tabela ingredientes_indisponiveis_dia com todos os ingredientes padronizados (MAIÚSCULAS, sem acentos)
-- Ajuste a coluna pg conforme sua regra de "paga na troca"

-- Crie um índice único para a coluna ingrediente
CREATE UNIQUE INDEX IF NOT EXISTS ingredientes_indisponiveis_dia_ingrediente_idx
  ON ingredientes_indisponiveis_dia (ingrediente);

  
INSERT INTO ingredientes_indisponiveis_dia (cardapio_id, ingrediente, indisponivel, pg)
SELECT c.id, v.ingrediente, v.indisponivel, v.pg
FROM (
  VALUES
    ('PAO DE HAMBURGUER', true, true),
    ('PAO FRANCES', true, true),
    ('TOMATE', true, true),
    ('MAIONESE', true, true),
    ('HAMBURGUER', true, true),
    ('MILHO', true, true),
    ('BACON', true, true),
    ('CALABRESA', true, true),
    ('MUSSARELA', true, true),
    ('PERNIL', true, true),
    ('PRESUNTO', true, true),
    ('FRANGO FILE', true, true),
    ('FRANGO DESFIADO', true, true),
    ('OVO', true, true),
    ('CEBOLA', true, true),
    ('BATATA PALHA', true, true),
    ('ALFACE', true, true),
    ('CATUPIRY', true, true),
    ('CHEDDAR', true, true),
    ('ABACAXI', true, true),
    ('CONTRA FILE', true, true),
    ('BATATA FRITA', true, true),
    ('COQUINHA 200ML', true, true),
    ('COCA LATA', true, true),
    ('DEL VALLE LATA', true, true),
    ('H2O', true, true),
    ('COCA 600ML', true, true),
    ('GUARANA ANTARTICA 1LITRO', true, true),
    ('COCA 2L', true, true),
    ('SUCO LARANJA COPO', true, true),
    ('SUCO LARANJA JARRA', true, true),
    ('BRAHMA LATA', true, true),
    ('SKOL LATA', true, true),
    ('SKOL LITRINHO', true, true),
    ('BRAHMA LITRINHO', true, true),
    ('HEINEKEN', true, true),
    ('AGUA', true, true),
    ('AGUA COM GAS', true, true),
    ('AGUA SEM GAS', true, true),
    ('BOMBOM', true, true)
) AS v(ingrediente, indisponivel, pg)
CROSS JOIN LATERAL (
  SELECT id FROM cardapio ORDER BY id LIMIT 1
) c
ON CONFLICT (ingrediente) DO NOTHING;