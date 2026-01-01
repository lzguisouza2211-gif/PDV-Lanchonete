create table if not exists cardapio (
  id bigint generated always as identity primary key,
  categoria text not null,
  nome text not null,
  preco numeric not null,
  descricao text,
  ativo boolean default true,
  criado_at timestamptz default now()
);

create table if not exists pedidos (
  id bigint generated always as identity primary key,
  cliente text not null,
  tipoEntrega text,
  endereco text,
  itens jsonb not null,
  formaPagamento text,
  troco numeric,
  total numeric not null,
  data timestamptz default now(),
  status text default 'Recebido'
);

create index if not exists cardapio_categoria_idx on cardapio(categoria);
create index if not exists pedidos_data_idx on pedidos (data);


alter table cardapio enable row level security;
create policy public_select_cardapio on cardapio for select using (true);

alter table pedidos enable row level security;
create policy anon_insert_pedidos on pedidos for insert with check (true);