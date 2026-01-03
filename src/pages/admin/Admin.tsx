import { useEffect } from 'react'
import { Pedido } from '../../services/api/pedidos.service'
import { usePedidos } from '../../hooks/usePedidos'
import { usePedidosStore } from '../../store/usePedidosStore'

const STATUS_COLUNAS = ['Recebido', 'Em preparo', 'Finalizado'] as const

export default function Admin() {
  const { listPedidos, atualizarStatus, loading, error } = usePedidos()
  const { pedidos, setPedidos } = usePedidosStore()

  useEffect(() => {
    const load = async () => {
      const data = await listPedidos()
      setPedidos(data)
    }
    load()
  }, [listPedidos, setPedidos])

  if (loading) return <p>Carregando pedidos...</p>
  if (error) return <p>Erro ao carregar pedidos</p>

  return (
    <main style={{ padding: 16 }}>
      <h1>Painel de Pedidos</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 16,
        }}
      >
        {STATUS_COLUNAS.map((status) => (
          <div
            key={status}
            style={{
              background: '#f8f9fa',
              padding: 12,
              borderRadius: 8,
              minHeight: 400,
            }}
          >
            <h2 style={{ textAlign: 'center' }}>{status}</h2>

            {pedidos
              .filter((p) => (p.status ?? 'Recebido') === status)
              .map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  onChangeStatus={atualizarStatus}
                />
              ))}
          </div>
        ))}
      </div>
    </main>
  )
}

/* =========================
   CARD DO PEDIDO
========================= */
function PedidoCard({
  pedido,
  onChangeStatus,
}: {
  pedido: Pedido
  onChangeStatus: (id: number, status: string) => Promise<boolean>
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <p><strong>Cliente:</strong> {pedido.cliente}</p>
      <p><strong>Total:</strong> R$ {pedido.total}</p>
      <p><strong>Status:</strong> {pedido.status}</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {pedido.status !== 'Em preparo' && (
          <button onClick={() => onChangeStatus(pedido.id, 'Em preparo')}>
            Em preparo
          </button>
        )}

        {pedido.status !== 'Finalizado' && (
          <button onClick={() => onChangeStatus(pedido.id, 'Finalizado')}>
            Finalizar
          </button>
        )}
      </div>
    </div>
  )
}
