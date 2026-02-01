-- Cria tabela pedido_itens com adicionais e retirados
CREATE TABLE IF NOT EXISTS pedido_itens (
  id serial PRIMARY KEY,
  pedido_id integer REFERENCES pedidos(id) ON DELETE CASCADE,
  nome varchar(255) NOT NULL,
  quantidade integer NOT NULL DEFAULT 1,
  adicionais jsonb DEFAULT '[]',
  retirados jsonb DEFAULT '[]',
  observacoes text,
  preco numeric(10,2),
  created_at timestamp with time zone DEFAULT now()
);

-- Remove as colunas adicionais e retirados da tabela pedidos, se existirem
ALTER TABLE pedidos DROP COLUMN IF EXISTS adicionais;
ALTER TABLE pedidos DROP COLUMN IF EXISTS retirados;
ALTER TABLE pedidos DROP COLUMN itens;
