import { useEffect, useMemo, useState } from 'react'
import usePedidos from '../../hooks/usePedidos'
import { pedidosService } from '../../services/api/pedidos.service'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

type Periodo = 'dia' | 'mes'

export default function Financeiro() {
  const { listPedidosPorData, fecharCaixa, loading, error } = usePedidos()

  const [periodo, setPeriodo] = useState<Periodo>('dia')
  const [data, setData] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )

  const [resumos, setResumos] = useState<any[]>([])
  const [itensVendidos, setItensVendidos] = useState<any[]>([])
  const [fechamentoRealizado, setFechamentoRealizado] = useState(false)

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

  // Carregar itens vendidos
  useEffect(() => {
    const loadItens = async () => {
      try {
        const start = periodo === 'dia' 
          ? new Date(data)
          : new Date(data + '-01')
        const end = new Date(start)
        if (periodo === 'dia') {
          end.setDate(end.getDate() + 1)
        } else {
          end.setMonth(end.getMonth() + 1)
        }

        const pedidos = await pedidosService.listByRange(
          start.toISOString(),
          end.toISOString()
        )

        // Carregar cardápio para obter categorias
        const { data: cardapio } = await import('../../services/supabaseClient').then(({ supabase }) =>
          supabase.from('cardapio').select('id,nome,categoria')
        )
        
        const categoriasMap: Record<string, string> = {}
        if (cardapio) {
          cardapio.forEach((p: any) => {
            categoriasMap[p.nome] = p.categoria || ''
          })
        }

        // Agrupar itens vendidos
        const itensMap: Record<string, { nome: string; categoria: string; quantidade: number; valor: number }> = {}
        
        pedidos.forEach((pedido) => {
          if (pedido.itens && Array.isArray(pedido.itens)) {
            pedido.itens.forEach((item: any) => {
              const nome = item.nome || item.nome
              const quantidade = item.quantidade || 1
              const preco = item.preco || 0
              const categoria = categoriasMap[nome] || 'Outros'
              
              if (!itensMap[nome]) {
                itensMap[nome] = { nome, categoria, quantidade: 0, valor: 0 }
              }
              itensMap[nome].quantidade += quantidade
              itensMap[nome].valor += preco * quantidade
            })
          }
        })

        // Ordenar: Lanches primeiro, depois por quantidade
        const categoriasOrder = ['Lanches', 'Bebidas', 'Acompanhamentos', 'Sobremesas', 'Outros']
        const itensArray = Object.values(itensMap)
          .sort((a, b) => {
            const catOrderA = categoriasOrder.indexOf(a.categoria)
            const catOrderB = categoriasOrder.indexOf(b.categoria)
            if (catOrderA !== catOrderB) {
              return catOrderA - catOrderB
            }
            return b.quantidade - a.quantidade
          })
          .slice(0, 20) // Top 20 itens

        setItensVendidos(itensArray)
      } catch (error) {
        console.error('Erro ao carregar itens:', error)
      }
    }

    loadItens()
  }, [periodo, data])

  /* =======================
     AGREGAÇÕES
  ======================= */
  const resumoGeral = useMemo(() => {
    return resumos.reduce(
      (acc, r) => {
        acc.faturamento += r.faturamento || 0
        acc.totalPedidos += r.totalPedidos || 0
        acc.pagamentos.pix.valor += r.pagamentos?.pix?.valor || 0
        acc.pagamentos.pix.quantidade += r.pagamentos?.pix?.quantidade || 0
        acc.pagamentos.dinheiro.valor += r.pagamentos?.dinheiro?.valor || 0
        acc.pagamentos.dinheiro.quantidade += r.pagamentos?.dinheiro?.quantidade || 0
        acc.pagamentos.cartao.valor += r.pagamentos?.cartao?.valor || 0
        acc.pagamentos.cartao.quantidade += r.pagamentos?.cartao?.quantidade || 0
        return acc
      },
      {
        faturamento: 0,
        totalPedidos: 0,
        pagamentos: {
          pix: { valor: 0, quantidade: 0 },
          dinheiro: { valor: 0, quantidade: 0 },
          cartao: { valor: 0, quantidade: 0 },
        },
      }
    )
  }, [resumos])

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 18, color: '#666' }}>Carregando financeiro...</p>
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
        <p style={{ margin: 0 }}>Erro ao carregar financeiro</p>
      </div>
    )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: 32, fontSize: 32, fontWeight: 700 }}>
        💰 Financeiro
      </h1>

      {/* CONTROLES */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as Periodo)}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 16,
            background: '#fff',
          }}
        >
          <option value="dia">📅 Dia</option>
          <option value="mes">📆 Mês</option>
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
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 16,
          }}
        />
      </div>

      {/* RESUMO PRINCIPAL */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <FinanceCard
          titulo="💰 Faturamento Total"
          valor={`R$ ${resumoGeral.faturamento.toFixed(2)}`}
          cor="#c0392b"
          icone="💰"
        />
        <FinanceCard
          titulo="📦 Total de Pedidos"
          valor={resumoGeral.totalPedidos}
          cor="#3498db"
          icone="📦"
        />
      </div>

      {/* RESUMO POR FORMA DE PAGAMENTO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <FinanceCard
          titulo="📱 PIX"
          valor={`R$ ${resumoGeral.pagamentos.pix.valor.toFixed(2)}`}
          subtitulo={`${resumoGeral.pagamentos.pix.quantidade} pedidos`}
          cor="#34d399"
          icone="📱"
        />
        <FinanceCard
          titulo="💵 Dinheiro"
          valor={`R$ ${resumoGeral.pagamentos.dinheiro.valor.toFixed(2)}`}
          subtitulo={`${resumoGeral.pagamentos.dinheiro.quantidade} pedidos`}
          cor="#fbbf24"
          icone="💵"
        />
        <FinanceCard
          titulo="💳 Cartão"
          valor={`R$ ${resumoGeral.pagamentos.cartao.valor.toFixed(2)}`}
          subtitulo={`${resumoGeral.pagamentos.cartao.quantidade} pedidos`}
          cor="#8b5cf6"
          icone="💳"
        />
      </div>

      {/* GRÁFICO */}
      {periodo === 'mes' && resumos.length > 0 && (
        <div
          style={{
            background: '#fff',
            padding: 32,
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,.1)',
            marginBottom: 40,
          }}
        >
          <h3 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
            📊 Faturamento Diário
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={resumos}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="data"
                tick={{ fill: '#666', fontSize: 12 }}
                label={{
                  value: 'Dia do Mês',
                  position: 'insideBottom',
                  offset: -5,
                  style: { fill: '#666', fontSize: 14 },
                }}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 12 }}
                label={{
                  value: 'Valor (R$)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#666', fontSize: 14 },
                }}
                tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
              />
              <Tooltip
                formatter={(value: any) => [
                  `R$ ${Number(value).toFixed(2)}`,
                  'Faturamento',
                ]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                }}
              />
              <Bar
                dataKey="faturamento"
                fill="#c0392b"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ITENS VENDIDOS */}
      {itensVendidos.length > 0 && (
        <div
          style={{
            background: '#fff',
            padding: 32,
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,.1)',
            marginBottom: 40,
          }}
        >
          <h3 style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
            🍔 Itens Mais Vendidos
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      fontWeight: 600,
                      color: '#666',
                      fontSize: 14,
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '12px',
                      fontWeight: 600,
                      color: '#666',
                      fontSize: 14,
                    }}
                  >
                    Quantidade
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      padding: '12px',
                      fontWeight: 600,
                      color: '#666',
                      fontSize: 14,
                    }}
                  >
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {itensVendidos.map((item, index) => (
                  <tr
                    key={item.nome}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 500 }}>
                      {index + 1}. {item.nome}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        color: '#666',
                      }}
                    >
                      {item.quantidade}x
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: '#c0392b',
                      }}
                    >
                      R$ {item.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FECHAMENTO */}
      <div
        style={{
          padding: 32,
          background: '#f9fafb',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          border: '2px solid #e5e7eb',
        }}
      >
        <h3 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>
          🏁 Fechamento de Caixa
        </h3>

        {!fechamentoRealizado && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '8px 0', fontSize: 16 }}>
              <strong>Período:</strong>{' '}
              {periodo === 'dia'
                ? new Date(data).toLocaleDateString('pt-BR')
                : new Date(data + '-01').toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
            </p>
            <p style={{ margin: '8px 0', fontSize: 16 }}>
              <strong>Total:</strong>{' '}
              <span style={{ fontSize: 20, color: '#c0392b', fontWeight: 700 }}>
                R$ {resumoGeral.faturamento.toFixed(2)}
              </span>
            </p>
          </div>
        )}

        {fechamentoRealizado && (
          <div
            style={{
              padding: 20,
              background: '#d1e7dd',
              borderRadius: 12,
              marginBottom: 20,
              border: '2px solid #86efac',
            }}
          >
            <p style={{ margin: 0, fontSize: 16, color: '#166534', fontWeight: 600 }}>
              ✅ Caixa fechado com sucesso!
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#166534' }}>
              O fechamento foi registrado. Você pode fechar novamente se necessário.
            </p>
          </div>
        )}

        <button
          onClick={async () => {
            const confirmacao = window.confirm(
              `Confirmar fechamento de caixa para o período selecionado?\n\n` +
                `📅 Período: ${
                  periodo === 'dia'
                    ? new Date(data).toLocaleDateString('pt-BR')
                    : new Date(data + '-01').toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric',
                      })
                }\n` +
                `💰 Total: R$ ${resumoGeral.faturamento.toFixed(2)}\n` +
                `📦 Pedidos: ${resumoGeral.totalPedidos}`
            )

            if (!confirmacao) return

            const resultado = await fecharCaixa({
              data: periodo === 'dia' ? data : data.slice(0, 7) + '-01',
              periodo,
              total: resumoGeral.faturamento,
              totalPedidos: resumoGeral.totalPedidos,
              pagamentos: resumoGeral.pagamentos,
            })

            if (resultado.sucesso) {
              // Limpar formulário e esconder valor
              setFechamentoRealizado(true)
              // Resetar após 3 segundos para permitir novo fechamento se necessário
              setTimeout(() => {
                setFechamentoRealizado(false)
              }, 3000)
            } else {
              alert(`❌ ${resultado.mensagem}\n\nVerifique o console para mais detalhes.`)
            }
          }}
          disabled={loading || fechamentoRealizado}
          style={{
            padding: '14px 28px',
            background: loading ? '#95a5a6' : '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 16,
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#15803d'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#16a34a'
            }
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  animation: 'spin 1s linear infinite',
                }}
              >
                ⏳
              </span>
              Fechando...
            </>
          ) : (
            '✅ Fechar Caixa'
          )}
        </button>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
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
  subtitulo,
  cor,
  icone,
}: {
  titulo: string
  valor: string | number
  subtitulo?: string
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
      {subtitulo && (
        <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#999' }}>
          {subtitulo}
        </p>
      )}
    </div>
  )
}
