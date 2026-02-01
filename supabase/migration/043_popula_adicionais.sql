-- Migration 043
-- Popula a tabela de adicionais de produtos.
-- Data: 2026-01-28
-- Popula a tabela adicional com os ingredientes dos adicionais SIMPLES e ESPECIAL para todos os produtos customizáveis
-- Execute este script após atualizar a tabela cardapio

DO $$
DECLARE
  prod RECORD;
  adicional_id INT := 1;
  simples_ingredientes TEXT[] := ARRAY['milho','batata','presunto','mucarela','ovo'];
  especial_ingredientes TEXT[] := ARRAY['hamburguer','calabresa','pernil','cheddar','catupiry','frango','bacon'];
  i INT;
  now_ts TIMESTAMP := NOW();
BEGIN
  FOR prod IN SELECT id FROM cardapio WHERE categoria IN ('Lanches','Macarrão','Omeletes') LOOP
    -- Adicionais Simples
    FOR i IN 1..array_length(simples_ingredientes,1) LOOP
      INSERT INTO adicional (product_id, nome, preco, ativo, ordem, created_at, updated_at)
      VALUES (prod.id, simples_ingredientes[i], 4.00, true, i, now_ts, now_ts);
    END LOOP;
    -- Adicionais Especial
    FOR i IN 1..array_length(especial_ingredientes,1) LOOP
      INSERT INTO adicional (product_id, nome, preco, ativo, ordem, created_at, updated_at)
      VALUES (prod.id, especial_ingredientes[i], 8.00, true, 10+i, now_ts, now_ts);
    END LOOP;
  END LOOP;
END $$;

-- Fim do script de adicionais