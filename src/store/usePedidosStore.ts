import  create  from 'zustand'
import { Pedido } from '../services/api/pedidos.service'

type PedidosState = {
  pedidos: Pedido[]
  setPedidos: (p: Pedido[]) => void
  addPedido: (p: Pedido) => void
  updatePedido: (p: Pedido) => void
}

export const usePedidosStore = create<PedidosState>((set) => ({
  pedidos: [],
  setPedidos: (pedidos) => set({ pedidos }),
  addPedido: (pedido) =>
    set((state) => ({
      pedidos: [pedido, ...state.pedidos],
    })),
  updatePedido: (pedido) =>
    set((state) => ({
      pedidos: state.pedidos.map((p) =>
        p.id === pedido.id ? pedido : p
      ),
    })),
}))
