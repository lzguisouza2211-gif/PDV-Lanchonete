/**
 * Hook para gerenciar impressão de pedidos
 */

import { useCallback, useState } from 'react'
import { Pedido } from '../services/api/pedidos.service'
import { elginPrinter } from '../services/printer/elginPrinter'
import { printQueue } from '../services/printer/printQueue'

interface PrintStatus {
  isLoading: boolean
  error: string | null
  lastPrintedId: number | null
  queueSize: number
}

export function usePrinter() {
  const [status, setStatus] = useState<PrintStatus>({
    isLoading: false,
    error: null,
    lastPrintedId: null,
    queueSize: 0,
  })

  /**
   * Imprime ticket de produção
   */
  const printProducao = useCallback(async (pedido: Pedido) => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }))

    try {
      const content = elginPrinter.generateCupomFiscalFake(pedido)
      await printQueue.addJob('producao', { pedido, content }, 3)

      setStatus((s) => ({
        ...s,
        isLoading: false,
        lastPrintedId: pedido.id,
      }))

      return true
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao imprimir completo'
      setStatus((s) => ({
        ...s,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [])

  /**
   * Imprime ticket de motoboy (entrega)
   */
  const printMotoboy = useCallback(async (pedido: Pedido) => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }))

    try {
      const content = elginPrinter.generateMotoboy(pedido)
      await printQueue.addJob('motoboy', { pedido, content }, 3)

      setStatus((s) => ({
        ...s,
        isLoading: false,
        lastPrintedId: pedido.id,
      }))

      return true
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao imprimir motoboy'
      setStatus((s) => ({
        ...s,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [])

  /**
   * Imprime ticket completo
   */
  const printCompleto = useCallback(async (pedido: Pedido) => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }))

    try {
      const content = elginPrinter.generateCompleto(pedido)
      await printQueue.addJob('producao', { pedido, content }, 3)

      setStatus((s) => ({
        ...s,
        isLoading: false,
        lastPrintedId: pedido.id,
      }))

      return true
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao imprimir'
      setStatus((s) => ({
        ...s,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [])

  /**
   * Limpa estado de erro
   */
  const clearError = useCallback(() => {
    setStatus((s) => ({ ...s, error: null }))
  }, [])

  return {
    printProducao,
    printMotoboy,
    printCompleto,
    status,
    clearError,
  }
}
