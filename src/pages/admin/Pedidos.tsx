import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../services/supabaseClient'
import { usePedidosStore } from '../../store/usePedidosStore'

const [audioLiberado, setAudioLiberado] = useState(false)

export default function PedidosAdmin() {
  const { pedidos, setPedidos, addPedido, updatePedido } =
    usePedidosStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const initializedRef = useRef(false)

  // 📥 Carregar pedidos iniciais
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    async function carregar() {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .order('id', { ascending: false })

      if (data) setPedidos(data)
    }

    carregar()
  }, [setPedidos])

  // 📡 Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-pedidos')

      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          addPedido(payload.new as any)
          
          if (Notification.permission === 'granted') {
    new Notification('🍔 Novo pedido recebido!', {
        body: `Cliente: ${novoPedido.cliente}\nTotal: R$ ${Number(
        novoPedido.total
        ).toFixed(2)}`,
        icon: '/icon-192.png', // opcional
        badge: '/icon-192.png', // opcional
    })
    }
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
  }, [addPedido, updatePedido])

  useEffect(() => {
    if (!('Notification' in window)) {
        console.warn('🔕 Navegador não suporta notificações')
        return
    }

    if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
        console.log('🔔 Permissão de notificação:', permission)
        })
    }
    }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>📋 Pedidos em tempo real</h1>

      {pedidos.length === 0 && <p>Nenhum pedido no momento.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pedidos.map((pedido: any) => (
          <div
            key={pedido.id}
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid #ddd',
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{pedido.cliente}</strong>
              <span style={{ fontWeight: 600 }}>{pedido.status}</span>
            </div>

            <p style={{ margin: '8px 0' }}>
              💰 Total: <strong>R$ {Number(pedido.total).toFixed(2)}</strong>
            </p>

            <p style={{ fontSize: 14, color: '#666' }}>
              Tipo: {pedido.tipoentrega || '—'}
            </p>

            {pedido.endereco && (
              <p style={{ fontSize: 14 }}>📍 {pedido.endereco}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}