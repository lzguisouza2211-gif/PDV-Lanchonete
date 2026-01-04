import { useEffect, useState } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd'

import { Pedido } from '../../services/api/pedidos.service'
import { usePedidos } from '../../hooks/usePedidos'
import { supabase } from '../../services/supabaseClient'

const COLUMNS = [
  { id: 'Recebido', title: 'Recebido', color: '#fff3cd' },
  { id: 'confirmação', title: 'Confirmação', color: '#d1ecf1' },
  { id: 'Em preparo', title: 'Em preparo', color: '#cfe2ff' },
  { id: 'Finalizado', title: 'Finalizado', color: '#d1e7dd' },
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
    if (origem === 'Recebido' && destino === 'Finalizado') return
    if (origem === 'Confirmação' && destino === 'Recebido') return

    const pedidoId = Number(draggableId)

    // UI otimista
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === pedidoId ? { ...p, status: destino } : p
      )
    )

    await atualizarStatus(pedidoId, destino)
  }

  if (loading) return <p>Carregando pedidos...</p>
  if (error) return <p>Erro ao carregar pedidos</p>

  return (
    <main style={{ padding: 24, background: '#f4f5f7', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: 24 }}>Painel de Pedidos</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 20 }}>
          {COLUMNS.map((col) => {
            const pedidosColuna = pedidos.filter(
              (p) => (p.status ?? 'Recebido') === col.id
            )

            return (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1,
                      background: col.color,
                      borderRadius: 12,
                      padding: 12,
                      minHeight: 500,
                    }}
                  >
                    <h3 style={{ textAlign: 'center', marginBottom: 12 }}>
                      {col.title}
                    </h3>

                    {pedidosColuna.map((pedido, index) => {
                      const bloqueado = pedido.status === 'Finalizado'

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
                              onClick={() =>
                                setPedidoSelecionado(pedido)
                              }
                              style={{
                                background: '#fff',
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: 10,
                                cursor: 'pointer',
                                boxShadow:
                                  '0 2px 6px rgba(0,0,0,0.15)',
                                opacity: bloqueado ? 0.7 : 1,
                                ...provided.draggableProps.style,
                              }}
                            >
                              <p style={{ fontWeight: 600 }}>
                                {pedido.cliente}
                              </p>
                              <p>Total: R$ {pedido.total}</p>
                              <small>#{pedido.id}</small>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}

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
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2>Pedido #{pedidoSelecionado.id}</h2>

            <p><strong>Cliente:</strong> {pedidoSelecionado.cliente}</p>
            <p><strong>Status:</strong> {pedidoSelecionado.status}</p>
            <p><strong>Total:</strong> R$ {pedidoSelecionado.total}</p>

            {pedidoSelecionado.tipoentrega && (
              <p>
                <strong>Entrega:</strong> {pedidoSelecionado.tipoentrega}
              </p>
            )}

            {pedidoSelecionado.endereco && (
              <p>
                <strong>Endereço:</strong> {pedidoSelecionado.endereco}
              </p>
            )}

            {pedidoSelecionado.formapagamento && (
              <p>
                <strong>Pagamento:</strong>{' '}
                {pedidoSelecionado.formapagamento}
              </p>
            )}

            {pedidoSelecionado.troco && (
              <p>
                <strong>Troco:</strong> R$ {pedidoSelecionado.troco}
              </p>
            )}

            <h3 style={{ marginTop: 16 }}>Itens</h3>
            <ul>
              {pedidoSelecionado.itens.map((item, idx) => (
                <li key={idx}>
                  {item.nome} – R$ {item.preco}
                  {item.adicionais && item.adicionais.length > 0 && (
                    <ul>
                      {item.adicionais.map((ad, i) => (
                        <li key={i}>
                          + {ad.nome} (R$ {ad.preco})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <button
              style={{ marginTop: 16 }}
              onClick={() => setPedidoSelecionado(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  )
}