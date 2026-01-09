-- ============================================
-- ADICIONAR CAMPOS DE CUSTOMIZAÇÃO AOS PEDIDOS
-- ============================================
-- Adiciona campos para observações e extras nos itens do pedido
-- Os itens já são armazenados como JSONB, então vamos estender a estrutura

-- Nota: Como os itens são JSONB, não precisamos alterar a estrutura da tabela
-- Mas vamos criar uma função helper para validar a estrutura dos itens
-- e documentar o formato esperado

-- Formato esperado para itens JSONB:
-- {
--   "nome": "X-Burger",
--   "preco": 15.00,
--   "quantidade": 1,
--   "observacoes": "Sem cebola, por favor",
--   "extras": [
--     { "nome": "Bacon", "preco": 3.00, "tipo": "add" },
--     { "nome": "Cebola", "preco": 0, "tipo": "remove" }
--   ]
-- }

-- Criar função para calcular total com extras (opcional, para uso futuro)
create or replace function calcular_total_item(item jsonb)
returns numeric as $$
declare
  preco_base numeric;
  quantidade numeric;
  total_extras numeric := 0;
  extra jsonb;
begin
  preco_base := (item->>'preco')::numeric;
  quantidade := coalesce((item->>'quantidade')::numeric, 1);
  
  -- Somar preços dos extras do tipo "add"
  if item ? 'extras' and jsonb_typeof(item->'extras') = 'array' then
    for extra in select * from jsonb_array_elements(item->'extras')
    loop
      if (extra->>'tipo') = 'add' then
        total_extras := total_extras + coalesce((extra->>'preco')::numeric, 0);
      end if;
    end loop;
  end if;
  
  return (preco_base + total_extras) * quantidade;
end;
$$ language plpgsql immutable;

-- Comentário na coluna itens para documentar o formato
comment on column pedidos.itens is 'Array JSONB de itens. Cada item pode conter: nome, preco, quantidade, observacoes (texto), extras (array de {nome, preco, tipo: add|remove})';

