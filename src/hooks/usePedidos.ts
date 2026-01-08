import { useCallback, useState } from 'react'
import { pedidosService,  Pedido } from '../services/api/pedidos.service'
import { supabase } from '../services/supabaseClient'

export default function usePedidos() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const listPedidos = useCallback(async (): Promise<Pedido[]> => {
    setLoading(true)
    setError(null)
    try {
      return await pedidosService.list()
    } catch (e: any) {
      setError(e)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const listPedidosPorData = useCallback(
    async (data: string) => {
      setLoading(true)
      setError(null)

      try {
        const start = new Date(data)
        const end = new Date(data)
        end.setDate(end.getDate() + 1)

        const pedidos = await pedidosService.listByRange(
          start.toISOString(),
          end.toISOString()
        )

        const faturamento = pedidos.reduce(
          (s, p) => s + Number(p.total || 0),
          0
        )

        // Calcula valores totais por forma de pagamento
        const pagamentosPix = pedidos.filter(p => p.formapagamento === 'pix')
        const pagamentosDinheiro = pedidos.filter(p => p.formapagamento === 'dinheiro')
        const pagamentosCartao = pedidos.filter(p => p.formapagamento === 'cartao')

        return {
          faturamento,
          totalPedidos: pedidos.length,
          pagamentos: {
            pix: {
              quantidade: pagamentosPix.length,
              valor: pagamentosPix.reduce((s, p) => s + Number(p.total || 0), 0),
            },
            dinheiro: {
              quantidade: pagamentosDinheiro.length,
              valor: pagamentosDinheiro.reduce((s, p) => s + Number(p.total || 0), 0),
            },
            cartao: {
              quantidade: pagamentosCartao.length,
              valor: pagamentosCartao.reduce((s, p) => s + Number(p.total || 0), 0),
            },
          },
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const criarPedido = useCallback(
    async function criarPedido(pedido: any): Promise<boolean> {
      setLoading(true)
      setError(null)

      console.log('📤 Tentando criar pedido:', pedido)

      const { data, error } = await supabase
        .from('pedidos')
        .insert([pedido])
        .select()
        .single()

      console.log('🧪 Supabase response:', { data, error })

      if (error) {
        // ✅ Melhorar o log do erro
        console.error('❌ Erro detalhado:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        
        // ✅ Mostrar erro mais específico
        const errorMessage = error.message || 'Erro desconhecido ao criar pedido'
        setError(new Error(errorMessage))
        setLoading(false)
        return false
      }

      if (!data) {
        console.error('⚠️ Nenhum dado retornado do Supabase')
        setError(new Error('Pedido criado mas nenhum dado retornado'))
        setLoading(false)
        return false
      }

      console.log('✅ Pedido criado com sucesso:', data)
      setLoading(false)
      return true
    },
    []
  )

  const atualizarStatus = useCallback(
    async (id: number, status: string) => {
      setLoading(true)
      setError(null)
      try {
        return await pedidosService.updateStatus(id, status)
      } catch (e: any) {
        setError(e)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const fecharCaixa = useCallback(
    async (dados: {
      data: string
      periodo: 'dia' | 'mes'
      total: number
      totalPedidos: number
      pagamentos: {
        pix: { valor: number; quantidade: number }
        dinheiro: { valor: number; quantidade: number }
        cartao: { valor: number; quantidade: number }
      }
    }): Promise<{ sucesso: boolean; mensagem: string }> => {
      setLoading(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id ?? null

        // Formatar data corretamente (YYYY-MM-DD)
        let dataFormatada = dados.data
        if (dados.periodo === 'mes') {
          // Se for mês, usar primeiro dia do mês
          dataFormatada = dados.data.slice(0, 7) + '-01'
        } else {
          // Se for dia, garantir formato YYYY-MM-DD
          if (dataFormatada.length === 10) {
            // Já está no formato correto
          } else {
            // Tentar converter
            const date = new Date(dataFormatada)
            dataFormatada = date.toISOString().slice(0, 10)
          }
        }

        console.log('📊 Fechando caixa:', {
          data: dataFormatada,
          periodo: dados.periodo,
          total: dados.total,
          userId,
        })

        // Verificar se usuário está autenticado
        if (!userId) {
          const mensagemErro = 'Você precisa estar autenticado para fechar o caixa'
          setError(new Error(mensagemErro))
          setLoading(false)
          return { sucesso: false, mensagem: mensagemErro }
        }

        const payload = {
          data: dataFormatada,
          periodo: dados.periodo,
          total: dados.total,
          total_pedidos: dados.totalPedidos,
          pix_valor: dados.pagamentos.pix.valor,
          pix_quantidade: dados.pagamentos.pix.quantidade,
          dinheiro_valor: dados.pagamentos.dinheiro.valor,
          dinheiro_quantidade: dados.pagamentos.dinheiro.quantidade,
          cartao_valor: dados.pagamentos.cartao.valor,
          cartao_quantidade: dados.pagamentos.cartao.quantidade,
          created_by: userId,
        }

        console.log('📤 Payload do fechamento:', payload)

        const { data, error } = await supabase
          .from('fechamentos_caixa')
          .insert([payload])
          .select()
          .single()

        if (error) {
          console.error('❌ Erro ao fechar caixa:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })

          let mensagemErro = 'Erro ao registrar fechamento de caixa'
          if (error.code === 'PGRST116') {
            mensagemErro = 'Tabela fechamentos_caixa não encontrada. Execute a migration 007.'
          } else if (error.code === '42501') {
            mensagemErro = 'Sem permissão. Verifique se você é administrador.'
          } else if (error.message) {
            mensagemErro = error.message
          }

          setError(new Error(mensagemErro))
          setLoading(false)
          return { sucesso: false, mensagem: mensagemErro }
        }

        if (!data) {
          setError(new Error('Fechamento registrado mas nenhum dado retornado'))
          setLoading(false)
          return { sucesso: false, mensagem: 'Erro ao confirmar fechamento' }
        }

        console.log('✅ Fechamento de caixa registrado:', data)
        setLoading(false)
        return {
          sucesso: true,
          mensagem: 'Fechamento de caixa registrado com sucesso!',
        }
      } catch (e: any) {
        console.error('❌ Erro inesperado ao fechar caixa:', e)
        const mensagem = e.message || 'Erro inesperado ao fechar caixa'
        setError(new Error(mensagem))
        setLoading(false)
        return { sucesso: false, mensagem }
      }
    },
    []
  )

  return {
    listPedidos,
    listPedidosPorData,
    criarPedido,
    atualizarStatus,
    fecharCaixa,
    loading,
    error,
  }
}