import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { Pedido } from '../../services/api/pedidos.service'
import { usePedidos } from '../../hooks/usePedidos'

export default function Admin() {
  const { listPedidos, atualizarStatus, loading, error } = usePedidos()
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await listPedidos()
      setPedidos(data)
    }
    load()
  }, [listPedidos])

  useEffect(() => {
    const channel = supabase
      .channel('admin-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, 
        (payload) => {
          const novoPedido = payload.new as Pedido
          setPedidos((prev) => [novoPedido, ...prev])
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        (payload) => {
          const pedidoAtualizado = payload.new as Pedido
          setPedidos((prev) =>
            prev.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p))
          )
        }
      )
      .subscribe()

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
        <div key={pedido.id} style={{ borderBottom: '1px solid #ccc', marginBottom: 12 }}>
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
