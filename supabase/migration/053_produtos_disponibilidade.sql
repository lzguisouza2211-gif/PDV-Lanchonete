-- Tabela para gerenciar disponibilidade de produtos por categoria, sabor e tipo
CREATE TABLE IF NOT EXISTS public.produtos_disponibilidade (
    id SERIAL PRIMARY KEY,
    categoria TEXT NOT NULL, -- Ex: 'refrigerante'
    tipo TEXT NOT NULL,      -- Ex: 'lata', '600ml', '2L'
    sabor TEXT NOT NULL,     -- Ex: 'Coca-Cola', 'Fanta Laranja'
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por categoria/tipo/sabor
CREATE INDEX IF NOT EXISTS idx_produtos_disponibilidade_cat_tipo_sabor
    ON public.produtos_disponibilidade (categoria, tipo, sabor);

-- Trigger para atualizar o campo atualizado_em
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
