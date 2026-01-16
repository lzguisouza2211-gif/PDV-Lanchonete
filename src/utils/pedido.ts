import { CartItem } from '../store/useCart'

export type PedidoPayload = {
  cliente: string
  telefone: string | null
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
    telefone?: string
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

  if (!input.telefone?.trim()) {
    throw new Error('Telefone é obrigatório para notificações WhatsApp')
  }

  const telefone = input.telefone.replace(/\D/g, '')
  if (telefone.length < 10 || telefone.length > 11) {
    throw new Error('Telefone inválido. Use formato: (11) 98765-4321')
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
    telefone: input.telefone.replace(/\D/g, ''),
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
      extras: item.extras,
    })),
  }
}