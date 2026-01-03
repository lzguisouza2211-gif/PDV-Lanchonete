import { useEffect } from 'react'
import AppRoutes from './app/AppRoutes'
import { supabase } from './services/supabaseClient'
import { usePedidosStore } from './store/usePedidosStore'

export default function App() {
  useEffect(() => {
    const { addPedido, updatePedido } = usePedidosStore.getState()

    const channel = supabase
      .channel('pedidos-realtime')

      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          const pedido = payload.new as any
          console.log('📡 Pedido novo (realtime)', pedido)

          addPedido(pedido)

          // 🔊 SOM GLOBAL (admin aberto)
          const audio = new Audio('/notification.mp3')
          audio.play().catch(() => {})
        }
      )

      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        (payload) => {
          updatePedido(payload.new as any)
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <AppRoutes />
}
