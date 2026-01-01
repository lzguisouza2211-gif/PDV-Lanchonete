export type Produto = {
  id: string
  nome: string
  preco: number
  descricao?: string
}

export type ItemPedido = {
  produtoId: string
  quantidade: number
  adicionais?: Array<{ nome: string; preco: number }>
}

export type Pedido = {
  id: string
  itens: ItemPedido[]
  total: number
  status: string
}
