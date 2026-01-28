-- Migration 030
-- Popula as tabelas auxiliares de ingredientes.
-- Data: 2026-01-28
-- Migration: Popular tabelas de ingredientes
-- Estratégia: Lanches, Macarrão e Omeletes recebem opções de adicionar e remover
-- Porções não recebem (já vêm com tudo pré-definido)

-- 1) Remover duplicatas existentes
delete from public.adicional a
using public.adicional b
where a.id > b.id and a.product_id = b.product_id and a.nome = b.nome;

delete from public.retirar_ingred a
using public.retirar_ingred b
where a.id > b.id and a.product_id = b.product_id and a.nome = b.nome;

-- 2) Criar índices únicos após deduplicar
create unique index if not exists adicional_product_nome_key on public.adicional (product_id, nome);
create unique index if not exists retirar_ingred_product_nome_key on public.retirar_ingred (product_id, nome);

-- LANCHES - Ingredientes que podem ser ADICIONADOS
insert into public.adicional (product_id, nome, preco, ativo, ordem) 
select 
  c.id,
  ingredient,
  price,
  true,
  row_number() over (partition by c.id order by ingredient) as ordem
from public.cardapio c
cross join (
  values 
    ('presunto', 4.00),
    ('mussarela', 4.00),
    ('cheddar', 8.00),
    ('catupiry', 8.00),
    ('bacon', 8.00),
    ('ovo', 4.00),
    ('milho', 4.00),
    ('batata palha', 4.00),
    ('hamburguer', 8.00),
    ('frango desfiado', 8.00),
    ('frango filé', 8.00),
    ('abacaxi', 4.00),
    ('calabresa', 8.00),
    ('alface', 0.00),
    ('cebola', 2.00),
    ('Pernil', 8.00),
    ('contra-file', 12.00)
) as t(ingredient, price)
where c.categoria in ('Lanches', 'Macarrão', 'Omeletes')
on conflict (product_id, nome) do nothing;

