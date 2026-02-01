import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../../services/supabaseClient'
import { usePedidosStore } from '../../store/usePedidosStore'
import usePedidos from '../../hooks/usePedidos'
import { usePrinter } from '../../hooks/usePrinter'

export default function PedidosAdmin() {
  const { pedidos, setPedidos, addPedido, updatePedido } =
    usePedidosStore()
  const { atualizarStatus } = usePedidos()
  const { printProducao, printMotoboy } = usePrinter()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const initializedRef = useRef(false)
  const statusChangeRef = useRef<{ [key: number]: string }>({})
  const audioUnlockedRef = useRef(false)
  const [loading, setLoading] = useState(true)

  // 🔊 Inicializar e desbloquear áudio
  useEffect(() => {
    // Criar áudio uma vez
    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.volume = 1

    // Desbloquear áudio com interação do usuário (requerido pelos browsers)
    const unlockAudio = () => {
      if (!audioRef.current || audioUnlockedRef.current) return

      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause()
          audioRef.current!.currentTime = 0
          audioUnlockedRef.current = true
          console.log('✅ Áudio desbloqueado para notificações')
        })
        .catch((err) => {
          console.warn('⚠️ Não foi possível desbloquear áudio:', err)
        })

      window.removeEventListener('click', unlockAudio)
    }

    window.addEventListener('click', unlockAudio)

    return () => {
      window.removeEventListener('click', unlockAudio)
    }
  }, [])

  // 📥 Carregar pedidos iniciais com itens
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
          // Buscar itens para cada pedido
          const pedidosComItens = await Promise.all(
            data.map(async (pedido: any) => {
              const { data: itens, error: errorItens } = await supabase
                .from('pedido_itens')
                .select('*')
                .eq('pedido_id', pedido.id)
                .order('id', { ascending: true })
              console.log('[DEBUG] Itens buscados para pedido', pedido.id, itens)
              return {
                ...pedido,
                itens: !errorItens && itens ? itens : [],
              }
            })
          )
          setPedidos(pedidosComItens)
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
    console.log('🔌 Conectando ao canal de pedidos em tempo real...')
    
    const channel = supabase
      .channel('admin-pedidos')

      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        async (payload) => {
          console.log('🆕 Novo pedido recebido via realtime:', payload.new)
          const novoPedido = payload.new as any
          // Buscar itens do novo pedido
          const { data: itens, error: errorItens } = await supabase
            .from('pedido_itens')
            .select('*')
            .eq('pedido_id', novoPedido.id)
            .order('id', { ascending: true })
          addPedido({ ...novoPedido, itens: !errorItens && itens ? itens : [] })

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

          // 🔊 Som (se desbloqueado)
          console.log('🔊 Tentando tocar som... Desbloqueado:', audioUnlockedRef.current)
          if (audioRef.current && audioUnlockedRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch((err) => {
              console.error('❌ Erro ao tocar som de notificação:', err)
            })
          } else if (!audioUnlockedRef.current) {
            console.warn('⚠️ Áudio ainda não foi desbloqueado. Clique na página primeiro!')
          }
        }
      )

      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        async (payload) => {
          // Evita dupla atualização quando fazemos a mudança localmente
          const pedidoId = payload.new.id
          if (statusChangeRef.current[pedidoId]) {
            // Mantém marcado por mais um ciclo
            setTimeout(() => {
              delete statusChangeRef.current[pedidoId]
            }, 100)
            return
          }
          // Buscar itens atualizados do pedido
          const { data: itens, error: errorItens } = await supabase
            .from('pedido_itens')
            .select('*')
            .eq('pedido_id', pedidoId)
            .order('id', { ascending: true })
          updatePedido({ ...payload.new, itens: !errorItens && itens ? itens : [] })
        }
      )

      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        async (payload) => {
          console.log('🆕 Novo pedido recebido via realtime:', payload.new)
          const novoPedido = payload.new as any
          // Buscar itens do novo pedido
          const { data: itens, error: errorItens } = await supabase
            .from('pedido_itens')
            .select('*')
            .eq('pedido_id', novoPedido.id)
            .order('id', { ascending: true })
          addPedido({ ...novoPedido, itens: !errorItens && itens ? itens : [] })

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
          // 🔊 Som (se desbloqueado)
          console.log('🔊 Tentando tocar som... Desbloqueado:', audioUnlockedRef.current)
          if (audioRef.current && audioUnlockedRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch((err) => {
              console.error('❌ Erro ao tocar som de notificação:', err)
            })
          } else if (!audioUnlockedRef.current) {
            console.warn('⚠️ Áudio ainda não foi desbloqueado. Clique na página primeiro!')
          }
        }
      )
        // Atualizar no banco via hook
        const sucesso = await atualizarStatus(id, novoStatus)

        if (!sucesso) {
          alert('Erro ao atualizar status')
          delete statusChangeRef.current[id]
        } else {
          // Impressão automática ao passar para "Em preparo"
          if (novoStatus === 'Em preparo' && pedidoAtual) {
            // Imprime produção sempre
            printProducao(pedidoAtual)
            // Se for entrega, imprime motoboy após pequeno delay
            if (pedidoAtual.tipoentrega === 'entrega') {
              setTimeout(() => {
                printMotoboy(pedidoAtual)
              }, 1200) // 1.2s para dar tempo de destacar
            }
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error)
        alert('Erro ao atualizar status')
        delete statusChangeRef.current[id]
      }
    },
    [pedidos, updatePedido, atualizarStatus, printProducao, printMotoboy]
  )

  const formatEndereco = (pedido: any) => {
    const endereco = (pedido.endereco || '').trim()
    const numero = (pedido.numero || '').trim()
    const bairro = (pedido.bairro || '').trim()

    const novoFormato = endereco
      ? `${endereco}${numero ? `, ${numero}` : ''}${bairro ? ` - ${bairro}` : ''}`
      : ''

    return novoFormato
  }

  // Memoizar lista de pedidos para evitar re-renders desnecessários
  const pedidosRenderizados = useMemo(() => {
    return pedidos.map((pedido: any) => {
      const endereco = formatEndereco(pedido)

      return (
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

          {pedido.phone && (
            <p style={{ fontSize: 14, color: '#2c3e50', fontWeight: 500 }}>
              📱 {pedido.phone}
            </p>
          )}

          {endereco && (
            <p style={{ fontSize: 14 }}>📍 {endereco}</p>
          )}

        {/* Campo Tempo de Preparo */}
        <div style={{ marginTop: 12, padding: '8px', borderRadius: 6, backgroundColor: '#f0f0f0' }}>
          <label style={{ fontSize: 13, display: 'block', marginBottom: 6, fontWeight: 600 }}>
            ⏱️ Tempo de Preparo (minutos):
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              step="5"
              value={pedido.tempo_preparo || 40}
              onChange={(e) => {
                const novoTempo = parseInt(e.target.value)
                setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, tempo_preparo: novoTempo } : p))
              }}
              style={{
                padding: '6px 8px',
                borderRadius: 4,
                border: '1px solid #ddd',
                width: '80px',
                fontSize: 14,
              }}
            />
            <button
              onClick={() => atualizarStatus(pedido.id, pedido.status || 'Recebido', pedido.tempo_preparo || 40)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: 'none',
                background: '#3498db',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              💾 Salvar
            </button>
          </div>
        </div>

        {/* Itens do pedido */}
        {pedido.itens && Array.isArray(pedido.itens) && pedido.itens.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
            <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>📦 Itens:</strong>
            {pedido.itens.map((item: any, idx: number) => (
              <div key={idx} style={{ fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>
                <div>
                  {item.quantidade}x <strong>{item.nome}</strong>
                </div>
                {item.extras && Array.isArray(item.extras) && item.extras.length > 0 && (
                  <div style={{ marginLeft: 12, color: '#666', fontSize: 12 }}>
                    {item.extras.map((extra: any, i: number) => (
                      <div key={i}>
                        {extra.tipo === 'add' ? '+' : '−'} {extra.nome}
                      </div>
                    ))}
                  </div>
                )}
                {item.ingredientes_indisponiveis && Array.isArray(item.ingredientes_indisponiveis) && item.ingredientes_indisponiveis.length > 0 && (
                  <div style={{ marginLeft: 12, color: '#e74c3c', fontSize: 12, fontWeight: 600 }}>
                    {item.ingredientes_indisponiveis.map((ing: string, i: number) => (
                      <div key={i}>
                        − Sem {ing}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botões de atualização de status */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
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

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>📋 Pedidos em tempo real</h1>
        
        <button
          onClick={() => {
            console.log('🧪 Teste de som...')
            console.log('Áudio criado:', !!audioRef.current)
            console.log('Áudio desbloqueado:', audioUnlockedRef.current)
            
            if (!audioRef.current) {
              alert('❌ Áudio não foi criado!')
              return
            }
            
            if (!audioUnlockedRef.current) {
              alert('⚠️ Clique na página para desbloquear o áudio primeiro!')
              return
            }
            
            audioRef.current.currentTime = 0
            audioRef.current.play()
              .then(() => alert('✅ Som tocado com sucesso!'))
              .catch(err => alert('❌ Erro: ' + err.message))
          }}
          style={{
            padding: '10px 20px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          🔊 Testar Som
        </button>
      </div>

      {loading && <p>⏳ Carregando pedidos...</p>}

      {!loading && pedidos.length === 0 && <p>Nenhum pedido no momento.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {pedidosRenderizados}
      </div>
    </div>
  )
}
