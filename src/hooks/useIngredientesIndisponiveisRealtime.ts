import { useEffect, useState, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import { cardapioService } from '../services/api/cardapio.service'
import { logger } from '../services/logger/logger'

/**
 * Hook que mantém sincronizado a lista de ingredientes indisponíveis
 * - Tenta usar realtime first
 * - Fallback para polling a cada 5 segundos
 */
export function useIngredientesIndisponiveisRealtime(
  onUpdate: (mapa: Record<string, string[]>) => void
) {
  const [isRealtime, setIsRealtime] = useState(false)
  const onUpdateRef = useRef(onUpdate)

  // Mantém a referência atualizada sem causar re-render
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    // Carrega inicial
    const loadInitial = async () => {
      try {
        const mapa = await cardapioService.listarIngredientesIndisponiveisHoje()
        onUpdateRef.current(mapa)
      } catch (err) {
        logger.error('Erro ao carregar ingredientes indisponíveis:', err)
      }
    }

    loadInitial()

    // Tenta realtime
    let realtimeWorking = false
    const channel = supabase
      .channel('pdv-ingredientes-indisponiveis-rt')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ingredientes_indisponiveis_dia',
        },
        async (payload) => {
          logger.info('📡 Realtime ativado! Evento recebido:', payload)
          realtimeWorking = true
          setIsRealtime(true)

          const hoje = new Date().toISOString().split('T')[0]
          const row = (payload.new || payload.old) as any

          if (row && String(row.valid_on).split('T')[0] === hoje) {
            try {
              const mapa = await cardapioService.listarIngredientesIndisponiveisHoje()
              onUpdateRef.current(mapa)
            } catch (err) {
              logger.error('Erro ao atualizar realtime:', err)
            }
          }
        }
      )
      .subscribe()

    // Polling fallback a cada 5 segundos
    const pollInterval = setInterval(async () => {
      if (realtimeWorking) return // Se realtime funcionando, não faz polling

      try {
        const mapa = await cardapioService.listarIngredientesIndisponiveisHoje()
        onUpdateRef.current(mapa)
      } catch (err) {
        logger.error('Erro no polling de ingredientes:', err)
      }
    }, 5000)

    // Após 10 segundos sem evento realtime, ativa polling
    const realtimeTimeout = setTimeout(() => {
      if (!realtimeWorking) {
        logger.warn(
          '⏱️ Realtime não respondeu em 10s. Usando polling como fallback.'
        )
        setIsRealtime(false)
      }
    }, 10000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(realtimeTimeout)
      supabase.removeChannel(channel)
    }
  }, [])

  return { isRealtime }
}
