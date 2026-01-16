import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { cardapioService } from '../services/api/cardapio.service'

/**
 * Hook que mantém sincronizado a disponibilidade dos produtos
 * - Tenta usar realtime first
 * - Fallback para polling a cada 5 segundos
 */
export function useProdutosDisponibilidadeRealtime(
  onUpdate: (itens: any[]) => void
) {
  const [isRealtime, setIsRealtime] = useState(false)

  useEffect(() => {
    // Carrega inicial
    const loadInitial = async () => {
      try {
        const itens = await cardapioService.list()
        onUpdate(itens)
        console.log('✅ Cardápio carregado inicialmente:', itens.length, 'itens')
      } catch (err) {
        console.error('Erro ao carregar cardápio:', err)
      }
    }

    loadInitial()

    // Tenta realtime
    let realtimeWorking = false
    const channel = supabase
      .channel('pdv-produtos-disponibilidade-rt')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cardapio',
        },
        async (payload: any) => {
          console.log('📡 Evento realtime de produto recebido:', {
            event: payload.eventType,
            id: payload.new?.id || payload.old?.id,
            nome: payload.new?.nome || payload.old?.nome,
            disponivel: payload.new?.disponivel,
          })
          realtimeWorking = true
          setIsRealtime(true)

          try {
            const itens = await cardapioService.list()
            onUpdate(itens)
            console.log('✅ Cardápio sincronizado via realtime')
          } catch (err) {
            console.error('Erro ao atualizar realtime de produtos:', err)
          }
        }
      )
      .subscribe()

    // Polling fallback a cada 5 segundos
    const pollInterval = setInterval(async () => {
      if (realtimeWorking) return // Se realtime funcionando, não faz polling

      try {
        const itens = await cardapioService.list()
        onUpdate(itens)
        console.log('⏱️ Cardápio sincronizado via polling')
      } catch (err) {
        console.error('Erro no polling de produtos:', err)
      }
    }, 5000)

    // Após 10 segundos sem evento realtime, ativa polling
    const realtimeTimeout = setTimeout(() => {
      if (!realtimeWorking) {
        console.warn(
          '⏱️ Realtime de produtos não respondeu em 10s. Usando polling como fallback.'
        )
        setIsRealtime(false)
      }
    }, 10000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(realtimeTimeout)
      supabase.removeChannel(channel)
    }
  }, [onUpdate])

  return { isRealtime }
}
