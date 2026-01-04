import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export function useAdminAuth() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError || !sessionData.session) {
          setIsAdmin(false)
          return
        }

        const userId = sessionData.session.user.id

        const { data: admin, error } = await supabase
          .from('admins')
          .select('id')
          .eq('user_id', userId)
          .eq('ativo', true)
          .maybeSingle()

        if (error) {
          console.error('Erro ao verificar admin:', error)
          setIsAdmin(false)
          return
        }

        setIsAdmin(!!admin)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  return { loading, isAdmin }
}
