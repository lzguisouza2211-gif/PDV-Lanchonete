import { supabase } from '../../services/supabaseClient'
function IngredientesIndisponiveisPanel() {

  const [ingredientes, setIngredientes] = useState<{ ingrediente: string, indisponivel: boolean }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchIngredientes = async () => {
      setLoading(true)
      // Busca todos os ingredientes possíveis (pode ser de outra tabela, ajuste conforme necessário)
      // Aqui, para exemplo, busca todos da tabela ingredientes_indisponiveis_dia de hoje e faz merge
      const today = new Date().toISOString().slice(0, 10)
      // Busca todos os ingredientes marcados como indisponíveis hoje
      const { data: indisponiveis, error: errIndisp } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .select('ingrediente')
        .eq('valid_on', today)
      // Aqui você pode buscar a lista completa de ingredientes do seu cardápio para exibir todos
      // Exemplo: const todosIngredientes = await ingredientesService.getTodosIngredientes()
      // Para exemplo, vamos supor uma lista fixa:
      const todosIngredientes = [
        'Alface', 'Tomate', 'Queijo', 'Presunto', 'Bacon', 'Ovo', 'Maionese', 'Frango', 'Carne', 'Calabresa'
      ]
      const indisponiveisSet = new Set((indisponiveis || []).map((i: any) => i.ingrediente))
      setIngredientes(todosIngredientes.map(ing => ({ ingrediente: ing, indisponivel: indisponiveisSet.has(ing) })))
      setLoading(false)
    }
    fetchIngredientes()
  }, [])

  const toggleIndisponivel = async (ingrediente: string, atual: boolean) => {
    const today = new Date().toISOString().slice(0, 10)
    if (!atual) {
      // Marcar como indisponível: upsert na tabela do dia, sempre setando indisponivel: true
      await supabase
        .from('ingredientes_indisponiveis_dia')
        .upsert([{ ingrediente, valid_on: today, indisponivel: true }], { onConflict: 'ingrediente,valid_on' })
    } else {
      // Marcar como disponível: remover da tabela do dia
      await supabase
        .from('ingredientes_indisponiveis_dia')
        .delete()
        .eq('ingrediente', ingrediente)
        .eq('valid_on', today)
    }
    // Atualiza estado local
    setIngredientes(ingredientes =>
      ingredientes.map(i =>
        i.ingrediente === ingrediente ? { ...i, indisponivel: !atual } : i
      )
    )
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <h3>Ingredientes indisponíveis</h3>
      {loading ? <p>Carregando...</p> : (
        <ul>
          {ingredientes.map(i => (
            <li key={i.ingrediente} style={{ marginBottom: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={i.indisponivel}
                  onChange={() => toggleIndisponivel(i.ingrediente, i.indisponivel)}
                />
                {i.ingrediente}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
import { useEffect, useState, useMemo } from 'react'
import usePedidos from '../../hooks/usePedidos'
import { Pedido } from '../../services/api/pedidos.service'
import { useStoreStatus } from '../../hooks/useStoreStatus'
import { storeStatusService } from '../../services/storeStatus'
import OrderMonitor from '../../components/admin/OrderMonitor'
import QuickMenuManagement from '../../components/admin/QuickMenuManagement'
import PrintQueueMonitor from '../../components/admin/PrintQueueMonitor'

export default function Dashboard() {
  const { listPedidos, loading, error } = usePedidos()
  const { isOpen } = useStoreStatus()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [tempoEsperaDia, setTempoEsperaDia] = useState<number>(40)
  const [savingTempo, setSavingTempo] = useState(false)
  const [mostrarSucesso, setMostrarSucesso] = useState(false)

  const [editingTempo, setEditingTempo] = useState(false)
  useEffect(() => {
    const load = async () => {
      const data = await listPedidos()
      setPedidos(data)
      
      // Busca tempo de espera do dia
      const status = await storeStatusService.getStatus()
      if (status?.tempo_espera_padrao && !editingTempo) {
        setTempoEsperaDia(status.tempo_espera_padrao)
      }
    }
    load()
  }, [listPedidos])

  // Atualização em tempo real a cada 2s do tempo de espera
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const status = await storeStatusService.getStatus()
        if (status?.tempo_espera_padrao && !editingTempo) {
          setTempoEsperaDia(status.tempo_espera_padrao)
        }
      } catch (e) {
        // silenciar erros de polling
      }
    }, 2000)
    return () => clearInterval(id)
  }, [editingTempo])

  const handleUpdateTempo = async () => {
    setSavingTempo(true)
    const sucesso = await storeStatusService.updateTempoEspera(tempoEsperaDia)
    setSavingTempo(false)
    
    if (sucesso) {
      setMostrarSucesso(true)
      setEditingTempo(false)
      setTimeout(() => setMostrarSucesso(false), 2000)
    } else {
      alert('❌ Erro ao atualizar tempo')
    }
  }

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
      {/* <IngredientesIndisponiveisPanel /> */}
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
          titulo=" Faturamento do Dia"
          valor={`R$ ${faturamento.toFixed(2)}`}
          cor="#c0392b"
          icone="💰"
        />
        <FinanceCard
          titulo=" Pedidos Hoje"
          valor={totalPedidos}
          cor="#3498db"
          icone="📦"
        />
        <FinanceCard
          titulo=" Entregas"
          valor={entregas}
          cor="#e67e22"
          icone="🚚"
        />
        <FinanceCard
          titulo=" Retiradas"
          valor={retiradas}
          cor="#9b59b6"
          icone="🏪"
        />
      </div>

      {/* TEMPO DE ESPERA DO DIA */}
      <div style={{ 
        background: '#fff', 
        padding: 24, 
        borderRadius: 16, 
        boxShadow: '0 4px 12px rgba(0,0,0,.1)',
        marginBottom: 32 
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>
          ⏱️ Tempo de Espera do Dia
        </h3>
        <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#666' }}>
          Define o tempo estimado que será exibido no cardápio e nas mensagens WhatsApp
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="number"
            min="10"
            step="5"
            value={tempoEsperaDia}
            onChange={(e) => setTempoEsperaDia(parseInt(e.target.value))}
            onFocus={() => setEditingTempo(true)}
            onBlur={() => setTimeout(() => setEditingTempo(false), 100)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              width: '100px',
              fontSize: 16,
            }}
          />
          <span style={{ fontSize: 16, color: '#666' }}>minutos</span>
          <button
            onClick={handleUpdateTempo}
            disabled={savingTempo}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: savingTempo ? '#95a5a6' : '#27ae60',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: savingTempo ? 'not-allowed' : 'pointer',
            }}
          >
            {savingTempo ? '⏳ Salvando...' : '✅ Salvar'}
          </button>
        </div>

        {mostrarSucesso && (
          <div style={{
            marginTop: 12,
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 8,
            color: '#166534',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'slideDown 0.3s ease',
          }}>
            <span>✨</span>
            Tempo atualizado com sucesso!
          </div>
        )}
      </div>

      {/* MONITOR DE FILA DE IMPRESSÃO */}
      <div style={{ marginBottom: 32 }}>
        <PrintQueueMonitor />
      </div>

      {/* MONITOR DE PEDIDOS */}
      <div style={{ marginBottom: 32 }}>
        <OrderMonitor pedidos={pedidosDoDia} />
      </div>

      {/* GESTÃO RÁPIDA DE CARDÁPIO */}
      <div>
        <QuickMenuManagement />
      </div>

      {/* CSS local para animações */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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
        padding: 20,
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        cursor: 'default',
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
        <span style={{ fontSize: 28 }}>{icone}</span>
        <span
          style={{
            fontSize: 14,
            color: '#666',
            fontWeight: 500,
            lineHeight: 1.3,
          }}
        >
          {titulo}
        </span>
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
