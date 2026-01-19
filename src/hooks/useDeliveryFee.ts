import { useEffect, useState } from 'react'
import { deliveryFeeService } from '../services/api/deliveryFee.service'

/**
 * Hook para gerenciar a taxa de entrega
 */
export function useDeliveryFee() {
  const [taxaEntrega, setTaxaEntrega] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTaxaEntrega()
  }, [])

  const fetchTaxaEntrega = async () => {
    try {
      const taxa = await deliveryFeeService.getDeliveryFee()
      setTaxaEntrega(taxa)
    } catch (error) {
      console.error('Erro ao buscar taxa de entrega:', error)
      setTaxaEntrega(0)
    } finally {
      setLoading(false)
    }
  }

  const atualizarTaxaEntrega = async (novoValor: number) => {
    try {
      const sucesso = await deliveryFeeService.updateDeliveryFee(novoValor)
      if (sucesso) {
        setTaxaEntrega(novoValor)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao atualizar taxa de entrega:', error)
      return false
    }
  }

  return {
    taxaEntrega,
    loading,
    fetchTaxaEntrega,
    atualizarTaxaEntrega,
  }
}
