import { useEffect, useState } from 'react'
import { usePedidos } from '../../hooks/usePedidos'
import { Pedido } from '../../services/api/pedidos.service'

export default function Dashboard() {
  const { listPedidos, loading, error } = usePedidos()
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await listPedidos()
      setPedidos(data)
    }
    load()
  }, [listPedidos])

  // =======================
  // MÉTRICAS DO DIA
  // =======================
  const hoje = new Date().toDateString()

  const pedidosHoje = pedidos.filter((p: any) => {
    if (!p.created_at) return false
    return new Date(p.created_at).toDateString() === hoje
  })

  const totalHoje = pedidosHoje.reduce(
    (s, p) => s + Number(p.total || 0),
    0
  )

  const entregas = pedidosHoje.filter(
    (p) => p.tipoentrega === 'entrega'
  ).length

  const retiradas = pedidosHoje.filter(
    (p) => p.tipoentrega === 'retirada'
  ).length

  if (loading) return <p>Carregando dashboard...</p>
  if (error) return <p>Erro ao carregar dashboard</p>

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      {/* =======================
          CARDS PRINCIPAIS
      ======================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <StatCard
          title="Pedidos hoje"
          value={pedidosHoje.length}
          subtitle="Pedidos realizados hoje"
          color="#ffc107"
        />

        <StatCard
          title="Faturamento hoje"
          value={`R$ ${totalHoje.toFixed(2)}`}
          subtitle="Total bruto do dia"
          color="#28a745"
        />

        <StatCard
          title="Entregas"
          value={entregas}
          subtitle="Pedidos para entrega"
          color="#17a2b8"
        />

        <StatCard
          title="Retiradas"
          value={retiradas}
          subtitle="Pedidos para retirada"
          color="#6f42c1"
        />
      </div>

      {/* =======================
          ÚLTIMOS PEDIDOS
      ======================= */}
      <section>
        <h2 style={{ marginBottom: 12 }}>Últimos pedidos</h2>

        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {pedidos.length === 0 && (
            <div style={{ padding: 16, color: '#666' }}>
              Nenhum pedido encontrado.
            </div>
          )}

          {pedidos.slice(0, 6).map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #eee',
              }}
            >
              <div>
                <strong>{p.cliente}</strong>
                <div style={{ fontSize: 13, color: '#666' }}>
                  Status: {p.status}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <strong>R$ {p.total}</strong>
                <div style={{ fontSize: 12, color: '#999' }}>
                  #{p.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* =======================
   COMPONENTE CARD
======================= */
function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  color: string
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderTop: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 14, color: '#666' }}>{title}</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          margin: '8px 0',
        }}
      >
        {value}
      </div>

      <div style={{ fontSize: 12, color: '#999' }}>{subtitle}</div>
    </div>
  )
}