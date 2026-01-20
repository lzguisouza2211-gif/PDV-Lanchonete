export type Produto = {
  id: string
  nome: string
  preco: number
  descricao?: string
  disponivel?: boolean
}

export type ExtraItem = {
  nome: string
  preco: number
  tipo: 'add' | 'remove'
}

export type ItemPedido = {
  produtoId: string
  quantidade: number
  adicionais?: Array<{ nome: string; preco: number }>
  observacoes?: string
  extras?: ExtraItem[]
}

export type Pedido = {
  id: string
  itens: ItemPedido[]
  total: number
  status: string
}
