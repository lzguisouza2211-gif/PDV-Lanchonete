import create from 'zustand'
import  usePedidos  from '../hooks/usePedidos'

/* =======================
   TIPOS
======================= */
export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  categoria?: string
  observacoes?: string
  ingredientes_indisponiveis?: string[]
  extras?: Array<{ nome: string; preco: number; tipo: 'add' | 'remove' }>
}

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
}

/* =======================
   STORE PURO
======================= */
export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  clear: () => set({ items: [] }),
}))

/* =======================
   STORE + BACKEND
======================= */
export function useCartWithPedidos() {
  const cart = useCart()
  const { criarPedido: criarPedidoService } = usePedidos()

  async function criarPedido(input: {
    cliente: string
    tipoentrega?: string
    endereco?: string
    endereco?: string
    numero?: string
    bairro?: string
    formapagamento?: string
    troco?: number | string
  }) {
    if (!input.cliente) {
      throw new Error('Cliente é obrigatório')
    }

    if (cart.items.length === 0) return null

    const endereco =
      input.tipoentrega === 'entrega' && (input.endereco || input.numero || input.bairro)
        ? `${input.endereco || ''}${input.numero ? `, ${input.numero}` : ''}${input.bairro ? ` - ${input.bairro}` : ''}`
        : null

    const pedido = {
      cliente: input.cliente,
      tipoEntrega: input.tipoentrega ?? null,
      endereco,
      endereco: input.tipoentrega === 'entrega' ? input.endereco ?? null : null,
      numero: input.tipoentrega === 'entrega' ? input.numero ?? null : null,
      bairro: input.tipoentrega === 'entrega' ? input.bairro ?? null : null,
      formaPagamento: input.formapagamento ?? null,
      troco: input.troco ?? null,
      status: 'Recebido',
      total: cart.items.reduce(
        (s, i) => s + i.price * i.qty,
        0
      ),
      itens: cart.items.map((item) => ({
        nome: item.name,
        preco: item.price,
        quantidade: item.qty,
      })),
    }

    const criado = await criarPedidoService(pedido)

    if (criado) {
      cart.clear()
    }

    return criado
  }

  return {
    ...cart,
    criarPedido,
  }
}
