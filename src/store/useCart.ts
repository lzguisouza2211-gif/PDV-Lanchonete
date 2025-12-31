import create from 'zustand'
import { useCallback } from 'react'
import { usePedidos } from '../hooks/usePedidos'
import { Produto, ItemPedido, Pedido as TipoPedido } from '../types'

type CartItem = { id: string; name: string; price: number; qty: number }

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] })
}))

// Wrapper hook that composes the cart store with pedidos service via usePedidos.
// This keeps components free of service logic while exposing a convenient API.
export function useCartWithPedidos() {
  const cart = useCart()
  const { criarPedido } = usePedidos()

  const criarPedidoDoCarrinho = useCallback(async () => {
    // build Pedido type from cart items
    const pedido: Omit<TipoPedido, 'id'> = {
      itens: cart.items.map((it) => ({ produtoId: it.id, quantidade: it.qty })),
      total: cart.items.reduce((s, i) => s + i.price * i.qty, 0),
      status: 'Pendente',
    }
    const created = await criarPedido(pedido as any)
    if (created) {
      cart.clear()
    }
    return created
  }, [cart, criarPedido])

  return { ...cart, criarPedido: criarPedidoDoCarrinho }
}
