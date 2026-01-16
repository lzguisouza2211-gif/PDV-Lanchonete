import { useEffect, useRef } from 'react'
import RoutesApp from './routes'
import { supabase } from '../services/supabaseClient'

export default function App(): JSX.Element {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const unlockedRef = useRef(false)

  useEffect(() => {
    // cria o áudio UMA vez
    audioRef.current = new Audio('/notification.mp3')
    audioRef.current.volume = 1

    // 🔓 desbloqueio obrigatório do browser
    const unlockAudio = () => {
      if (!audioRef.current || unlockedRef.current) return

      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause()
          audioRef.current!.currentTime = 0
          unlockedRef.current = true
        })
        .catch(() => {})

      window.removeEventListener('click', unlockAudio)
    }

    window.addEventListener('click', unlockAudio)

    // 🔔 realtime GLOBAL (funciona mesmo fora do /admin)
    const channel = supabase
      .channel('pedidos-som-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        () => {
          if (!unlockedRef.current) return
          audioRef.current?.play().catch(() => {})
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('click', unlockAudio)
      supabase.removeChannel(channel)
    }
  }, [])

  return <RoutesApp />
}