with retirar_lanches (nome, categoria, ingrediente, ordem) as (
  values
    -- Hambúrguer
    ('Hambúrguer', 'Lanches', 'pao de hamburguer', 1),
    ('Hambúrguer', 'Lanches', 'tomate', 2),
    ('Hambúrguer', 'Lanches', 'maionese', 3),
    ('Hambúrguer', 'Lanches', 'hamburguer', 4),
    ('Hambúrguer', 'Lanches', 'mussarela', 5),
    -- Calabresa
    ('Calabresa', 'Lanches', 'pao frances', 1),
    ('Calabresa', 'Lanches', 'tomate', 2),
    ('Calabresa', 'Lanches', 'calabresa', 3),
    -- X-Calabresa
    ('X-Calabresa', 'Lanches', 'pao frances', 1),
    ('X-Calabresa', 'Lanches', 'tomate', 2),
    ('X-Calabresa', 'Lanches', 'cebola', 3),
    ('X-Calabresa', 'Lanches', 'calabresa', 4),
    ('X-Calabresa', 'Lanches', 'mussarela', 5),
    -- Combinado
    ('Combinado', 'Lanches', 'pao de hamburguer', 1),
    ('Combinado', 'Lanches', 'milho', 2),
    ('Combinado', 'Lanches', 'catupiry', 3),
    ('Combinado', 'Lanches', 'mussarela', 4),
    -- X-Burguer
    ('X-Burguer', 'Lanches', 'pao de hamburguer', 1),
    ('X-Burguer', 'Lanches', 'tomate', 2),
    ('X-Burguer', 'Lanches', 'maionese', 3),
    ('X-Burguer', 'Lanches', 'hamburguer', 4),
    ('X-Burguer', 'Lanches', 'mussarela', 5),
    -- X-Salada
    ('X-Salada', 'Lanches', 'pao de hamburguer', 1),
    ('X-Salada', 'Lanches', 'tomate', 2),
    ('X-Salada', 'Lanches', 'maionese', 3),
    ('X-Salada', 'Lanches', 'alface', 4),
    ('X-Salada', 'Lanches', 'hamburguer', 5),
    ('X-Salada', 'Lanches', 'mussarela', 6),
    -- Misto
    ('Misto', 'Lanches', 'pao de hamburguer', 1),
    ('Misto', 'Lanches', 'maionese', 2),
    ('Misto', 'Lanches', 'presunto', 3),
    ('Misto', 'Lanches', 'mussarela', 4),
    -- Especial
    ('Especial', 'Lanches', 'pao de hamburguer', 1),
    ('Especial', 'Lanches', 'tomate', 2),
    ('Especial', 'Lanches', 'maionese', 3),
    ('Especial', 'Lanches', 'hamburguer', 4),
    ('Especial', 'Lanches', 'presunto', 5),
    ('Especial', 'Lanches', 'mussarela', 6),
    -- X-Egg
    ('X-Egg', 'Lanches', 'pao de hamburguer', 1),
    ('X-Egg', 'Lanches', 'tomate', 2),
    ('X-Egg', 'Lanches', 'maionese', 3),
    ('X-Egg', 'Lanches', 'hamburguer', 4),
    ('X-Egg', 'Lanches', 'ovo', 5),
    ('X-Egg', 'Lanches', 'mussarela', 6),
    -- Prensado
    ('Prensado', 'Lanches', 'pao de hamburguer', 1),
    ('Prensado', 'Lanches', 'tomate', 2),
    ('Prensado', 'Lanches', 'maionese', 3),
    ('Prensado', 'Lanches', 'presunto', 4),
    ('Prensado', 'Lanches', 'mussarela', 5),
    -- Quaresma
    ('Quaresma', 'Lanches', 'pao de hamburguer', 1),
    ('Quaresma', 'Lanches', 'tomate', 2),
    ('Quaresma', 'Lanches', 'maionese', 3),
    ('Quaresma', 'Lanches', 'alface', 4),
    ('Quaresma', 'Lanches', 'batata palha', 5),
    ('Quaresma', 'Lanches', 'ovo', 6),
    ('Quaresma', 'Lanches', 'milho', 7),
    ('Quaresma', 'Lanches', 'mussarela', 8),
    -- Bacon
    ('Bacon', 'Lanches', 'pao de hamburguer', 1),
    ('Bacon', 'Lanches', 'tomate', 2),
    ('Bacon', 'Lanches', 'maionese', 3),
    ('Bacon', 'Lanches', 'hamburguer', 4),
    ('Bacon', 'Lanches', 'bacon', 5),
    ('Bacon', 'Lanches', 'mussarela', 6),
    -- X-Tudo
    ('X-Tudo', 'Lanches', 'pao de hamburguer', 1),
    ('X-Tudo', 'Lanches', 'tomate', 2),
    ('X-Tudo', 'Lanches', 'maionese', 3),
    ('X-Tudo', 'Lanches', 'alface', 4),
    ('X-Tudo', 'Lanches', 'hamburguer', 5),
    ('X-Tudo', 'Lanches', 'bacon', 6),
    ('X-Tudo', 'Lanches', 'ovo', 7),
    ('X-Tudo', 'Lanches', 'frango', 8),
    ('X-Tudo', 'Lanches', 'milho', 9),
    ('X-Tudo', 'Lanches', 'presunto', 10),
    ('X-Tudo', 'Lanches', 'mussarela', 11),
    -- Americano
    ('Americano', 'Lanches', 'pao de hamburguer', 1),
    ('Americano', 'Lanches', 'tomate', 2),
    ('Americano', 'Lanches', 'maionese', 3),
    ('Americano', 'Lanches', 'alface', 4),
    ('Americano', 'Lanches', 'ovo', 5),
    ('Americano', 'Lanches', 'presunto', 6),
    ('Americano', 'Lanches', 'mussarela', 7),
    -- Baita Burgue
    ('Baita Burgue', 'Lanches', 'pao de hamburguer', 1),
    ('Baita Burgue', 'Lanches', 'tomate', 2),
    ('Baita Burgue', 'Lanches', 'maionese', 3),
    ('Baita Burgue', 'Lanches', 'hamburguer', 4),
    ('Baita Burgue', 'Lanches', 'ovo', 5),
    ('Baita Burgue', 'Lanches', 'presunto', 6),
    ('Baita Burgue', 'Lanches', 'mussarela', 7),
    -- Ki-lanche
    ('Ki-lanche', 'Lanches', 'pao de hamburguer', 1),
    ('Ki-lanche', 'Lanches', 'tomate', 2),
    ('Ki-lanche', 'Lanches', 'maionese', 3),
    ('Ki-lanche', 'Lanches', 'hamburguer', 4),
    ('Ki-lanche', 'Lanches', 'ovo', 5),
    ('Ki-lanche', 'Lanches', 'presunto', 6),
    ('Ki-lanche', 'Lanches', 'mussarela', 7),
    -- Baita Bacon
    ('Baita Bacon', 'Lanches', 'pao de hamburguer', 1),
    ('Baita Bacon', 'Lanches', 'tomate', 2),
    ('Baita Bacon', 'Lanches', 'maionese', 3),
    ('Baita Bacon', 'Lanches', 'hamburguer', 4),
    ('Baita Bacon', 'Lanches', 'bacon', 5),
    ('Baita Bacon', 'Lanches', 'ovo', 6),
    ('Baita Bacon', 'Lanches', 'presunto', 7),
    ('Baita Bacon', 'Lanches', 'mussarela', 8),
    -- Galinhao
    ('Galinhao', 'Lanches', 'pao de hamburguer', 1),
    ('Galinhao', 'Lanches', 'tomate', 2),
    ('Galinhao', 'Lanches', 'maionese', 3),
    ('Galinhao', 'Lanches', 'frango desfiado', 4),
    ('Galinhao', 'Lanches', 'milho', 5),
    ('Galinhao', 'Lanches', 'mussarela', 6),
    -- X-frango
    ('X-frango', 'Lanches', 'pao de hamburguer', 1),
    ('X-frango', 'Lanches', 'tomate', 2),
    ('X-frango', 'Lanches', 'maionese', 3),
    ('X-frango', 'Lanches', 'frango filé', 4),
    ('X-frango', 'Lanches', 'milho', 5),
    ('X-frango', 'Lanches', 'mussarela', 6),
    -- Mineiro
    ('Mineiro', 'Lanches', 'pao de hamburguer', 1),
    ('Mineiro', 'Lanches', 'tomate', 2),
    ('Mineiro', 'Lanches', 'maionese', 3),
    ('Mineiro', 'Lanches', 'hamburguer', 4),
    ('Mineiro', 'Lanches', 'frango', 5),
    ('Mineiro', 'Lanches', 'ovo', 6),
    ('Mineiro', 'Lanches', 'bacon', 7),
    ('Mineiro', 'Lanches', 'presunto', 8),
    ('Mineiro', 'Lanches', 'mussarela', 9),
    -- Churrasco
    ('Churrasco', 'Lanches', 'pao frances', 1),
    ('Churrasco', 'Lanches', 'tomate', 2),
    ('Churrasco', 'Lanches', 'pernil', 3),
    ('Churrasco', 'Lanches', 'cebola', 4),
    ('Churrasco', 'Lanches', 'mussarela', 5),
    -- XR
    ('XR', 'Lanches', 'pao de hamburguer', 1),
    ('XR', 'Lanches', 'tomate', 2),
    ('XR', 'Lanches', 'alface', 3),
    ('XR', 'Lanches', 'maionese', 4),
    ('XR', 'Lanches', 'hamburguer', 5),
    ('XR', 'Lanches', 'batata palha', 6),
    ('XR', 'Lanches', 'milho', 7),
    ('XR', 'Lanches', 'cebola roxa', 8),
    ('XR', 'Lanches', 'mussarela', 9),
    -- Nissan
    ('Nissan', 'Lanches', 'pao de hamburguer', 1),
    ('Nissan', 'Lanches', 'tomate', 2),
    ('Nissan', 'Lanches', 'maionese', 3),
    ('Nissan', 'Lanches', 'batata', 4),
    ('Nissan', 'Lanches', 'frango', 5),
    ('Nissan', 'Lanches', 'milho', 6),
    ('Nissan', 'Lanches', 'catupiry', 7),
    -- Tropical
    ('Tropical', 'Lanches', 'pao de hamburguer', 1),
    ('Tropical', 'Lanches', 'tomate', 2),
    ('Tropical', 'Lanches', 'pernil', 3),
    ('Tropical', 'Lanches', 'batata', 4),
    ('Tropical', 'Lanches', 'cebola', 5),
    ('Tropical', 'Lanches', 'abacaxi', 6),
    ('Tropical', 'Lanches', 'mussarela', 7),
    -- Carijo
    ('Carijo', 'Lanches', 'pao de hamburguer', 1),
    ('Carijo', 'Lanches', 'tomate', 2),
    ('Carijo', 'Lanches', 'maionese', 3),
    ('Carijo', 'Lanches', 'batata', 4),
    ('Carijo', 'Lanches', 'frango', 5),
    ('Carijo', 'Lanches', 'catupiry', 6),
    ('Carijo', 'Lanches', 'presunto', 7),
    ('Carijo', 'Lanches', 'mussarela', 8),
    -- Carioca
    ('Carioca', 'Lanches', 'pao de hamburguer', 1),
    ('Carioca', 'Lanches', 'tomate', 2),
    ('Carioca', 'Lanches', 'maionese', 3),
    ('Carioca', 'Lanches', 'hamburguer', 4),
    ('Carioca', 'Lanches', 'bacon', 5),
    ('Carioca', 'Lanches', 'cheddar', 6),
    ('Carioca', 'Lanches', 'ovo', 7),
    ('Carioca', 'Lanches', 'milho', 8),
    ('Carioca', 'Lanches', 'batata', 9),
    ('Carioca', 'Lanches', 'mussarela', 10),
    -- Mineirão
    ('Mineirão', 'Lanches', 'pao de hamburguer', 1),
    ('Mineirão', 'Lanches', 'tomate', 2),
    ('Mineirão', 'Lanches', 'maionese', 3),
    ('Mineirão', 'Lanches', 'hamburguer', 4),
    ('Mineirão', 'Lanches', 'frango', 5),
    ('Mineirão', 'Lanches', 'bacon', 6),
    ('Mineirão', 'Lanches', 'catupiry', 7),
    ('Mineirão', 'Lanches', 'milho', 8),
    ('Mineirão', 'Lanches', 'presunto', 9),
    ('Mineirão', 'Lanches', 'mussarela', 10),
    ('Mineirão', 'Lanches', 'batata', 11),
    -- Frango no Prato
    ('Frango no Prato', 'Lanches', 'alface', 1),
    ('Frango no Prato', 'Lanches', 'tomate', 2),
    ('Frango no Prato', 'Lanches', 'batata', 3),
    ('Frango no Prato', 'Lanches', 'frango filé', 4),
    ('Frango no Prato', 'Lanches', 'bacon', 5),
    ('Frango no Prato', 'Lanches', 'milho', 6),
    ('Frango no Prato', 'Lanches', 'mussarela', 7),
    -- Pernil no prato
    ('Pernil no prato', 'Lanches', 'alface', 1),
    ('Pernil no prato', 'Lanches', 'tomate', 2),
    ('Pernil no prato', 'Lanches', 'batata', 3),
    ('Pernil no prato', 'Lanches', 'pernil', 4),
    ('Pernil no prato', 'Lanches', 'cebola', 5),
    ('Pernil no prato', 'Lanches', 'bacon', 6),
    ('Pernil no prato', 'Lanches', 'mussarela', 7),
    -- Churrasco de Contra File
    ('Churrasco de Contra File', 'Lanches', 'pao frances', 1),
    ('Churrasco de Contra File', 'Lanches', 'tomate', 2),
    ('Churrasco de Contra File', 'Lanches', 'cebola', 3),
    ('Churrasco de Contra File', 'Lanches', 'contra-file', 4),
    ('Churrasco de Contra File', 'Lanches', 'mussarela', 5)
)
insert into public.retirar_ingred (product_id, nome, ativo, ordem)
select c.id, r.ingrediente, true, r.ordem
from retirar_lanches r
join public.cardapio c on c.nome = r.nome and c.categoria = r.categoria
on conflict (product_id, nome) do nothing;

