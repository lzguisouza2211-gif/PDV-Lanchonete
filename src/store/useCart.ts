import { create } from 'zustand'
import { ExtraItem } from '../types'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  observacoes?: string
  ingredientes_indisponiveis?: string[]
  extras?: ExtraItem[]
}

type CartState = {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((state) => {
      // Criar ID único baseado no produto + extras + observações + ingredientes_indisponiveis para diferenciar itens customizados
      const itemKey = `${item.id}-${JSON.stringify(item.extras || [])}-${item.observacoes || ''}-${JSON.stringify(item.ingredientes_indisponiveis || [])}`
      const existingItem = state.items.find((i) => {
        const iKey = `${i.id}-${JSON.stringify(i.extras || [])}-${i.observacoes || ''}-${JSON.stringify(i.ingredientes_indisponiveis || [])}`
        return iKey === itemKey
      })
      
      if (existingItem) {
        // Se item já existe com mesma customização, aumenta a quantidade
        return {
          items: state.items.map((i) => {
            const iKey = `${i.id}-${JSON.stringify(i.extras || [])}-${i.observacoes || ''}-${JSON.stringify(i.ingredientes_indisponiveis || [])}`
            return iKey === itemKey ? { ...i, qty: i.qty + (item.qty || 1) } : i
          }),
        }
      }
      // Se não existe, adiciona novo item
      return {
        items: [...state.items, { ...item, qty: item.qty || 1 }],
      }
    }),
  remove: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id)
      if (item && item.qty > 1) {
        // Se quantidade > 1, diminui
        return {
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: i.qty - 1 } : i
          ),
        }
      }
      // Se quantidade = 1, remove o item
      return {
        items: state.items.filter((i) => i.id !== id),
      }
    }),
  clear: () => set({ items: [] }),
}))
