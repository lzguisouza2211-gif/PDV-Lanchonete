import create from 'zustand'

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
    set((state) => ({
      items: [...state.items, item],
    })),
  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  clear: () => set({ items: [] }),
}))
