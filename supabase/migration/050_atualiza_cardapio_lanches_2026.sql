-- Atualiza nomes e valores dos produtos do cardápio conforme JSON fornecido em 26/01/2026
-- Mantém categorias, converte nome para minúsculo, não altera mais nada

-- Exclui todos os produtos existentes para evitar duplicidade (opcional, remova se não quiser)
-- DELETE FROM cardapio;

-- Atualiza ou insere produtos conforme o JSON fornecido
-- Para cada produto, faz UPSERT (update se existir, insert se não existir)

-- Exclui todos os produtos existentes antes de atualizar o cardápio
DELETE FROM cardapio;

ALTER TABLE cardapio ADD CONSTRAINT cardapio_categoria_nome_unique UNIQUE (categoria, nome);

-- Lanches

INSERT INTO cardapio (categoria, nome, descricao, preco, ativo, disponivel, ingredientes)
VALUES
  -- Lanches
  ('Lanches', 'hambúrguer', 'Pão, tomate, maionese e hambúrguer', 21.00, true, true, '["pao","tomate","maionese","hamburguer"]'),
  ('Lanches', 'calabresa', 'Pão francês, tomate e calabresa', 26.00, true, true, '["pao frances","tomate","calabresa"]'),
  ('Lanches', 'x-calabresa', 'Pão francês, tomate, cebola, calabresa e muçarela', 28.00, true, true, '["pao frances","tomate","cebola","calabresa","mucarela"]'),
  ('Lanches', 'combinado', 'Pão, milho, catupiry e muçarela', 22.50, true, true, '["pao","milho","catupiry","mucarela"]'),
  ('Lanches', 'x-burguer', 'Pão, tomate, maionese, hambúrguer e muçarela', 24.50, true, true, '["pao","tomate","maionese","hamburguer","mucarela"]'),
  ('Lanches', 'x-salada', 'Pão, tomate, maionese, alface, hambúrguer e muçarela', 25.50, true, true, '["pao","tomate","maionese","alface","hamburguer","mucarela"]'),
  ('Lanches', 'misto', 'Pão, três fatias de presunto e três fatias de muçarela', 25.50, true, true, '["pao","presunto","mucarela"]'),
  ('Lanches', 'especial', 'Pão, tomate, maionese, hambúrguer, presunto e muçarela', 29.50, true, true, '["pao","tomate","maionese","hamburguer","presunto","mucarela"]'),
  ('Lanches', 'x-egg', 'Pão, tomate, maionese, hambúrguer, ovo e muçarela', 29.50, true, true, '["pao","tomate","maionese","hamburguer","ovo","mucarela"]'),
  ('Lanches', 'prensado', 'Pão, tomate, maionese, 4 fatias de presunto, 4 fatias de muçarela', 29.50, true, true, '["pao","tomate","maionese","presunto","mucarela"]'),
  ('Lanches', 'quaresma', 'Pão, tomate, maionese, alface, batata-palha, ovo, milho e muçarela', 29.50, true, true, '["pao","tomate","maionese","alface","batata-palha","ovo","milho","mucarela"]'),
  ('Lanches', 'americano', 'Pão, tomate, maionese, alface, ovo, presunto, muçarela', 29.50, true, true, '["pao","tomate","maionese","alface","ovo","presunto","mucarela"]'),
  ('Lanches', 'x-bacon', 'Pão, tomate, maionese, hambúrguer, bacon, muçarela', 32.50, true, true, '["pao","tomate","maionese","hamburguer","bacon","mucarela"]'),
  ('Lanches', 'baita burguer', 'Pão, tomate, maionese, hambúrguer, ovo, presunto e muçarela', 32.50, true, true, '["pao","tomate","maionese","hamburguer","ovo","presunto","mucarela"]'),
  ('Lanches', 'ki-lanche', 'Pão, tomate, maionese, 2 hambúrgueres, ovo, presunto e muçarela', 38.00, true, true, '["pao","tomate","maionese","hamburguer","ovo","presunto","mucarela"]'),
  ('Lanches', 'baita bacon', 'Pão, tomate, maionese, hambúrguer, bacon, ovo, presunto e muçarela', 35.50, true, true, '["pao","tomate","maionese","hamburguer","bacon","ovo","presunto","mucarela"]'),
  ('Lanches', 'galinhão', 'Pão, tomate, maionese, frango desfiado, milho e muçarela', 35.50, true, true, '["pao","tomate","maionese","frango desfiado","milho","mucarela"]'),
  ('Lanches', 'x-frango', 'Pão, tomate, maionese, filé de frango, milho e muçarela', 35.50, true, true, '["pao","tomate","maionese","file de frango","milho","mucarela"]'),
  ('Lanches', 'mineiro', 'Pão, tomate, maionese, hambúrguer, frango desfiado, ovo, bacon, presunto e muçarela', 37.50, true, true, '["pao","tomate","maionese","hamburguer","frango desfiado","ovo","bacon","presunto","mucarela"]'),
  ('Lanches', 'churrasco', 'Pão, tomate, pernil, cebola e muçarela', 37.50, true, true, '["pao","tomate","pernil","cebola","mucarela"]'),
  ('Lanches', 'xr', 'Pão, tomate, alface, maionese, 2 hambúrguer, batata palha, milho, cebola roxa e muçarela', 41.00, true, true, '["pao","tomate","alface","maionese","hamburguer","batata palha","milho","cebola roxa","mucarela"]'),
  ('Lanches', 'nissan', 'Pão, tomate, maionese, batata, frango, milho e catupiry', 37.00, true, true, '["pao","tomate","maionese","batata","frango","milho","catupiry"]'),
  ('Lanches', 'tropical', 'Pão, tomate, pernil, batata, cebola, abacaxi e muçarela', 41.50, true, true, '["pao","tomate","pernil","batata","cebola","abacaxi","mucarela"]'),
  ('Lanches', 'carijó', 'Pão, tomate, maionese, batata, frango, catupiry, presunto e muçarela', 37.00, true, true, '["pao","tomate","maionese","batata","frango","catupiry","presunto","mucarela"]'),
  ('Lanches', 'x-tudo', 'Pão, tomate, maionese, alface, hambúrguer, bacon, ovo, frango, milho, presunto e muçarela', 39.50, true, true, '["pao","tomate","maionese","alface","hamburguer","bacon","ovo","frango","milho","presunto","mucarela"]'),
  ('Lanches', 'carioca', 'Pão, tomate, maionese, hambúrguer, bacon, cheddar, ovo, milho, batata e muçarela', 37.50, true, true, '["pao","tomate","maionese","hamburguer","bacon","cheddar","ovo","milho","batata","mucarela"]'),
  ('Lanches', 'mineirão', 'Pão, tomate, maionese, 2 hambúrgueres, frango, bacon, catupiry, milho, presunto, muçarela e batata', 55.00, true, true, '["pao","tomate","maionese","hamburguer","frango","bacon","catupiry","milho","presunto","mucarela","batata"]'),
  ('Lanches', 'frango no prato', 'Alface, tomate, batata, filé de frango, bacon, milho e muçarela', 41.50, true, true, '["alface","tomate","batata","file de frango","bacon","milho","mucarela"]'),
  ('Lanches', 'pernil no prato', 'Alface, tomate, batata, pernil, cebola, bacon e muçarela', 41.50, true, true, '["alface","tomate","batata","pernil","cebola","bacon","mucarela"]'),
  ('Lanches', 'churrasco de contra-filé', 'Pão francês, tomate, cebola, contra-filé e muçarela', 55.00, true, true, '["pao frances","tomate","cebola","contra-file","mucarela"]'),

  -- Macarrão
  ('Macarrão', 'macarrão calabresa', 'Macarrão, milho, bacon, cebola, molho, muçarela', 22.00, true, true, '["macarrão","milho","bacon","cebola","molho","muçarela"]'),
  ('Macarrão', 'macarrão pernil', 'Macarrão, milho, bacon, cebola, molho, muçarela', 24.00, true, true, '["macarrão","milho","bacon","cebola","molho","muçarela"]'),
  ('Macarrão', 'macarrão frango', 'Macarrão, milho, bacon, cebola, molho, muçarela', 24.00, true, true, '["macarrão","milho","bacon","cebola","molho","muçarela"]'),
  ('Macarrão', 'macarrão bolonhesa', 'Macarrão, hambúrguer, molho, cebola, milho, muçarela', 23.00, true, true, '["macarrão","hambúrguer","molho","cebola","milho","muçarela"]'),

  -- Porções
  ('Porções', 'batata simples', 'Porção de batata', 24.00, true, true, '[]'),
  ('Porções', 'batata c/ queijo e bacon', 'Batata com queijo e bacon', 38.50, true, true, '[]'),
  ('Porções', 'calabresa e cebola', 'Porção de calabresa com cebola', 41.00, true, true, '[]'),
  ('Porções', 'pernil e cebola', 'Porção de pernil com cebola', 55.00, true, true, '[]'),
  ('Porções', 'contra-filé', 'Porção de contra-filé', 90.00, true, true, '[]'),

  -- Omeletes
  ('Omeletes', 'omelete da casa', '4 ovos, presunto, queijo, batata, milho e cebola', 23.00, true, true, '["ovos","presunto","queijo","batata","milho","cebola"]'),
  ('Omeletes', 'omelete catupiry', '4 ovos, catupiry, milho, bacon, presunto, queijo, batata e cebola', 26.00, true, true, '["ovos","catupiry","milho","bacon","presunto","queijo","batata","cebola"]'),
  ('Omeletes', 'omelete cheddar', '4 ovos, cheddar, milho, bacon, presunto, queijo, batata e cebola', 26.00, true, true, '["ovos","cheddar","milho","bacon","presunto","queijo","batata","cebola"]'),
  ('Omeletes', 'omelete frango', '4 ovos, frango, milho, bacon, presunto, queijo, batata e cebola', 27.00, true, true, '["ovos","frango","milho","bacon","presunto","queijo","batata","cebola"]'),

  -- Bebidas
  ('Bebidas', 'coquinha 200ml', 'Refrigerante', 4.00, true, true, '[]'),
  ('Bebidas', 'refrigerante lata', 'Refrigerante lata', 7.00, true, true, '[]'),
  ('Bebidas', 'refrigerante 2 litros', 'Refrigerante 2 litros', 17.00, true, true, '[]'),
  ('Bebidas', 'refrigerante 600ml', 'Refrigerante 600ml', 10.00, true, true, '[]'),
  ('Bebidas', 'guaraná antártica 1 litro', 'Refrigerante 1 litro', 10.00, true, true, '[]'),
  ('Bebidas', 'del valle lata', 'Suco lata', 7.00, true, true, '[]'),
  ('Bebidas', 'h2o', 'Bebida H2O', 7.50, true, true, '[]'),
  ('Bebidas', 'suco laranja copo', 'Suco natural de laranja', 10.00, true, true, '[]'),
  ('Bebidas', 'suco laranja jarra', 'Suco natural de laranja', 20.00, true, true, '[]'),
  ('Bebidas', 'água com gás', 'Água mineral', 4.50, true, true, '[]'),
  ('Bebidas', 'água sem gás', 'Água mineral', 4.00, true, true, '[]'),

  -- Cervejas
  ('Cervejas', 'brahma lata', 'Cerveja', 7.00, true, true, '[]'),
  ('Cervejas', 'skol lata', 'Cerveja', 7.00, true, true, '[]'),
  ('Cervejas', 'skol litrinho', 'Cerveja', 7.00, true, true, '[]'),
  ('Cervejas', 'brahma litrinho', 'Cerveja', 7.00, true, true, '[]'),
  ('Cervejas', 'heineken long', 'Cerveja', 12.00, true, true, '[]'),

  -- Doces
  ('Doces', 'bombons caseiros', 'Unidade', 7.00, true, true, '[]')
ON CONFLICT (categoria, nome) DO UPDATE SET descricao = EXCLUDED.descricao, preco = EXCLUDED.preco, ingredientes = EXCLUDED.ingredientes;

-- Fim da atualização do cardápio 2026
