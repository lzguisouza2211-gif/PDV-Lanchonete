import { useEffect, useState } from 'react'
import { Pedido } from '../../services/api/pedidos.service'
import usePedidos from '../../hooks/usePedidos'
import { supabase } from '../../services/supabaseClient'

const COLUMNS = [
  { id: 'Recebido', title: 'Recebido', color: '#fff3cd', icon: '📥' },
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
     AVANÇAR STATUS
  ======================= */
  const avancarStatus = async (pedido: Pedido) => {
    const statusAtual = pedido.status ?? 'Recebido'
    
    let proximoStatus: string
    if (statusAtual === 'Recebido') {
      proximoStatus = 'Em preparo'
    } else if (statusAtual === 'Em preparo') {
      proximoStatus = 'Finalizado'
    } else {
      return // Já finalizado
    }

    const previousPedidos = pedidos

    // UI otimista
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedido.id ? { ...p, status: proximoStatus } : p
      )
    )

    try {
      const atualizado = await atualizarStatus(pedido.id, proximoStatus)

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? atualizado : p))
      )
    } catch (err: any) {
      console.error('Erro ao atualizar status do pedido', err)
      setPedidos(previousPedidos)

      const mensagemErro = err?.message || 'Erro ao atualizar status do pedido.'
      alert(`${mensagemErro}\nVerifique se está logado como admin.`)
    }
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))',
          gap: 16,
        }}
        className="kanban-grid"
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
            <div
              key={col.id}
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
                pedidosColuna.map((pedido) => {
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
                    <div
                      key={pedido.id}
                      style={{
                        background: '#f9fafb',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        opacity: bloqueado ? 0.7 : 1,
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        onClick={() => setPedidoSelecionado(pedido)}
                        style={{ cursor: 'pointer' }}
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
                          {pedido.troco && (
                            <div style={{ fontSize: 12, color: '#27ae60' }}>
                              💵 Troco: R$ {Number(pedido.troco).toFixed(2)}
                            </div>
                          )}
                        </div>
                        
                        {/* Itens com extras/observações */}
                        {pedido.itens && pedido.itens.length > 0 && (
                          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                            {pedido.itens.some((item: any) => 
                              (item.extras && item.extras.length > 0) || item.observacoes
                            ) && (
                              <div style={{ marginTop: 4 }}>
                                ✨ Personalizado
                              </div>
                            )}
                          </div>
                        )}

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

                      {/* Botão para avançar status */}
                      {!bloqueado && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            avancarStatus(pedido)
                          }}
                          style={{
                            width: '100%',
                            marginTop: 12,
                            padding: '10px 16px',
                            background: col.id === 'Recebido' ? '#3498db' : '#27ae60',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          {col.id === 'Recebido' ? '👨‍🍳 Iniciar preparo' : '✅ Finalizar'}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )
        })}
      </div>

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
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'scaleIn 0.2s ease',
              margin: '20px',
            }}
            className="pedido-modal"
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
                {pedidoSelecionado.itens.map((item: any, idx) => {
                  const precoBase = item.preco
                  const precoExtras = (item.extras || []).reduce((sum: number, extra: any) => {
                    return sum + (extra.tipo === 'add' ? extra.preco : 0)
                  }, 0)
                  const precoTotal = precoBase + precoExtras
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 0',
                        borderBottom:
                          idx < pedidoSelecionado.itens.length - 1
                            ? '1px solid #e5e7eb'
                            : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{item.nome}</span>
                        <span style={{ color: '#666', fontWeight: 600 }}>
                          R$ {precoTotal.toFixed(2)}
                          {item.quantidade && item.quantidade > 1
                            ? ` x${item.quantidade}`
                            : ''}
                        </span>
                      </div>
                      
                      {/* Extras */}
                      {item.extras && item.extras.length > 0 && (
                        <div style={{ marginTop: 6, marginBottom: 4 }}>
                          {item.extras
                            .filter((e: any) => e.tipo === 'add')
                            .map((extra: any, eIdx: number) => (
                              <div
                                key={eIdx}
                                style={{
                                  fontSize: 12,
                                  color: '#27ae60',
                                  marginBottom: 2,
                                  paddingLeft: 8,
                                }}
                              >
                                + {extra.nome} (+R$ {extra.preco.toFixed(2)})
                              </div>
                            ))}
                          {item.extras
                            .filter((e: any) => e.tipo === 'remove')
                            .map((extra: any, eIdx: number) => (
                              <div
                                key={eIdx}
                                style={{
                                  fontSize: 12,
                                  color: '#e74c3c',
                                  marginBottom: 2,
                                  paddingLeft: 8,
                                }}
                              >
                                - Sem {extra.nome}
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {/* Ingredientes Indisponíveis */}
                      {item.ingredientes_indisponiveis && item.ingredientes_indisponiveis.length > 0 && (
                        <div style={{ marginTop: 6, marginBottom: 4 }}>
                          {item.ingredientes_indisponiveis.map((ing: string, iIdx: number) => (
                            <div
                              key={iIdx}
                              style={{
                                fontSize: 12,
                                color: '#e74c3c',
                                marginBottom: 2,
                                paddingLeft: 8,
                                fontWeight: 600,
                              }}
                            >
                              − Sem {ing}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Observações */}
                      {item.observacoes && (
                        <div
                          style={{
                            fontSize: 12,
                            color: '#666',
                            fontStyle: 'italic',
                            marginTop: 4,
                            padding: 6,
                            background: '#fff',
                            borderRadius: 6,
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          📝 {item.observacoes}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 12,
                marginBottom: 24,
              }}
              className="info-grid"
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
                  label="Troco para"
                  value={`R$ ${Number(pedidoSelecionado.troco).toFixed(2)}`}
                />
              )}
            </div>
            
            {/* Informações Financeiras */}
            <div
              style={{
                background: '#f0f9ff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                border: '1px solid #bae6fd',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                💰 Informações Financeiras
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: '#666' }}>Subtotal:</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    R$ {pedidoSelecionado.total.toFixed(2)}
                  </span>
                </div>
                {pedidoSelecionado.troco && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: '#666' }}>Troco:</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#27ae60' }}>
                      R$ {Number(pedidoSelecionado.troco).toFixed(2)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid #bae6fd',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
                    Total a receber:
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#c0392b' }}>
                    R$ {pedidoSelecionado.total.toFixed(2)}
                  </span>
                </div>
              </div>
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
        
        @media (max-width: 768px) {
          .pedido-modal {
            padding: 20px !important;
            margin: 10px !important;
            max-height: 95vh !important;
          }
          
          .info-grid {
            grid-template-columns: 1fr !important;
          }
          
          .kanban-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
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
