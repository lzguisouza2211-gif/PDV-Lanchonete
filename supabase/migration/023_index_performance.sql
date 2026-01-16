-- Migration 020: Índices para performance do cardápio
CREATE INDEX IF NOT EXISTS idx_cardapio_ativo ON cardapio(ativo);
CREATE INDEX IF NOT EXISTS idx_cardapio_disponivel ON cardapio(disponivel);
CREATE INDEX IF NOT EXISTS idx_cardapio_ativo_disponivel ON cardapio(ativo, disponivel);
CREATE INDEX IF NOT EXISTS idx_cardapio_categoria ON cardapio(categoria);