import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../../services/supabaseClient'
import { usePedidosStore } from '../../store/usePedidosStore'
import usePedidos from '../../hooks/usePedidos'

export default function PedidosAdmin() {
  const { pedidos, setPedidos, addPedido, updatePedido } =
    usePedidosStore()
  const { atualizarStatus } = usePedidos()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const initializedRef = useRef(false)
  const statusChangeRef = useRef<{ [key: number]: string }>({})
  const [audioLiberado, setAudioLiberado] = useState(false)
  const [loading, setLoading] = useState(true)

  // 📥 Carregar pedidos iniciais com otimização
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    async function carregar() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .order('id', { ascending: false })
          .limit(50)

        if (!error && data) {
          setPedidos(data)
        }
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
      } finally {
        setLoading(false)
      }
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
          const novoPedido = payload.new as any
          addPedido(novoPedido)

          // 🔔 Notificação do navegador
          if (Notification.permission === 'granted') {
            new Notification('🍔 Novo pedido recebido!', {
              body: `Cliente: ${novoPedido.cliente}\nTotal: R$ ${Number(
                novoPedido.total
              ).toFixed(2)}`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            })
          }

          // 🔊 Som (se autorizado)
          if (audioRef.current) {
            audioRef.current.play().catch(() => {})
          }
        }
      )

      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        (payload) => {
          // Evita dupla atualização quando fazemos a mudança localmente
          const pedidoId = payload.new.id
          if (statusChangeRef.current[pedidoId]) {
            // Mantém marcado por mais um ciclo
            setTimeout(() => {
              delete statusChangeRef.current[pedidoId]
            }, 100)
            return
          }
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
      return
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Memoizar lista de pedidos para evitar re-renders desnecessários
  const pedidosRenderizados = useMemo(() => {
    return pedidos.map((pedido: any) => (
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

        {/* Botões de atualização de status */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleChangeStatus(pedido.id, 'confirmação')}
            disabled={pedido.status === 'confirmação'}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: pedido.status === 'confirmação' ? '#ccc' : '#3498db',
              color: '#fff',
              cursor: pedido.status === 'confirmação' ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            ✅ Confirmar
          </button>

          <button
            onClick={() => handleChangeStatus(pedido.id, 'Em preparo')}
            disabled={pedido.status === 'Em preparo'}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: pedido.status === 'Em preparo' ? '#ccc' : '#f39c12',
              color: '#fff',
              cursor: pedido.status === 'Em preparo' ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            👨‍🍳 Preparar
          </button>

          <button
            onClick={() => handleChangeStatus(pedido.id, 'Finalizado')}
            disabled={pedido.status === 'Finalizado'}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: pedido.status === 'Finalizado' ? '#ccc' : '#27ae60',
              color: '#fff',
              cursor: pedido.status === 'Finalizado' ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            🎉 Finalizar
          </button>
        </div>
      </div>
    ))
  }, [pedidos, handleChangeStatus])

  // Função para atualizar status do pedido
  const handleChangeStatus = useCallback(
    async (id: number, novoStatus: string) => {
      try {
        // Marca que foi mudança local para evitar dupla atualização do realtime
        // Mantém marcado enquanto a requisição vai pra API
        statusChangeRef.current[id] = novoStatus

        // Atualização otimista na UI
        const pedidoAtual = pedidos.find(p => p.id === id)
        if (pedidoAtual) {
          updatePedido({ ...pedidoAtual, status: novoStatus })
        }

        // Atualizar no banco via hook
        const sucesso = await atualizarStatus(id, novoStatus)

        if (!sucesso) {
          alert('Erro ao atualizar status')
          delete statusChangeRef.current[id]
        }
        // Limpar após resposta do servidor (realtime já terá sido processado)
      } catch (error) {
        console.error('Erro ao atualizar status:', error)
        alert('Erro ao atualizar status')
        delete statusChangeRef.current[id]
      }
    },
    [pedidos, updatePedido, atualizarStatus]
  )

  return (
    <div style={{ padding: 24 }}>
      <audio ref={audioRef} src="/novo-pedido.mp3" preload="auto" />
      
      <h1>📋 Pedidos em tempo real</h1>

      {loading && <p>⏳ Carregando pedidos...</p>}

      {!loading && pedidos.length === 0 && <p>Nenhum pedido no momento.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pedidosRenderizados}
      </div>
    </div>
  )
}