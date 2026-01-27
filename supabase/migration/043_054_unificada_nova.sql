-- Migration unificada: 043 a 054
-- Data: 26/01/2026
-- ATENÇÃO: Use em banco do zero!

-- Criação da tabela ingredientes_indisponiveis_dia (se não existir)
CREATE TABLE IF NOT EXISTS ingredientes_indisponiveis_dia (
    id SERIAL PRIMARY KEY,
    ingrediente TEXT NOT NULL,
    valid_on DATE DEFAULT CURRENT_DATE,
    indisponivel BOOLEAN DEFAULT TRUE,
    pg BOOLEAN NOT NULL DEFAULT TRUE
);

-- 043: Adiciona coluna indisponivel (já criada acima)
-- 044: Adiciona coluna pg (já criada acima)

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
  ('BOMBOM', true, true);

-- 047: Popular cardapio padronizado
CREATE TABLE IF NOT EXISTS cardapio (
    id SERIAL PRIMARY KEY,
    categoria TEXT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC,
    ativo BOOLEAN DEFAULT TRUE,
    disponivel BOOLEAN DEFAULT TRUE,
    ingredientes TEXT
);
INSERT INTO cardapio (categoria, nome, descricao, preco, ativo)
VALUES
  ('Lanches', 'HAMBURGUER', 'PAO HAMBURGUER, TOMATE, MAIONESE E HAMBURGUER', 21.00, true),
  ('Lanches', 'CALABRESA', 'PAO FRANCES, TOMATE E CALABRESA', 26.00, true),
  ('Lanches', 'X-CALABRESA', 'PAO FRANCES, TOMATE, CEBOLA, CALABRESA E MUSSARELA', 28.00, true),
  ('Lanches', 'COMBINADO', 'PAO, MILHO, CATUPIRY E MUSSARELA', 22.50, true),
  ('Lanches', 'X-BURGUER', 'PAO, TOMATE, MAIONESE, HAMBURGUER E MUSSARELA', 24.50, true),
  ('Lanches', 'X-SALADA', 'PAO, TOMATE, MAIONESE, ALFACE, HAMBURGUER E MUSSARELA', 25.50, true),
  ('Lanches', 'MISTO', 'PAO, TRES FATIAS DE PRESUNTO E TRES FATIAS DE MUSSARELA', 25.50, true),
  ('Lanches', 'ESPECIAL', 'PAO, TOMATE, MAIONESE, HAMBURGUER, PRESUNTO E MUSSARELA', 29.50, true),
  ('Lanches', 'X-EGG', 'PAO, TOMATE, MAIONESE, HAMBURGUER, OVO E MUSSARELA', 29.50, true),
  ('Lanches', 'PRENSADO', 'PAO, TOMATE, MAIONESE, 4 FATIAS DE PRESUNTO, 4 FATIAS DE MUSSARELA', 29.50, true),
  ('Lanches', 'QUARESMA', 'PAO, TOMATE, MAIONESE, ALFACE, BATATA PALHA, OVO, MILHO E MUSSARELA', 29.50, true),
  ('Lanches', 'AMERICANO', 'PAO, TOMATE, MAIONESE, ALFACE, OVO, PRESUNTO, MUSSARELA', 29.50, true),
  ('Lanches', 'X-BACON', 'PAO, TOMATE, MAIONESE, HAMBURGUER, BACON, MUSSARELA', 32.50, true),
  ('Lanches', 'BAITA BURGUER', 'PAO, TOMATE, MAIONESE, HAMBURGUER, OVO, PRESUNTO E MUSSARELA', 32.50, true),
  ('Lanches', 'KI-LANCHE', 'PAO, TOMATE, MAIONESE, 2 HAMBURGUERES, OVO, PRESUNTO E MUSSARELA', 38.00, true),
  ('Lanches', 'BAITA BACON', 'PAO, TOMATE, MAIONESE, HAMBURGUER, BACON, OVO, PRESUNTO E MUSSARELA', 35.50, true),
  ('Lanches', 'GALINHAO', 'PAO, TOMATE, MAIONESE, FRANGO DESFIADO, MILHO E MUSSARELA', 35.50, true),
  ('Lanches', 'X-FRANGO', 'PAO, TOMATE, MAIONESE, FRANGO FILE, MILHO E MUSSARELA', 35.50, true),
  ('Lanches', 'MINEIRO', 'PAO, TOMATE, MAIONESE, HAMBURGUER, FRANGO DESFIADO, OVO, BACON, PRESUNTO E MUSSARELA', 37.50, true),
  ('Lanches', 'CHURRASCO', 'PAO, TOMATE, PERNIL, CEBOLA E MUSSARELA', 37.50, true),
  ('Lanches', 'XR', 'PAO, TOMATE, ALFACE, MAIONESE, 2 HAMBURGUER, BATATA PALHA, MILHO, CEBOLA ROXA E MUSSARELA', 41.00, true),
  ('Lanches', 'NISSAN', 'PAO, TOMATE, MAIONESE, BATATA, FRANGO, MILHO E CATUPIRY', 37.00, true),
  ('Lanches', 'TROPICAL', 'PAO, TOMATE, PERNIL, BATATA, CEBOLA, ABACAXI E MUSSARELA', 41.50, true),
  ('Lanches', 'CARIJO', 'PAO, TOMATE, MAIONESE, BATATA, FRANGO, CATUPIRY, PRESUNTO E MUSSARELA', 37.00, true),
  ('Lanches', 'X-TUDO', 'PAO, TOMATE, MAIONESE, ALFACE, HAMBURGUER, BACON, OVO, FRANGO, MILHO, PRESUNTO E MUSSARELA', 39.50, true),
  ('Lanches', 'CARIOCA', 'PAO, TOMATE, MAIONESE, HAMBURGUER, BACON, CHEDDAR, OVO, MILHO, BATATA E MUSSARELA', 37.50, true),
  ('Lanches', 'MINEIRAO', 'PAO, TOMATE, MAIONESE, 2 HAMBURGUERES, FRANGO, BACON, CATUPIRY, MILHO, PRESUNTO, MUSSARELA E BATATA', 55.00, true),
  ('Pratos', 'FRANGO NO PRATO', 'ALFACE, TOMATE, BATATA, FRANGO FILE, BACON, MILHO E MUSSARELA', 41.50, true),
  ('Pratos', 'PERNIL NO PRATO', 'ALFACE, TOMATE, BATATA, PERNIL, CEBOLA, BACON E MUSSARELA', 41.50, true),
  ('Pratos', 'CHURRASCO DE CONTRA FILE', 'PAO FRANCES, TOMATE, CEBOLA, CONTRA FILE E MUSSARELA', 55.00, true),
  ('Adicionais', 'ADICIONAL SIMPLES', 'MILHO, BATATA, PRESUNTO, MUSSARELA E OVO', 4.00, true),
  ('Adicionais', 'ADICIONAL ESPECIAL', 'HAMBURGUER, CALABRESA, PERNIL, CHEDDAR, CATUPIRY, FRANGO E BACON', 8.00, true),
  ('Macarrão', 'MACARRAO CALABRESA', 'MACARRAO, MILHO, BACON, CEBOLA, MOLHO, MUSSARELA', 22.00, true),
  ('Macarrão', 'MACARRAO PERNIL', 'MACARRAO, MILHO, BACON, CEBOLA, MOLHO, MUSSARELA', 24.00, true),
  ('Macarrão', 'MACARRAO FRANGO', 'MACARRAO, MILHO, BACON, CEBOLA, MOLHO, MUSSARELA', 24.00, true),
  ('Macarrão', 'MACARRAO BOLONHESA', 'MACARRAO, HAMBURGUER, MOLHO, CEBOLA, MILHO, MUSSARELA', 23.00, true),
  ('Porções', 'BATATA SIMPLES', 'PORCAO DE BATATA', 24.00, true),
  ('Porções', 'BATATA C/ QUEIJO E BACON', 'BATATA COM QUEIJO E BACON', 38.50, true),
  ('Porções', 'CALABRESA E CEBOLA', 'PORCAO DE CALABRESA COM CEBOLA', 41.00, true),
  ('Porções', 'PERNIL E CEBOLA', 'PORCAO DE PERNIL COM CEBOLA', 55.00, true),
  ('Porções', 'CONTRA FILE', 'PORCAO DE CONTRA FILE', 90.00, true),
  ('Omeletes', 'OMELETE DA CASA', '4 OVOS, PRESUNTO, QUEIJO, BATATA, MILHO E CEBOLA', 23.00, true),
  ('Omeletes', 'OMELETE CATUPIRY', '4 OVOS, CATUPIRY, MILHO, BACON, PRESUNTO, QUEIJO, BATATA E CEBOLA', 26.00, true),
  ('Omeletes', 'OMELETE CHEDDAR', '4 OVOS, CHEDDAR, MILHO, BACON, PRESUNTO, QUEIJO, BATATA E CEBOLA', 26.00, true),
  ('Omeletes', 'OMELETE FRANGO', '4 OVOS, FRANGO, MILHO, BACON, PRESUNTO, QUEIJO, BATATA E CEBOLA', 27.00, true),
  ('Bebidas', 'COQUINHA 200ML', 'REFRIGERANTE', 4.00, true),
  ('Bebidas', 'COCA LATA SABORES', 'REFRIGERANTE LATA', 7.00, true),
  ('Bebidas', 'DEL VALLE LATA SABORES', 'SUCO LATA', 7.00, true),
  ('Bebidas', 'H2O SABORES', 'BEBIDA H2O', 7.50, true),
  ('Bebidas', 'GUARANA 600ML', 'REFRIGERANTE 600ML', 10.00, true),
  ('Bebidas', 'GUARANA ANTARTICA 1 LITRO', 'REFRIGERANTE 1 LITRO', 10.00, true),
  ('Bebidas', 'COCA 2 LITROS SABORES', 'REFRIGERANTE 2 LITROS', 17.00, true),
  ('Bebidas', 'SUCO LARANJA COPO', 'SUCO NATURAL DE LARANJA', 10.00, true),
  ('Bebidas', 'SUCO LARANJA JARRA', 'SUCO NATURAL DE LARANJA', 20.00, true),
  ('Bebidas', 'SUCO ACEROLA', 'SUCO DE POLPA', 12.00, true),
  ('Bebidas', 'SUCO ABACAXI C/ LIMAO', 'SUCO DE POLPA', 12.00, true);

