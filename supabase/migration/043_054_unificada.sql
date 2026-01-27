-- Migration unificada: 043 a 054
-- Data: 26/01/2026
-- ATENÇÃO: Faça backup do banco antes de aplicar!
-- Esta migration substitui as migrations 043_ingredientes_indisponivel.sql até 054_policies_produtos_disponibilidade_whatsapp.sql

-- 043: Adiciona coluna indisponivel
ALTER TABLE ingredientes_indisponiveis_dia
ADD COLUMN IF NOT EXISTS indisponivel BOOLEAN DEFAULT TRUE;

-- 044: Adiciona coluna pg e atualiza valores
ALTER TABLE ingredientes_indisponiveis_dia
ADD COLUMN IF NOT EXISTS pg boolean NOT NULL DEFAULT true;
UPDATE ingredientes_indisponiveis_dia
SET pg = CASE
  WHEN lower(ingrediente) IN ('maionese', 'tomate', 'pão de hamburguer', 'pão de hambúrguer') THEN false
  ELSE true
END;

-- 046: Popula ingredientes padronizados
INSERT INTO ingredientes_indisponiveis_dia (ingrediente, indisponivel, pg)
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
ON CONFLICT (ingrediente) DO NOTHING;

-- 047: Popular cardapio padronizado
-- (Adapte conforme estrutura real do seu banco)
-- Exemplo:
-- INSERT INTO cardapio (nome, descricao, preco, ativo) VALUES ...

-- 048: Policies para ingredientes indisponíveis
CREATE POLICY admin_select_ingredientes_indisponiveis
ON public.ingredientes_indisponiveis_dia
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);
CREATE POLICY admin_insert_ingredientes_indisponiveis
ON public.ingredientes_indisponiveis_dia
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);
CREATE POLICY admin_update_ingredientes_indisponiveis
ON public.ingredientes_indisponiveis_dia
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM admins WHERE ativo = true
  )
);

-- 049: Remove cardapio_id de ingredientes_indisponiveis_dia
ALTER TABLE ingredientes_indisponiveis_dia DROP CONSTRAINT IF EXISTS ingredientes_indisponiveis_dia_cardapio_id_fkey;
ALTER TABLE ingredientes_indisponiveis_dia DROP COLUMN IF EXISTS cardapio_id;
DROP INDEX IF EXISTS ingredientes_indisponiveis_dia_unique;
CREATE UNIQUE INDEX IF NOT EXISTS ingredientes_indisponiveis_dia_unique_global ON ingredientes_indisponiveis_dia(ingrediente, valid_on);
COMMENT ON TABLE ingredientes_indisponiveis_dia IS 'Ingredientes marcados como indisponíveis por dia (global)';

-- 050: Atualiza cardápio lanches 2026
-- (Inclua aqui o bloco de INSERT/UPSERT do cardápio, conforme sua estrutura)

-- 051: Popula adicionais
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

-- 052: Atualiza tipo de pão nos lanches
-- (Inclua aqui o bloco de UPDATE do tipo de pão, conforme sua estrutura)

-- 053: Cria produtos_disponibilidade
CREATE TABLE IF NOT EXISTS public.produtos_disponibilidade (
    id SERIAL PRIMARY KEY,
    categoria TEXT NOT NULL,
    tipo TEXT NOT NULL,
    sabor TEXT NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_produtos_disponibilidade_cat_tipo_sabor
    ON public.produtos_disponibilidade (categoria, tipo, sabor);
CREATE OR REPLACE FUNCTION atualiza_atualizado_em_produtos_disponibilidade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_atualiza_atualizado_em_produtos_disponibilidade ON public.produtos_disponibilidade;
CREATE TRIGGER trigger_atualiza_atualizado_em_produtos_disponibilidade
    BEFORE UPDATE ON public.produtos_disponibilidade
    FOR EACH ROW EXECUTE FUNCTION atualiza_atualizado_em_produtos_disponibilidade();

-- 054: Policies para whatsapp_notifications e produtos_disponibilidade
CREATE POLICY "Allow read whatsapp_notifications" ON public.whatsapp_notifications
  FOR SELECT USING (true);
CREATE POLICY "Allow insert whatsapp_notifications" ON public.whatsapp_notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update whatsapp_notifications admin" ON public.whatsapp_notifications
  FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "Allow delete whatsapp_notifications admin" ON public.whatsapp_notifications
  FOR DELETE USING (auth.role() = 'admin');
CREATE POLICY "Allow read produtos_disponibilidade" ON public.produtos_disponibilidade
  FOR SELECT USING (true);
CREATE POLICY "Allow insert produtos_disponibilidade" ON public.produtos_disponibilidade
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update produtos_disponibilidade" ON public.produtos_disponibilidade
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete produtos_disponibilidade admin" ON public.produtos_disponibilidade
  FOR DELETE USING (auth.role() = 'admin');

-- Fim da migration unificada
