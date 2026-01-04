import { useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

export function useAdminNotifications(isAdmin: boolean) {
  useEffect(() => {
    if (!isAdmin) return

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        () => {
          const audio = new Audio('/notification.mp3')
          audio.play().catch(() => {})
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAdmin])
}