-- 048: Policies para ingredientes indisponíveis
-- (Adicione policies conforme necessário para seu ambiente Supabase)

-- 049: Remove cardapio_id de ingredientes_indisponiveis_dia (não incluído pois não existe no banco do zero)

-- 050: Atualiza cardápio lanches 2026 (já incluído acima)

-- 051: Popula adicionais
CREATE TABLE IF NOT EXISTS adicional (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES cardapio(id),
    nome TEXT NOT NULL,
    preco NUMERIC,
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DO $$
DECLARE
  prod RECORD;
  simples_ingredientes TEXT[] := ARRAY['milho','batata','presunto','mussarela','ovo'];
  especial_ingredientes TEXT[] := ARRAY['hamburguer','calabresa','pernil','cheddar','catupiry','frango','bacon'];
  i INT;
  now_ts TIMESTAMP := NOW();
BEGIN
  FOR prod IN SELECT id FROM cardapio WHERE categoria IN ('Lanches','Macarrão','Omeletes') LOOP
    -- Adicionais Simples
    FOR i IN 1..array_length(simples_ingredientes,1) LOOP
      INSERT INTO adicional (product_id, nome, preco, ativo, ordem, created_at, updated_at)
      VALUES (prod.id, simples_ingredientes[i], 4.00, true, i, now_ts, now_ts)
      ON CONFLICT DO NOTHING;
    END LOOP;
    -- Adicionais Especial
    FOR i IN 1..array_length(especial_ingredientes,1) LOOP
      INSERT INTO adicional (product_id, nome, preco, ativo, ordem, created_at, updated_at)
      VALUES (prod.id, especial_ingredientes[i], 8.00, true, 10+i, now_ts, now_ts)
      ON CONFLICT DO NOTHING;
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
-- (Adicione policies conforme necessário para seu ambiente Supabase)

-- Fim da migration unificada
