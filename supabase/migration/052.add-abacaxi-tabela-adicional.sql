-- Migration 052
-- Adiciona o adicional "abacaxi" para todos os produtos customizáveis

DO $$
DECLARE
  prod RECORD;
  now_ts TIMESTAMP := NOW();
BEGIN
  FOR prod IN SELECT id FROM cardapio WHERE categoria IN ('Lanches','Macarrão','Omeletes') LOOP
    INSERT INTO adicional (product_id, nome, preco, ativo, ordem, created_at, updated_at)
    VALUES (prod.id, 'abacaxi', 4.00, true, 99, now_ts, now_ts)
    ON CONFLICT (product_id, nome) DO NOTHING;
  END LOOP;
END $$;

-- Fim do script de adicionais abacaxi