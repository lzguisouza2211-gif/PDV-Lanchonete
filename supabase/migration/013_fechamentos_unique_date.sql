-- ============================================
-- CONSTRAINT UNIQUE PARA FECHAMENTOS DE CAIXA
-- ============================================
-- Impede dois fechamentos na mesma data

-- Remover constraint se existir
alter table fechamentos_caixa 
drop constraint if exists fechamentos_caixa_data_periodo_unique;

-- Criar constraint unique para data + periodo
alter table fechamentos_caixa 
add constraint fechamentos_caixa_data_periodo_unique 
unique (data, periodo);

