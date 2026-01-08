import { create } from 'zustand'

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
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
      const existingItem = state.items.find((i) => i.id === item.id)
      if (existingItem) {
        // Se item já existe, aumenta a quantidade
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i
          ),
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
