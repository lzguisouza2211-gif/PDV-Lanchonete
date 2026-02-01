-- 057_permitir_inserts_pedido_itens.sql
-- Habilita RLS e cria policy para permitir inserts na tabela pedido_itens

ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserts por qualquer um" ON pedido_itens
FOR INSERT
WITH CHECK (true);


ALTER TABLE pedido_itens ADD COLUMN categoria text;