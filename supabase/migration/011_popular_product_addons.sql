-- Migration 011
-- Popula a tabela de adicionais de produtos (product_addons).
-- Data: 2026-01-28
-- ============================================
-- POPULAR TABELA DE ADICIONAIS (IDEMPOTENTE)
-- ============================================

with addons_padrao (nome, preco, tipo, ordem) as (
  values
    ('Bacon',        8.00, 'add',    1),
    ('Milho',        4.00, 'add',    2),
    ('Hambúrguer',   8.00, 'add',    3),
    ('Catupiry',     8.00, 'add',    4),
    ('Cheddar',      8.00, 'add',    5),
    ('Frango',       8.00, 'add',    6),
    ('Calabresa',    8.00, 'add',    7),
    ('Ovo',          4.00, 'add',    8),
    ('Abacaxi',      8.00, 'add',    9),
    ('Pernil',       8.00, 'add',   10),
    ('Contrafile',   8.00, 'add',   11),
    ('Alface',       0.00, 'remove',12),
    ('Tomate',       0.00, 'remove',13)
)

insert into product_addons (product_id, nome, preco, tipo, ativo, ordem)
select
  c.id,
  a.nome,
  a.preco,
  a.tipo,
  true,
  a.ordem
from cardapio c
cross join addons_padrao a
where c.ativo = true
  and not exists (
    select 1
    from product_addons pa
    where pa.product_id = c.id
      and pa.nome = a.nome
  );


create unique index if not exists
ux_product_addons_product_nome
on product_addons (product_id, nome);