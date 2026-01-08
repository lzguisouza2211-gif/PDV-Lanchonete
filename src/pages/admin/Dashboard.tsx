import { useEffect, useState, useMemo } from 'react'
import usePedidos from '../../hooks/usePedidos'
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

  // Filtrar apenas pedidos do dia atual
  const pedidosDoDia = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    return pedidos.filter((p) => {
      const dataPedido = (p as any).created_at || (p as any).data
      if (!dataPedido) return false
      const dataFormatada = new Date(dataPedido).toISOString().slice(0, 10)
      return dataFormatada === hoje
    })
  }, [pedidos])

  // 📊 métricas do dia
  const faturamento = pedidosDoDia.reduce(
    (s, p) => s + Number(p.total ?? 0),
    0
  )

  const totalPedidos = pedidosDoDia.length
  const entregas = pedidosDoDia.filter(
    (p) => p.tipoentrega === 'entrega'
  ).length
  const retiradas = pedidosDoDia.filter(
    (p) => p.tipoentrega !== 'entrega'
  ).length

  const ultimosPedidos = [...pedidosDoDia]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 18, color: '#666' }}>Carregando dashboard...</p>
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
        <p style={{ margin: 0 }}>Erro ao carregar dashboard</p>
      </div>
    )

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8, fontSize: 32, fontWeight: 700 }}>
          📊 Dashboard
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            color: '#666',
            textTransform: 'capitalize',
          }}
        >
          {hoje}
        </p>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <FinanceCard
          titulo="💰 Faturamento do Dia"
          valor={`R$ ${faturamento.toFixed(2)}`}
          cor="#c0392b"
          icone="💰"
        />
        <FinanceCard
          titulo="📦 Pedidos Hoje"
          valor={totalPedidos}
          cor="#3498db"
          icone="📦"
        />
        <FinanceCard
          titulo="🚚 Entregas"
          valor={entregas}
          cor="#e67e22"
          icone="🚚"
        />
        <FinanceCard
          titulo="🏪 Retiradas"
          valor={retiradas}
          cor="#9b59b6"
          icone="🏪"
        />
      </div>

      {/* ÚLTIMOS PEDIDOS */}
      <div
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,.1)',
        }}
      >
        <h2
          style={{
            marginBottom: 24,
            fontSize: 20,
            fontWeight: 600,
            color: '#1a1a1a',
          }}
        >
          📋 Últimos Pedidos de Hoje
        </h2>

        {ultimosPedidos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999',
            }}
          >
            <p style={{ fontSize: 16, margin: 0 }}>
              Nenhum pedido ainda hoje
            </p>
          </div>
        ) : (
          <div>
            {ultimosPedidos.map((p, index) => {
              const hora = (p as any).created_at
                ? new Date((p as any).created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom:
                      index < ultimosPedidos.length - 1
                        ? '1px solid #f3f4f6'
                        : 'none',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 16,
                        marginBottom: 4,
                        color: '#1a1a1a',
                      }}
                    >
                      {p.cliente}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#666',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <span>📦 {p.tipoentrega ?? 'retirada'}</span>
                      <span>•</span>
                      <span>💳 {p.formapagamento ?? '-'}</span>
                      <span>•</span>
                      <span>🕒 {hora}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#c0392b',
                        marginBottom: 4,
                      }}
                    >
                      R$ {Number(p.total ?? 0).toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#999',
                      }}
                    >
                      #{p.id}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* =======================
   COMPONENTE CARD FINANCEIRO
======================= */
function FinanceCard({
  titulo,
  valor,
  cor,
  icone,
}: {
  titulo: string
  valor: string | number
  cor: string
  icone: string
}) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 24,
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,.1)',
        borderTop: `4px solid ${cor}`,
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 24 }}>{icone}</span>
        <p style={{ margin: 0, color: '#666', fontSize: 14, fontWeight: 500 }}>
          {titulo}
        </p>
      </div>
      <strong
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: cor,
          display: 'block',
        }}
      >
        {valor}
      </strong>
    </div>
  )
}
