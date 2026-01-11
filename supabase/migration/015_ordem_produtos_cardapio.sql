-- 1️⃣ Criar coluna de ordem da categoria
alter table cardapio
add column ordem_categoria integer;

-- 2️⃣ Definir ordem conforme exigido

-- LANCHE
update cardapio
set ordem_categoria = 1
where lower(categoria) in ('lanche', 'lanches');

-- MACARRÃO
update cardapio
set ordem_categoria = 2
where lower(categoria) in ('macarrao', 'macarrão');

-- PORÇÃO
update cardapio
set ordem_categoria = 3
where lower(categoria) in ('porcao', 'porção', 'porcoes', 'porções');

-- OMELETE
update cardapio
set ordem_categoria = 4
where lower(categoria) in ('omelete', 'omeletes');

-- BEBIDA
update cardapio
set ordem_categoria = 5
where lower(categoria) in ('bebida', 'bebidas');

-- DOCE
update cardapio
set ordem_categoria = 6
where lower(categoria) in ('doce', 'doces');

-- 3️⃣ Fallback para categorias fora do padrão
update cardapio
set ordem_categoria = 99
where ordem_categoria is null;