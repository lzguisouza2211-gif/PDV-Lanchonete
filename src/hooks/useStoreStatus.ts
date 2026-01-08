import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { storeStatusService, StoreStatus } from '../services/storeStatus'

export function useStoreStatus() {
  const [status, setStatus] = useState<StoreStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatus()

    // Realtime subscription - igual ao padrão de pedidos
    const channel = supabase
      .channel('store-status-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'store_status',
        },
        (payload) => {
          const updated = payload.new as StoreStatus
          if (updated.id === 1) {
            setStatus(updated)
            setLoading(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const data = await storeStatusService.getStatus()
      setStatus(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar status')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (isOpen: boolean) => {
    try {
      // Atualização otimista - igual ao padrão de pedidos
      if (status) {
        setStatus({
          ...status,
          is_open: isOpen,
          updated_at: new Date().toISOString(),
        })
      }
      
      const success = await storeStatusService.toggleStatus(isOpen)
      
      // Se falhar, reverter
      if (!success && status) {
        setStatus(status)
      }
      
      return success
    } catch (err: any) {
      // Reverter em caso de erro
      if (status) {
        setStatus(status)
      }
      setError(err.message || 'Erro ao atualizar status')
      return false
    }
  }

  return {
    status,
    isOpen: status?.is_open ?? false,
    loading,
    error,
    toggleStatus,
    refresh: loadStatus,
  }
}

