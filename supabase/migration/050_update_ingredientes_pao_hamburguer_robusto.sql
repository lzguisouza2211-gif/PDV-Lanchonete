-- Migration 050
-- Atualiza ingredientes de pão de hambúrguer robusto.
-- Data: 2026-01-28
-- Atualiza qualquer ocorrência de "pao" ou "pão" para "pao hamburguer" no array ingredientes
-- Funciona para arrays com múltiplos ingredientes

UPDATE cardapio
SET ingredientes = (
  SELECT jsonb_agg(
    CASE
      WHEN trim(lower(ing)) IN ('pao', 'pão') THEN 'pao hamburguer'
      ELSE ing
    END
  )
  FROM jsonb_array_elements_text(ingredientes) AS t(ing)
)
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements_text(ingredientes) AS t(ing)
  WHERE trim(lower(ing)) IN ('pao', 'pão')
);
