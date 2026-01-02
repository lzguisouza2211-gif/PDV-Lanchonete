import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Pedido } from '../../services/api/pedidos.service'
import { usePedidos } from '../../hooks/usePedidos'

export default function Admin() {
  const { listPedidos, atualizarStatus, loading, error } = usePedidos()
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  const statusStyle: Record<string, string> = {
    Recebido: '#fff3cd',
    'Em preparo': '#cfe2ff',
    Finalizado: '#d1e7dd',
  }

  // carga inicial
  useEffect(() => {
    listPedidos().then(setPedidos)
  }, [listPedidos])

  // realtime DO ADMIN (já autenticado)
  useEffect(() => {
    const channel = supabase
      .channel('admin-pedidos-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          const novo = payload.new as Pedido

          setPedidos((prev) => {
            if (prev.some((p) => p.id === novo.id)) return prev
            return [novo, ...prev]
          })

          // 🔊 som
          const audio = new Audio('/notification.mp3')
          audio.play().catch(() => {})
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        (payload) => {
          const atualizado = payload.new as Pedido
          setPedidos((prev) =>
            prev.map((p) => (p.id === atualizado.id ? atualizado : p))
          )
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime admin status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) return <p>Carregando pedidos...</p>
  if (error) return <p>Erro ao carregar pedidos</p>

  return (
    <main>
      <h1>Pedidos</h1>

      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          style={{
            backgroundColor: statusStyle[pedido.status ?? 'Recebido'],
            padding: 12,
            borderRadius: 6,
            marginBottom: 12,
            border: '1px solid #ccc',
          }}
        >
          <p><strong>Cliente:</strong> {pedido.cliente}</p>
          <p><strong>Total:</strong> R$ {pedido.total}</p>
          <p><strong>Status:</strong> {pedido.status}</p>

          <button onClick={() => atualizarStatus(pedido.id, 'Em preparo')}>
            Em preparo
          </button>
          <button onClick={() => atualizarStatus(pedido.id, 'Finalizado')}>
            Finalizado
          </button>
        </div>
      ))}
    </main>
  )
}
