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
    adicionais: any[]
  }>
}

/**
 * Normaliza e valida o payload do pedido antes de enviar
 * Garante formato consistente e tipos corretos
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
  // Validações
  if (!input.cliente || input.cliente.trim().length === 0) {
    throw new Error('Nome do cliente é obrigatório')
  }

  if (items.length === 0) {
    throw new Error('Carrinho vazio')
  }

  // Calcula total
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  if (total <= 0) {
    throw new Error('Total do pedido deve ser maior que zero')
  }

  // Normaliza troco
  let troco: number | null = null
  if (input.troco) {
    const trocoNum = typeof input.troco === 'string' ? parseFloat(input.troco) : input.troco
    if (!isNaN(trocoNum) && trocoNum > 0) {
      troco = trocoNum
    }
  }

  // Normaliza endereço (só se for entrega)
  const endereco =
    input.tipoEntrega === 'entrega' && input.endereco
      ? input.endereco.trim()
      : null

  if (input.tipoEntrega === 'entrega' && !endereco) {
    throw new Error('Endereço é obrigatório para entrega')
  }

  // Monta payload normalizado
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
      adicionais: [],
    })),
  }
}

