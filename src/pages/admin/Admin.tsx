import { useEffect, useState } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd'

import { Pedido } from '../../services/api/pedidos.service'
import usePedidos from '../../hooks/usePedidos'
import { supabase } from '../../services/supabaseClient'

const COLUMNS = [
  { id: 'Recebido', title: 'Recebido', color: '#fff3cd', icon: '📥' },
  { id: 'confirmação', title: 'Confirmação', color: '#d1ecf1', icon: '✅' },
  { id: 'Em preparo', title: 'Em preparo', color: '#cfe2ff', icon: '👨‍🍳' },
  { id: 'Finalizado', title: 'Finalizado', color: '#d1e7dd', icon: '🎉' },
]

export default function Admin() {
  const { listPedidos, atualizarStatus, loading, error } = usePedidos()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<Pedido | null>(null)

  /* =======================
     LOAD INICIAL
  ======================= */
  useEffect(() => {
    const load = async () => {
      const data = await listPedidos()
      setPedidos([...data].sort((a, b) => b.id - a.id))
    }
    load()
  }, [listPedidos])

  /* =======================
     REALTIME
  ======================= */
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
        }
      )

      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos' },
        (payload) => {
          const atualizado = payload.new as Pedido

          setPedidos((prev) =>
            prev.map((p) =>
              p.id === atualizado.id ? atualizado : p
            )
          )
        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  /* =======================
     DRAG END
  ======================= */
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result
    if (!destination) return

    const origem = source.droppableId
    const destino = destination.droppableId

    // regras
    if (origem === 'Finalizado') return
    if (origem === 'Recebido' && destino === 'Finalizado') return
    if (origem === 'confirmação' && destino === 'Recebido') return

    const pedidoId = Number(draggableId)

    // UI otimista
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId ? { ...p, status: destino } : p
      )
    )

    await atualizarStatus(pedidoId, destino)
  }

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 18, color: '#666' }}>Carregando pedidos...</p>
      </div>
    )
  if (error)
    return (
      <div
        style={{
          background: '#fee',
          padding: 16,
          borderRadius: 8,
          color: '#c0392b',
        }}
      >
        <p style={{ margin: 0 }}>Erro ao carregar pedidos</p>
      </div>
    )

  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: 32, fontSize: 32, fontWeight: 700 }}>
        📋 Painel de Pedidos
      </h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {COLUMNS.map((col) => {
            let pedidosColuna = pedidos.filter(
              (p) => (p.status ?? 'Recebido') === col.id
            )

            // 🔒 Finalizados: só hoje + limite visual
            if (col.id === 'Finalizado') {
              pedidosColuna = pedidosColuna
                .filter((p: any) =>
                  p.created_at?.startsWith(hoje)
                )
                .slice(0, 20)
            }

            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: '#fff',
                      borderRadius: 16,
                      padding: 20,
                      minHeight: 500,
                      boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                      borderTop: `4px solid ${col.color}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 16,
                        paddingBottom: 12,
                        borderBottom: '2px solid #f3f4f6',
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{col.icon}</span>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#1a1a1a',
                        }}
                      >
                        {col.title}
                      </h3>
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: col.color,
                          color: '#1a1a1a',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {pedidosColuna.length}
                      </span>
                    </div>

                    {pedidosColuna.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '40px 20px',
                          color: '#999',
                          fontSize: 14,
                        }}
                      >
                        Nenhum pedido
                      </div>
                    ) : (
                      pedidosColuna.map((pedido, index) => {
                        const bloqueado = pedido.status === 'Finalizado'
                        const hora = (pedido as any).created_at
                          ? new Date(
                              (pedido as any).created_at
                            ).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '--:--'

                        return (
                          <Draggable
                            key={pedido.id}
                            draggableId={String(pedido.id)}
                            index={index}
                            isDragDisabled={bloqueado}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setPedidoSelecionado(pedido)}
                                style={{
                                  background: '#f9fafb',
                                  borderRadius: 12,
                                  padding: 16,
                                  marginBottom: 12,
                                  cursor: bloqueado ? 'default' : 'pointer',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                  opacity: bloqueado ? 0.7 : 1,
                                  border: '1px solid #e5e7eb',
                                  transition: 'all 0.2s ease',
                                  ...provided.draggableProps.style,
                                }}
                                onMouseEnter={(e) => {
                                  if (!bloqueado) {
                                    e.currentTarget.style.background = '#fff'
                                    e.currentTarget.style.boxShadow =
                                      '0 4px 12px rgba(0,0,0,0.12)'
                                    e.currentTarget.style.transform =
                                      'translateY(-2px)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!bloqueado) {
                                    e.currentTarget.style.background = '#f9fafb'
                                    e.currentTarget.style.boxShadow =
                                      '0 2px 6px rgba(0,0,0,0.08)'
                                    e.currentTarget.style.transform =
                                      'translateY(0)'
                                  }
                                }}
                              >
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 16,
                                    marginBottom: 8,
                                    color: '#1a1a1a',
                                  }}
                                >
                                  {pedido.cliente}
                                </div>

                                <div
                                  style={{
                                    fontSize: 13,
                                    color: '#666',
                                    marginBottom: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                  }}
                                >
                                  <div>
                                    📦 {pedido.tipoentrega ?? 'retirada'}
                                  </div>
                                  <div>
                                    💳 {pedido.formapagamento ?? '-'}
                                  </div>
                                </div>

                                <div
                                  style={{
                                    marginTop: 12,
                                    paddingTop: 12,
                                    borderTop: '1px solid #e5e7eb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div>
                                    <strong
                                      style={{
                                        fontSize: 18,
                                        color: '#c0392b',
                                        fontWeight: 700,
                                      }}
                                    >
                                      R$ {pedido.total.toFixed(2)}
                                    </strong>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: '#999',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-end',
                                    }}
                                  >
                                    <span>🕒 {hora}</span>
                                    <span>#{pedido.id}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        )
                      })
                    )}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      {/* =======================
          MODAL DETALHES
      ======================= */}
      {pedidoSelecionado && (
        <div
          onClick={() => setPedidoSelecionado(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 32,
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'scaleIn 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '2px solid #f3f4f6',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1a1a1a',
                }}
              >
                Pedido #{pedidoSelecionado.id}
              </h2>
              <button
                onClick={() => setPedidoSelecionado(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  marginBottom: 12,
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                Itens
              </h3>
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16 }}>
                {pedidoSelecionado.itens.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom:
                        idx < pedidoSelecionado.itens.length - 1
                          ? '1px solid #e5e7eb'
                          : 'none',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.nome}</span>
                    <span style={{ color: '#666' }}>
                      R$ {item.preco.toFixed(2)}
                      {item.quantidade && item.quantidade > 1
                        ? ` x${item.quantidade}`
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <InfoItem
                label="Cliente"
                value={pedidoSelecionado.cliente}
              />
              <InfoItem
                label="Tipo de Entrega"
                value={pedidoSelecionado.tipoentrega ?? 'retirada'}
              />
              {pedidoSelecionado.tipoentrega === 'entrega' && (
                <InfoItem
                  label="Endereço"
                  value={pedidoSelecionado.endereco ?? '-'}
                />
              )}
              <InfoItem
                label="Forma de Pagamento"
                value={pedidoSelecionado.formapagamento ?? '-'}
              />
              {pedidoSelecionado.troco && (
                <InfoItem
                  label="Troco"
                  value={`R$ ${Number(pedidoSelecionado.troco).toFixed(2)}`}
                />
              )}
            </div>

            <div
              style={{
                padding: 20,
                background: '#f9fafb',
                borderRadius: 12,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 8,
                }}
              >
                Total
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#c0392b',
                }}
              >
                R$ {pedidoSelecionado.total.toFixed(2)}
              </div>
            </div>

            <button
              onClick={() => setPedidoSelecionado(null)}
              style={{
                marginTop: 24,
                width: '100%',
                padding: 14,
                borderRadius: 8,
                border: 'none',
                background: '#c0392b',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#a93226'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#c0392b'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            transform: scale(0.95);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#f9fafb',
        padding: 12,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#666',
          marginBottom: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#1a1a1a',
        }}
      >
        {value}
      </div>
    </div>
  )
}
