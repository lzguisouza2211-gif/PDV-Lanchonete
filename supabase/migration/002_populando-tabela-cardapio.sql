-- Migration: popular tabela cardapio
-- Rodar no Supabase SQL Editor

insert into cardapio (categoria, nome, preco, descricao) values
-- Lanches
('Lanches', 'Hambúrguer', 21.00, 'pao de hamburguer, tomate, maionese e hamburguer'),
('Lanches', 'Calabresa', 25.00, 'pao frances, tomate e calabresa'),
('Lanches', 'X-Calabresa', 27.50, 'pao frances, tomate, cebola, calabresa e mussarela'),
('Lanches', 'Combinado', 22.50, 'pao de hamburguer, milho, catupiry e mussarela'),
('Lanches', 'X-Burguer', 24.50, 'pao de hamburguer, tomate, maionese, hamburguer e mussarela'),
('Lanches', 'X-Salada', 25.50, 'pao de hamburguer, tomate, maionese, alface, hamburguer e mussarela'),
('Lanches', 'Misto', 25.50, 'pao de hamburguer, tres fatias de mussarela e tres fatias de presunto'),
('Lanches', 'Especial', 28.50, 'pao de hamburguer, tomate, maionese, hamburguer, presunto e mussarela'),
('Lanches', 'X-Egg', 28.50, 'pao de hamburguer, tomate, maionese, hamburguer, ovo, presunto e mussarela'),
('Lanches', 'Prensado', 28.50, 'pao de hamburguer, tomate, maionese, quatro fatias de presunto e quatro fatias de mussarela'),
('Lanches', 'Quaresma', 28.50, 'pao de hamburguer, tomate, maionese, alface, batata, ovo, milho e mussarela'),
('Lanches', 'Americano', 28.50, 'pao de hamburguer, tomate, maionese, alface, ovo, presunto e mussarela'),
('Lanches', 'Bacon', 31.50, 'pao de hamburguer, tomate, maionese, hamburguer, bacon e mussarela'),
('Lanches', 'Baita Burgue', 31.50, 'pao de hamburguer, tomate, maionese, hamburguer, ovo, presunto e mussarela'),
('Lanches', 'Ki-lanche', 37.00, 'pao de hamburguer, tomate, maionese, hamburguer 200g, ovo, presunto e mussarela'),
('Lanches', 'Baita Bacon', 34.00, 'pao de hamburguer, tomate, maionese, hamburguer, ovo, bacon, presunto e mussarela'),
('Lanches', 'Galinhao', 34.00, 'pao de hamburguer, tomate, maionese, frango desfiado, milho e mussarela'),
('Lanches', 'X-frango', 34.00, 'pao de hamburguer, tomate, maionese, frango filé, milho e mussarela'),
('Lanches', 'Mineiro', 36.00, 'pao de hamburguer, tomate, maionese, frango desfiado, hamburguer, bacon, ovo, presunto e mussarela'),
('Lanches', 'Churrasco', 36.00, 'pao frances, pernil, cebola e mussarela'),
('Lanches', 'Amoda', 36.00, 'pao de hamburguer, tomate, maionese, alface, batata, abacaxi, frango desfiado, catupiry e mussarela'),
('Lanches', 'Nissan', 36.00, 'pao de hamburguer, tomate, maionese, batata palha, frango desfiado, milho e catupiry'),
('Lanches', 'Tropical', 39.00, 'pao de hamburguer, tomate, pernil, batata, cebola, abacaxi e mussarela'),
('Lanches', 'Carijo', 36.00, 'pao de hamburguer, tomate, maionese, batata palha, frango desfiado, catupiry, presunto e mussarela'),
('Lanches', 'X-Tudo', 38.00, 'pao de hamburguer, tomate, maionese, alface, hamburguer, bacon, ovo, milho, frango desfiado, presunto e mussarela'),
('Lanches', 'Carioca', 36.00, 'pao de hamburguer, tomate, maionese, hamburguer, bacon, cheddar, ovo, milho, batata palha e mussarela'),
('Lanches', 'Mineirão', 52.00, 'pao de hamburguer, tomate, maionese, hamburguer 200g, frango desfiado, bacon, catupiry, milho, presunto, mussarela e batata palha'),
('Lanches', 'Frango no Prato', 38.50, 'alface, tomate, batata, frango filé, bacon, milho e mussarela'),
('Lanches', 'Pernil no prato', 38.50, 'alface, tomate, batata, pernil, cebola, bacon e mussarela'),
('Lanches', 'Churrasco de Contra File', 52.00, 'pao frances, tomate, cebola, contra-filé e mussarela'),

-- Macarrão na Chapa
('Macarrão', 'Calabresa', 21.00, 'macarrao, milho, bacon, molho e mussarela'),
('Macarrão', 'Pernil', 23.00, 'macarrao, milho, bacon, molho e mussarela'),
('Macarrão', 'Frango', 23.00, 'macarrao, milho, bacon, molho e mussarela'),
('Macarrão', 'Bolonhesa', 22.00, 'macarrao, hamburguer, milho, molho, bacon e mussarela'),

-- Porções
('Porções', 'Batata simples', 24.00, 'Maracuja'),
('Porções', 'Batata c/ queijo e bacon', 36.50, NULL),
('Porções', 'Calabresa, cebola e mussarela', 39.50, NULL),
('Porções', 'Pernil, cebola e mussarela', 52.00, NULL),
('Porções', 'Contra-filé acebolado', 87.00, NULL),

-- Omeletes
('Omeletes', 'Da Casa', 22.00, 'quatro ovos, presunto, queijo em cubos, batata, milho, cebola'),
('Omeletes', 'Catupiry', 25.00, 'quatro ovos, catupiry, milho, bacon, presunto, queijo em cubos, batata e cebola'),
('Omeletes', 'Cheddar', 25.00, 'quatro ovos, cheddar, milho, bacon, presunto, queijo em cubos, batata e cebola'),
('Omeletes', 'Frango', 26.00, 'quatro ovos, frango filé, milho, bacon, presunto, queijo em cubos, batata e cebola'),

-- Bebidas
('Bebidas', 'Coquinha 200ml', 4.00, NULL),
('Bebidas', 'Laranja copo', 10.00, NULL),
('Bebidas', 'Coca lata sabores', 7.00, NULL),
('Bebidas', 'Laranja jarro', 20.00, NULL),
('Bebidas', 'Del Vale lata sabores', 7.00, NULL),
('Bebidas', 'H2O sabores', 7.50, NULL),
('Bebidas', 'Maracuja', 11.00, NULL),
('Bebidas', 'Coca 600ml', 10.00, NULL),
('Bebidas', 'Acerola', 11.00, NULL),
('Bebidas', 'Guaraná antártico 1L', 10.00, NULL),
('Bebidas', 'Abacaxi c/ limão', 10.00, NULL),
('Bebidas', 'Coca 2L sabores', 17.00, NULL),
('Bebidas', 'Abacaxi', 10.00, NULL),

-- Cervejas e Águas
('Cervejas', 'Água c/ gás', 4.50, NULL),
('Cervejas', 'Água s/ gás', 3.50, NULL),
('Cervejas', 'Skol lata', 7.00, NULL),
('Cervejas', 'Brahma lata', 7.00, NULL),
('Cervejas', 'Litrinho Skol', 7.00, NULL),
('Cervejas', 'Litrinho Brahma', 7.00, NULL),

-- Doces
('Doces', 'Bombom caseiro', 5.00, NULL);
