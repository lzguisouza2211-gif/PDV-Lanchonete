UPDATE cardapio
SET ingredientes = CASE nome

-- PORÇÕES FRITAS
WHEN 'Batata simples' THEN '["batata"]'
WHEN 'Batata c/ queijo e bacon' THEN '["batata","queijo","bacon"]'
WHEN 'Calabresa, cebola e mussarela' THEN '["calabresa","cebola","mussarela"]'
WHEN 'Pernil, cebola e mussarela' THEN '["pernil","cebola","mussarela"]'
WHEN 'Contra-filé acebolado' THEN '["contra-filé","cebola"]'

-- LANCHES
WHEN 'Hambúrguer' THEN '["pao de hamburguer","tomate","maionese","hamburguer"]'
WHEN 'Calabresa' THEN '["pao frances","tomate","calabresa"]'
WHEN 'X-Calabresa' THEN '["pao frances","tomate","cebola","calabresa","mussarela"]'
WHEN 'Combinado' THEN '["pao de hamburguer","milho","catupiry","mussarela"]'
WHEN 'X-Burguer' THEN '["pao de hamburguer","tomate","maionese","hamburguer","mussarela"]'
WHEN 'X-Salada' THEN '["pao de hamburguer","tomate","maionese","alface","hamburguer","mussarela"]'
WHEN 'Misto' THEN '["pao de hamburguer","mussarela","presunto"]'
WHEN 'Especial' THEN '["pao de hamburguer","tomate","maionese","hamburguer","presunto","mussarela"]'
WHEN 'X-Egg' THEN '["pao de hamburguer","tomate","maionese","hamburguer","ovo","presunto","mussarela"]'
WHEN 'Prensado' THEN '["pao de hamburguer","tomate","maionese","presunto","mussarela"]'
WHEN 'Quaresma' THEN '["pao de hamburguer","tomate","maionese","alface","batata","ovo","milho","mussarela"]'
WHEN 'Americano' THEN '["pao de hamburguer","tomate","maionese","alface","ovo","presunto","mussarela"]'
WHEN 'Bacon' THEN '["pao de hamburguer","tomate","maionese","hamburguer","bacon","mussarela"]'
WHEN 'Baita Burgue' THEN '["pao de hamburguer","tomate","maionese","hamburguer","ovo","presunto","mussarela"]'
WHEN 'Ki-lanche' THEN '["pao de hamburguer","tomate","maionese","hamburguer 200g","ovo","presunto","mussarela"]'
WHEN 'Baita Bacon' THEN '["pao de hamburguer","tomate","maionese","hamburguer","ovo","bacon","presunto","mussarela"]'
WHEN 'Galinhao' THEN '["pao de hamburguer","tomate","maionese","frango desfiado","milho","mussarela"]'
WHEN 'X-frango' THEN '["pao de hamburguer","tomate","maionese","frango file","milho","mussarela"]'
WHEN 'Mineiro' THEN '["pao de hamburguer","tomate","maionese","frango desfiado","hamburguer","bacon","ovo","presunto","mussarela"]'
WHEN 'Churrasco' THEN '["pao frances","pernil","cebola","mussarela"]'
WHEN 'Amoda' THEN '["pao de hamburguer","tomate","maionese","alface","batata","abacaxi","frango desfiado","catupiry","mussarela"]'
WHEN 'Nissan' THEN '["pao de hamburguer","tomate","maionese","batata palha","frango desfiado","milho","catupiry"]'
WHEN 'Tropical' THEN '["pao de hamburguer","tomate","pernil","batata","cebola","abacaxi","mussarela"]'
WHEN 'Carijo' THEN '["pao de hamburguer","tomate","maionese","batata palha","frango desfiado","catupiry","presunto","mussarela"]'
WHEN 'X-Tudo' THEN '["pao de hamburguer","tomate","maionese","alface","hamburguer","bacon","ovo","milho","frango desfiado","presunto","mussarela"]'
WHEN 'Carioca' THEN '["pao de hamburguer","tomate","maionese","hamburguer","bacon","cheddar","ovo","milho","batata palha","mussarela"]'
WHEN 'Mineirão' THEN '["pao de hamburguer","tomate","maionese","hamburguer 200g","frango desfiado","bacon","catupiry","milho","presunto","mussarela","batata palha"]'

-- PRATOS
WHEN 'Frango no Prato' THEN '["alface","tomate","batata","frango file","bacon","milho","mussarela"]'
WHEN 'Pernil no prato' THEN '["alface","tomate","batata","pernil","cebola","bacon","mussarela"]'
WHEN 'Churrasco de Contra File' THEN '["pao frances","tomate","cebola","contra-filé","mussarela"]'

-- MACARRÃO
WHEN 'Bolonhesa' THEN '["macarrao","hamburguer","milho","molho","bacon","mussarela"]'
WHEN 'Pernil' THEN '["macarrao","milho","bacon","molho","mussarela"]'
WHEN 'Frango' THEN '["macarrao","milho","bacon","molho","mussarela"]'

-- OMELETES
WHEN 'Da Casa' THEN '["ovos","presunto","queijo em cubos","batata","milho","cebola"]'
WHEN 'Catupiry' THEN '["ovos","catupiry","milho","bacon","presunto","queijo em cubos","batata","cebola"]'
WHEN 'Cheddar' THEN '["ovos","cheddar","milho","bacon","presunto","queijo em cubos","batata","cebola"]'

-- OUTROS
WHEN 'Bombom caseiro' THEN '["chocolate"]'

ELSE ingredientes
END::jsonb;