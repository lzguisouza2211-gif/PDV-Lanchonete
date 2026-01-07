import { useEffect, useMemo, useState } from 'react'
import usePedidos from '../../hooks/usePedidos'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

type Periodo = 'dia' | 'mes'

export default function Financeiro() {
  const { listPedidosPorData, loading, error } = usePedidos()

  const [periodo, setPeriodo] = useState<Periodo>('dia')
  const [data, setData] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )

  const [resumos, setResumos] = useState<any[]>([])

  /* =======================
     LOAD DADOS
  ======================= */
  useEffect(() => {
    const load = async () => {
      if (periodo === 'dia') {
        const r = await listPedidosPorData(data)
        setResumos([{ data, ...r }])
        return
      }

      const [ano, mes] = data.split('-')
      const diasNoMes = new Date(Number(ano), Number(mes), 0).getDate()

      const results = []
      for (let d = 1; d <= diasNoMes; d++) {
        const dia = `${ano}-${mes}-${String(d).padStart(2, '0')}`
        const r = await listPedidosPorData(dia)
        results.push({
          data: dia.slice(8),
          faturamento: r.faturamento,
        })
      }

      setResumos(results)
    }

    load()
  }, [periodo, data, listPedidosPorData])

  /* =======================
     AGREGAÇÕES
  ======================= */
  const resumoGeral = useMemo(() => {
    return resumos.reduce(
      (acc, r) => {
        acc.faturamento += r.faturamento || 0
        acc.totalPedidos += r.totalPedidos || 0
        acc.pagamentos.pix += r.pagamentos?.pix || 0
        acc.pagamentos.dinheiro += r.pagamentos?.dinheiro || 0
        acc.pagamentos.cartao += r.pagamentos?.cartao || 0
        return acc
      },
      {
        faturamento: 0,
        totalPedidos: 0,
        pagamentos: { pix: 0, dinheiro: 0, cartao: 0 },
      }
    )
  }, [resumos])

  if (loading) return <p>Carregando financeiro...</p>
  if (error) return <p>Erro ao carregar financeiro</p>

  return (
    <div style={{ maxWidth: 1200 }}>
      <h1>Financeiro</h1>

      {/* CONTROLES */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as Periodo)}
        >
          <option value="dia">Dia</option>
          <option value="mes">Mês</option>
        </select>

        <input
          type={periodo === 'dia' ? 'date' : 'month'}
          value={data.slice(0, periodo === 'dia' ? 10 : 7)}
          onChange={(e) =>
            setData(
              periodo === 'dia'
                ? e.target.value
                : `${e.target.value}-01`
            )
          }
        />
      </div>

      {/* RESUMO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Card titulo="Faturamento" valor={`R$ ${resumoGeral.faturamento.toFixed(2)}`} />
        <Card titulo="Pedidos" valor={resumoGeral.totalPedidos} />
        <Card titulo="PIX" valor={`R$ ${resumoGeral.pagamentos.pix.toFixed(2)}`} />
        <Card titulo="Dinheiro" valor={`R$ ${resumoGeral.pagamentos.dinheiro.toFixed(2)}`} />
      </div>

      {/* GRÁFICO */}
      {periodo === 'mes' && (
        <div
          style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,.1)',
            marginBottom: 40,
          }}
        >
          <h3 style={{ marginBottom: 16 }}>Faturamento diário</h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={resumos}>
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
              <Bar
                dataKey="faturamento"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* FECHAMENTO */}
      <div
        style={{
          padding: 24,
          background: '#f9fafb',
          borderRadius: 12,
          boxShadow: '0 2px 6px rgba(0,0,0,.05)',
        }}
      >
        <h3>Fechamento de Caixa</h3>

        <p>
          <strong>Período:</strong>{' '}
          {periodo === 'dia' ? data : data.slice(0, 7)}
        </p>

        <p>
          <strong>Total:</strong> R$ {resumoGeral.faturamento.toFixed(2)}
        </p>

        <button
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Fechar caixa
        </button>
      </div>
    </div>
  )
}

/* =======================
   COMPONENTE CARD
======================= */
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
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,.1)',
      }}
    >
      <p style={{ color: '#666' }}>{titulo}</p>
      <strong style={{ fontSize: 22 }}>{valor}</strong>
    </div>
  )
}