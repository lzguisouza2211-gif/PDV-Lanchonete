-- ============================================
-- POPULAR COLUNA INGREDIENTES DO CARDÁPIO
-- ============================================
-- Extrai ingredientes da descrição e popula a coluna ingredientes

-- Função auxiliar para extrair ingredientes da descrição
-- Remove palavras comuns e separa por vírgula
update cardapio
set ingredientes = (
  select jsonb_agg(trim(ingrediente))
  from (
    select unnest(string_to_array(
      regexp_replace(
        lower(coalesce(descricao, '')),
        '\s*(e|com|sem|c/|s/)\s*',
        ',',
        'g'
      ),
      ','
    )) as ingrediente
  ) sub
  where trim(ingrediente) != ''
    and trim(ingrediente) not in ('pao', 'pão', 'de', 'no', 'na', 'com', 'sem', 'e', 'quatro', 'ovos', 'tres', 'três', 'fatias', 'frances', 'francês', 'hamburguer', 'hambúrguer', 'filé', 'file', 'desfiado', 'acebolado', 'palha', 'simples', 'c/')
)
where descricao is not null 
  and descricao != ''
  and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Atualização manual para produtos específicos com ingredientes conhecidos
-- Pernil no prato
update cardapio
set ingredientes = '["alface", "tomate", "batata", "pernil", "cebola", "bacon", "mussarela"]'::jsonb
where nome = 'Pernil no prato' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Frango no Prato
update cardapio
set ingredientes = '["alface", "tomate", "batata", "frango filé", "bacon", "milho", "mussarela"]'::jsonb
where nome = 'Frango no Prato' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- X-Salada
update cardapio
set ingredientes = '["pão de hamburguer", "tomate", "maionese", "alface", "hamburguer", "mussarela"]'::jsonb
where nome = 'X-Salada' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- X-Burguer
update cardapio
set ingredientes = '["pão de hamburguer", "tomate", "maionese", "hamburguer", "mussarela"]'::jsonb
where nome = 'X-Burguer' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- X-Calabresa
update cardapio
set ingredientes = '["pão frances", "tomate", "cebola", "calabresa", "mussarela"]'::jsonb
where nome = 'X-Calabresa' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Calabresa
update cardapio
set ingredientes = '["pão frances", "tomate", "calabresa"]'::jsonb
where nome = 'Calabresa' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Hambúrguer
update cardapio
set ingredientes = '["pão de hamburguer", "tomate", "maionese", "hamburguer"]'::jsonb
where nome = 'Hambúrguer' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- X-Egg
update cardapio
set ingredientes = '["pão de hamburguer", "tomate", "maionese", "hamburguer", "ovo", "presunto", "mussarela"]'::jsonb
where nome = 'X-Egg' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Bacon
update cardapio
set ingredientes = '["pão de hamburguer", "tomate", "maionese", "hamburguer", "bacon", "mussarela"]'::jsonb
where nome = 'Bacon' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Especial
update cardapio
set ingredientes = '["pão de hamburguer", "tomate", "maionese", "hamburguer", "presunto", "mussarela"]'::jsonb
where nome = 'Especial' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Misto
update cardapio
set ingredientes = '["pão de hamburguer", "mussarela", "presunto"]'::jsonb
where nome = 'Misto' and (ingredientes is null or ingredientes = '[]'::jsonb);

-- Combinado
update cardapio
set ingredientes = '["pão de hamburguer", "milho", "catupiry", "mussarela"]'::jsonb
where nome = 'Combinado' and (ingredientes is null or ingredientes = '[]'::jsonb);

