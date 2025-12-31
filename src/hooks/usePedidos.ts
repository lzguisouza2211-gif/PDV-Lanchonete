import { useCallback, useState } from 'react'
import pedidosService, { Pedido } from '../services/api/pedidos.service'

type UsePedidosReturn = {
  listPedidos: () => Promise<Pedido[]>
  criarPedido: (p: Omit<Pedido, 'id'>) => Promise<Pedido | null>
  atualizarStatus: (id: number, status: string) => Promise<boolean>
  loading: boolean
  error: Error | null
}

export function usePedidos(): UsePedidosReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const listPedidos = useCallback(async (): Promise<Pedido[]> => {
    setLoading(true)
    setError(null)
    try {
      const data = await pedidosService.list()
      return data
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const criarPedido = useCallback(async (p: Omit<Pedido, 'id'>): Promise<Pedido | null> => {
    setLoading(true)
    setError(null)
    try {
      const created = await pedidosService.create(p)
      return created
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const atualizarStatus = useCallback(async (id: number, status: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const ok = await pedidosService.updateStatus(id, status)
      return ok
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { listPedidos, criarPedido, atualizarStatus, loading, error }
}

export default usePedidos
