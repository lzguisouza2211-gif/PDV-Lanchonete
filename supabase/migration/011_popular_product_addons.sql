-- ============================================
-- POPULAR TABELA DE ADICIONAIS
-- ============================================
-- Adiciona os adicionais padrão para todos os produtos ativos

-- Inserir adicionais pagos (tipo 'add')
insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Bacon' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  1 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Bacon'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Milho' as nome,
  4.00 as preco,
  'add' as tipo,
  true as ativo,
  2 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Milho'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Hambúrguer' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  3 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Hambúrguer'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Catupiry' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  4 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Catupiry'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Cheddar' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  5 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Cheddar'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Frango' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  6 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Frango'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Calabresa' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  7 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Calabresa'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Ovo' as nome,
  4.00 as preco,
  'add' as tipo,
  true as ativo,
  8 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Ovo'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Abacaxi' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  9 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Abacaxi'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Pernil' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  10 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Pernil'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Contrafile' as nome,
  8.00 as preco,
  'add' as tipo,
  true as ativo,
  11 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Contrafile'
  );

-- Inserir adicionais gratuitos (tipo 'remove' para remover)
insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Alface' as nome,
  0.00 as preco,
  'remove' as tipo,
  true as ativo,
  12 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Alface'
  );

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select 
  c.id as product_id,
  'Tomate' as nome,
  0.00 as preco,
  'remove' as tipo,
  true as ativo,
  13 as ordem
from cardapio c
where c.ativo = true
  and not exists (
    select 1 from product_addons pa 
    where pa.product_id = c.id and pa.nome = 'Tomate'
  );
