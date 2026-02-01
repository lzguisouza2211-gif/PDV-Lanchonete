-- 058_adicionar_colunas_categoria_extras_adicionais_retirados.sql
-- Adiciona as colunas faltantes na tabela pedido_itens para compatibilidade com o payload do frontend/backend

ALTER TABLE public.pedido_itens
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS extras JSONB,
ADD COLUMN IF NOT EXISTS adicionais JSONB,
ADD COLUMN IF NOT EXISTS retirados JSONB;
