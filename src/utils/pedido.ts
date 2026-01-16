import { CartItem } from '../store/useCart'

export type PedidoPayload = {
  cliente: string
  tipoentrega: string | null
  endereco: string | null
  formapagamento: string | null
  troco: number | null
  status: string
  total: number
  user_id: string | null
  itens: Array<{
    nome: string
    preco: number
    quantidade: number
    observacoes?: string
    ingredientes_indisponiveis?: string[]
    extras?: Array<{
      nome: string
      preco: number
      tipo: 'add' | 'remove'
    }>
  }>
}

/**
 * Normaliza e valida o payload do pedido antes de enviar
 */
export function normalizePedidoPayload(
  input: {
    cliente: string
    tipoEntrega?: string
    endereco?: string
    formaPagamento?: string
    troco?: number | string
    user_id?: string | null
  },
  items: CartItem[]
): PedidoPayload {
  if (!input.cliente?.trim()) {
    throw new Error('Nome do cliente é obrigatório')
  }

  if (items.length === 0) {
    throw new Error('Carrinho vazio')
  }

  const total = items.reduce((sum, item) => {
    const extras = (item.extras || []).reduce(
      (s, e) => s + (e.tipo === 'add' ? e.preco : 0),
      0
    )
    return sum + (item.price + extras) * item.qty
  }, 0)

  if (total <= 0) {
    throw new Error('Total inválido')
  }

  let troco: number | null = null
  if (input.troco) {
    const t = Number(input.troco)
    if (!isNaN(t) && t > 0) troco = t
  }

  const endereco =
    input.tipoEntrega === 'entrega' && input.endereco
      ? input.endereco.trim()
      : null

  return {
    cliente: input.cliente.trim(),
    tipoentrega: input.tipoEntrega || null,
    endereco,
    formapagamento: input.formaPagamento || null,
    troco,
    status: 'Recebido',
    total: Number(total.toFixed(2)),
    user_id: input.user_id || null,
    itens: items.map((item) => ({
      nome: item.name,
      preco: Number(item.price),
      quantidade: Number(item.qty),
      observacoes: item.observacoes,
      ingredientes_indisponiveis: item.ingredientes_indisponiveis,
      extras: item.extras,
    })),
  }
}