-- MACARRÃO - Ingredientes removíveis
insert into public.retirar_ingred (product_id, nome, ativo, ordem)
values
((select id from public.cardapio where nome = 'Calabresa' and categoria = 'Macarrão'), 'bacon', true, 1),
((select id from public.cardapio where nome = 'Calabresa' and categoria = 'Macarrão'), 'cebola', true, 2),
((select id from public.cardapio where nome = 'Pernil' and categoria = 'Macarrão'), 'bacon', true, 1),
((select id from public.cardapio where nome = 'Pernil' and categoria = 'Macarrão'), 'cebola', true, 2),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Macarrão'), 'bacon', true, 1),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Macarrão'), 'cebola', true, 2),
((select id from public.cardapio where nome = 'Bolonhesa' and categoria = 'Macarrão'), 'cebola', true, 1),
((select id from public.cardapio where nome = 'Bolonhesa' and categoria = 'Macarrão'), 'milho', true, 2)
on conflict do nothing;

-- OMELETES - Ingredientes removíveis
insert into public.retirar_ingred (product_id, nome, ativo, ordem)
values
((select id from public.cardapio where nome = 'Da Casa' and categoria = 'Omeletes'), 'presunto', true, 1),
((select id from public.cardapio where nome = 'Da Casa' and categoria = 'Omeletes'), 'queijo', true, 2),
((select id from public.cardapio where nome = 'Da Casa' and categoria = 'Omeletes'), 'batata', true, 3),
((select id from public.cardapio where nome = 'Da Casa' and categoria = 'Omeletes'), 'milho', true, 4),
((select id from public.cardapio where nome = 'Da Casa' and categoria = 'Omeletes'), 'cebola', true, 5),
((select id from public.cardapio where nome = 'Catupiry' and categoria = 'Omeletes'), 'catupiry', true, 1),
((select id from public.cardapio where nome = 'Catupiry' and categoria = 'Omeletes'), 'milho', true, 2),
((select id from public.cardapio where nome = 'Catupiry' and categoria = 'Omeletes'), 'bacon', true, 3),
((select id from public.cardapio where nome = 'Catupiry' and categoria = 'Omeletes'), 'presunto', true, 4),
((select id from public.cardapio where nome = 'Catupiry' and categoria = 'Omeletes'), 'queijo', true, 5),
((select id from public.cardapio where nome = 'Catupiry' and categoria = 'Omeletes'), 'batata', true, 6),
((select id from public.cardapio where nome = 'Catupiry' and categoria = 'Omeletes'), 'cebola', true, 7),
((select id from public.cardapio where nome = 'Cheddar' and categoria = 'Omeletes'), 'cheddar', true, 1),
((select id from public.cardapio where nome = 'Cheddar' and categoria = 'Omeletes'), 'milho', true, 2),
((select id from public.cardapio where nome = 'Cheddar' and categoria = 'Omeletes'), 'bacon', true, 3),
((select id from public.cardapio where nome = 'Cheddar' and categoria = 'Omeletes'), 'presunto', true, 4),
((select id from public.cardapio where nome = 'Cheddar' and categoria = 'Omeletes'), 'queijo', true, 5),
((select id from public.cardapio where nome = 'Cheddar' and categoria = 'Omeletes'), 'batata', true, 6),
((select id from public.cardapio where nome = 'Cheddar' and categoria = 'Omeletes'), 'cebola', true, 7),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Omeletes'), 'frango', true, 1),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Omeletes'), 'milho', true, 2),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Omeletes'), 'bacon', true, 3),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Omeletes'), 'presunto', true, 4),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Omeletes'), 'queijo', true, 5),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Omeletes'), 'batata', true, 6),
((select id from public.cardapio where nome = 'Frango' and categoria = 'Omeletes'), 'cebola', true, 7)
on conflict do nothing;
