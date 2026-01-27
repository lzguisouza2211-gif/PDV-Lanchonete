import { CartItem } from '../store/useCart'
import { limparTelefone, validarTelefoneBrasileiro } from './validation'

export type PedidoPayload = {
  cliente: string
  phone: string
  tipoentrega: string | null
  endereco: string | null
  numero: string | null
  bairro: string | null
  formapagamento: string | null
  troco: number | null
  status: string
  total: number
  taxa_entrega: number
  user_id: string | null
  itens: Array<{
    nome: string
    preco: number
    quantidade: number
    categoria?: string
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
    phone: string
    tipoEntrega?: string
    endereco?: string
    numero?: string
    bairro?: string
    formaPagamento?: string
    troco?: number | string
    user_id?: string | null
    taxaEntrega?: number
  },
  items: CartItem[]
): PedidoPayload {
  if (!input.cliente?.trim()) {
    throw new Error('Nome do cliente é obrigatório')
  }

  if (items.length === 0) {
    throw new Error('Carrinho vazio')
  }

  if (!input.phone) {
    throw new Error('Telefone é obrigatório')
  }

  if (!validarTelefoneBrasileiro(input.phone)) {
    throw new Error('Telefone inválido')
  }

  const phone = limparTelefone(input.phone)

  const subtotal = items.reduce((sum, item) => {
    const extras = (item.extras || []).reduce(
      (s, e) => s + (e.tipo === 'add' ? e.preco : 0),
      0
    )
    return sum + (item.price + extras) * item.qty
  }, 0)

  if (subtotal <= 0) {
    throw new Error('Total inválido')
  }

  // Calcula taxa de entrega apenas se o tipo for 'entrega'
  const taxaEntrega = input.tipoEntrega === 'entrega' ? (input.taxaEntrega || 0) : 0
  const total = subtotal + taxaEntrega

  let troco: number | null = null
  if (input.troco) {
    const t = Number(input.troco)
    if (!isNaN(t) && t > 0) troco = t
  }

  const isEntrega = input.tipoEntrega === 'entrega'
  const enderecoEntrega = isEntrega && input.endereco ? input.endereco.trim() : ''
  const numeroEntrega = isEntrega && input.numero ? input.numero.trim() : ''
  const bairroEntrega = isEntrega && input.bairro ? input.bairro.trim() : ''

  const endereco = isEntrega && (enderecoEntrega || numeroEntrega || bairroEntrega)
    ? `${enderecoEntrega}${numeroEntrega ? `, ${numeroEntrega}` : ''}${bairroEntrega ? ` - ${bairroEntrega}` : ''}`.trim()
    : null

  return {
    cliente: input.cliente.trim(),
    phone,
    tipoentrega: input.tipoEntrega || null,
    endereco,
    numero: isEntrega && numeroEntrega ? numeroEntrega : null,
    bairro: isEntrega && bairroEntrega ? bairroEntrega : null,
    formapagamento: input.formaPagamento || null,
    troco,
    status: 'Recebido',
    total: Number(total.toFixed(2)),
    taxa_entrega: Number(taxaEntrega.toFixed(2)),
    user_id: input.user_id || null,
    itens: items.map((item) => ({
      nome: item.name,
      preco: Number(item.price),
      quantidade: Number(item.qty),
      categoria: item.categoria,
      observacoes: item.observacoes,
      ingredientes_indisponiveis: item.ingredientes_indisponiveis,
      extras: item.extras,
    })),
  }
}