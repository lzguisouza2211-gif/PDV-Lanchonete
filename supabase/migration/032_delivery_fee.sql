-- Criar tabela para armazenar configurações de taxa de entrega
CREATE TABLE IF NOT EXISTS delivery_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  taxa_entrega NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir valor padrão
INSERT INTO delivery_config (id, taxa_entrega) 
VALUES (1, 0.00)
ON CONFLICT (id) DO NOTHING;

-- Adicionar coluna taxa_entrega na tabela pedidos se não existir
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS taxa_entrega NUMERIC(10, 2) DEFAULT 0.00;

-- Criar política RLS para permitir leitura pública
ALTER TABLE delivery_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura pública de delivery_config" ON delivery_config;
CREATE POLICY "Permitir leitura pública de delivery_config"
  ON delivery_config
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir atualização de delivery_config para admins" ON delivery_config;
CREATE POLICY "Permitir atualização de delivery_config para admins"
  ON delivery_config
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM admins WHERE user_id = auth.uid()
    )
  );
