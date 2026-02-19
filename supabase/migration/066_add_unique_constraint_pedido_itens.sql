-- 066_add_unique_constraint_pedido_itens.sql
-- Adiciona constraint para evitar duplicidade de itens no mesmo pedido

ALTER TABLE public.pedido_itens
ADD CONSTRAINT pedido_itens_unico UNIQUE (
  pedido_id, nome, categoria, adicionais, retirados, observacoes
);
