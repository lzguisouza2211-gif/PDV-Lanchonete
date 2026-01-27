-- Corrige a constraint UNIQUE para funcionar com upsert no Supabase
ALTER TABLE ingredientes_indisponiveis_dia
DROP CONSTRAINT IF EXISTS ingredientes_indisponiveis_unique;

ALTER TABLE ingredientes_indisponiveis_dia
ADD CONSTRAINT ingredientes_indisponiveis_unique UNIQUE (ingrediente, valid_on);
