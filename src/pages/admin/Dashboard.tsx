import { useEffect, useState } from 'react'
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

  // 📊 métricas do dia
  const faturamento = pedidos.reduce(
    (s, p) => s + Number(p.total ?? 0),
    0
  )

  const totalPedidos = pedidos.length
  const entregas = pedidos.filter(
    (p) => p.tipoentrega === 'entrega'
  ).length
  const retiradas = pedidos.filter(
    (p) => p.tipoentrega !== 'entrega'
  ).length

  const ultimosPedidos = [...pedidos]
    .sort((a, b) => b.id - a.id)
    .slice(0, 6)

  if (loading) return <p>Carregando dashboard...</p>
  if (error) return <p>Erro ao carregar dashboard</p>

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Card
          titulo="Faturamento"
          valor={`R$ ${faturamento.toFixed(2)}`}
        />
        <Card titulo="Pedidos" valor={totalPedidos} />
        <Card titulo="Entregas" valor={entregas} />
        <Card titulo="Retiradas" valor={retiradas} />
      </div>

      {/* ÚLTIMOS PEDIDOS */}
      <section>
        <h2 style={{ marginBottom: 12 }}>Últimos pedidos</h2>

        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          }}
        >
          {ultimosPedidos.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <div>
                <strong>{p.cliente}</strong>
                <div style={{ fontSize: 13, color: '#555' }}>
                  {p.tipoentrega ?? 'retirada'} ·{' '}
                  {p.formapagamento ?? '-'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <strong>
                  R$ {Number(p.total ?? 0).toFixed(2)}
                </strong>
                <div style={{ fontSize: 12, color: '#777' }}>
                  #{p.id}
                </div>
              </div>
            </div>
          ))}

          {ultimosPedidos.length === 0 && (
            <p>Nenhum pedido ainda hoje</p>
          )}
        </div>
      </section>
    </div>
  )
}

function Card({
  titulo,
  valor,
}: {
  titulo: string
  valor: string | number
}) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,.1)',
      }}
    >
      <div style={{ fontSize: 14, color: '#777' }}>
        {titulo}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>
        {valor}
      </div>
    </div>
  )
}