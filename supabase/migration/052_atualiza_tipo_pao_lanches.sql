-- Migration para atualizar descrições dos produtos de Lanches com tipo de pão
-- Data: 26/01/2026

DO $$
DECLARE
  prod RECORD;
BEGIN
  -- PAO FRANCES para calabresa, churrasco, churrasco de contra file, x-calabresa
  UPDATE cardapio SET descricao = LOWER('pao frances, tomate e calabresa'), ingredientes = '["pao frances","tomate","calabresa"]' WHERE LOWER(nome) = 'calabresa';
  UPDATE cardapio SET descricao = LOWER('pao frances, tomate, cebola, calabresa e mussarela'), ingredientes = '["pao frances","tomate","cebola","calabresa","mussarela"]' WHERE LOWER(nome) = 'x-calabresa';
  UPDATE cardapio SET descricao = LOWER('pao frances, tomate, pernil, cebola e mussarela'), ingredientes = '["pao frances","tomate","pernil","cebola","mussarela"]' WHERE LOWER(nome) = 'churrasco';
  UPDATE cardapio SET descricao = LOWER('pao frances, tomate, cebola, contra file e mussarela'), ingredientes = '["pao frances","tomate","cebola","contra file","mussarela"]' WHERE LOWER(nome) = 'churrasco de contra file';

  -- PAO HAMBURGUER para os demais lanches
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese e hamburguer'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer"]' WHERE LOWER(nome) = 'hamburguer';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, milho, catupiry e mussarela'), ingredientes = '["pao hamburguer","milho","catupiry","mussarela"]' WHERE LOWER(nome) = 'combinado';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","mussarela"]' WHERE LOWER(nome) = 'x-burguer';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, alface, hamburguer e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","alface","hamburguer","mussarela"]' WHERE LOWER(nome) = 'x-salada';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tres fatias de presunto e tres fatias de mussarela'), ingredientes = '["pao hamburguer","presunto","mussarela"]' WHERE LOWER(nome) = 'misto';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer, presunto e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","presunto","mussarela"]' WHERE LOWER(nome) = 'especial';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer, ovo e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","ovo","mussarela"]' WHERE LOWER(nome) = 'x-egg';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, 4 fatias de presunto, 4 fatias de mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","presunto","mussarela"]' WHERE LOWER(nome) = 'prensado';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, alface, batata palha, ovo, milho e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","alface","batata palha","ovo","milho","mussarela"]' WHERE LOWER(nome) = 'quaresma';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, alface, ovo, presunto, mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","alface","ovo","presunto","mussarela"]' WHERE LOWER(nome) = 'americano';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer, bacon, mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","bacon","mussarela"]' WHERE LOWER(nome) = 'x-bacon';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer, ovo, presunto e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","ovo","presunto","mussarela"]' WHERE LOWER(nome) = 'baita burguer';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, 2 hamburgueres, ovo, presunto e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","ovo","presunto","mussarela"]' WHERE LOWER(nome) = 'ki-lanche';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer, bacon, ovo, presunto e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","bacon","ovo","presunto","mussarela"]' WHERE LOWER(nome) = 'baita bacon';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, frango desfiado, milho e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","frango desfiado","milho","mussarela"]' WHERE LOWER(nome) = 'galinhao';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, frango file, milho e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","frango file","milho","mussarela"]' WHERE LOWER(nome) = 'x-frango';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer, frango desfiado, ovo, bacon, presunto e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","frango desfiado","ovo","bacon","presunto","mussarela"]' WHERE LOWER(nome) = 'mineiro';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, alface, maionese, 2 hamburguer, batata palha, milho, cebola roxa e mussarela'), ingredientes = '["pao hamburguer","tomate","alface","maionese","hamburguer","batata palha","milho","cebola roxa","mussarela"]' WHERE LOWER(nome) = 'xr';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, batata, frango, milho e catupiry'), ingredientes = '["pao hamburguer","tomate","maionese","batata","frango","milho","catupiry"]' WHERE LOWER(nome) = 'nissan';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, pernil, batata, cebola, abacaxi e mussarela'), ingredientes = '["pao hamburguer","tomate","pernil","batata","cebola","abacaxi","mussarela"]' WHERE LOWER(nome) = 'tropical';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, batata, frango, catupiry, presunto e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","batata","frango","catupiry","presunto","mussarela"]' WHERE LOWER(nome) = 'carijo';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, alface, hamburguer, bacon, ovo, frango, milho, presunto e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","alface","hamburguer","bacon","ovo","frango","milho","presunto","mussarela"]' WHERE LOWER(nome) = 'x-tudo';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, hamburguer, bacon, cheddar, ovo, milho, batata e mussarela'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","bacon","cheddar","ovo","milho","batata","mussarela"]' WHERE LOWER(nome) = 'carioca';
  UPDATE cardapio SET descricao = LOWER('pao hamburguer, tomate, maionese, 2 hamburgueres, frango, bacon, catupiry, milho, presunto, mussarela e batata'), ingredientes = '["pao hamburguer","tomate","maionese","hamburguer","frango","bacon","catupiry","milho","presunto","mussarela","batata"]' WHERE LOWER(nome) = 'mineirao';
END $$;

-- Fim da migration de atualização de descrições de pão
