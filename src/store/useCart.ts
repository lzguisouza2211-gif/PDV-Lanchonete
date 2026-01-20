import { create } from 'zustand'
import { ExtraItem } from '../types'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  categoria?: string
  observacoes?: string
  ingredientes_indisponiveis?: string[]
  extras?: ExtraItem[]
  cartKey?: string // Chave única para identificar item no carrinho
}

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (cartKey: string) => void
  clear: () => void
}

// Função auxiliar para gerar chave única do item
function getCartItemKey(item: CartItem): string {
  return `${item.id}-${JSON.stringify(item.extras || [])}-${item.observacoes || ''}-${JSON.stringify(item.ingredientes_indisponiveis || [])}`
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((state) => {
      const itemKey = getCartItemKey(item)
      const existingItem = state.items.find((i) => i.cartKey === itemKey)
      
      if (existingItem) {
        // Se item já existe com mesma customização, aumenta a quantidade
        return {
          items: state.items.map((i) =>
            i.cartKey === itemKey ? { ...i, qty: i.qty + (item.qty || 1) } : i
          ),
        }
      }
      // Se não existe, adiciona novo item com cartKey
      return {
        items: [...state.items, { ...item, qty: item.qty || 1, cartKey: itemKey }],
      }
    }),
  remove: (cartKey) =>
    set((state) => {
      const item = state.items.find((i) => i.cartKey === cartKey)
      if (item && item.qty > 1) {
        // Se quantidade > 1, diminui
        return {
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i
          ),
        }
      }
      // Se quantidade = 1, remove o item
      return {
        items: state.items.filter((i) => i.cartKey !== cartKey),
      }
    }),
  clear: () => set({ items: [] }),
}))
