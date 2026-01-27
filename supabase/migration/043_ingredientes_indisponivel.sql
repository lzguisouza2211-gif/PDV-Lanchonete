ALTER TABLE ingredientes_indisponiveis_dia
ADD COLUMN IF NOT EXISTS indisponivel BOOLEAN DEFAULT TRUE;