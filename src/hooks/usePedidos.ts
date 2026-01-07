import { useCallback, useState } from 'react'
import { pedidosService,  Pedido } from '../services/api/pedidos.service'

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

        return {
          faturamento,
          totalPedidos: pedidos.length,
          pagamentos: {
            pix: pedidos.filter(p => p.formapagamento === 'pix').length,
            dinheiro: pedidos.filter(p => p.formapagamento === 'dinheiro').length,
            cartao: pedidos.filter(p => p.formapagamento === 'cartao').length,
          },
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const criarPedido = useCallback(
    async (pedido: Omit<Pedido, 'id'>) => {
      setLoading(true)
      setError(null)
      try {
        return await pedidosService.create(pedido)
      } catch (e: any) {
        setError(e)
        return false
      } finally {
        setLoading(false)
      }
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

  return {
    listPedidos,
    listPedidosPorData,
    criarPedido,
    atualizarStatus,
    loading,
    error,
  }
}