import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export function useAdminAuth() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const userId = sessionData.session.user.id

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .eq('ativo', true)
        .single()

      setIsAdmin(!!admin)
      setLoading(false)
    }

    checkAdmin()
  }, [])

  return { loading, isAdmin }
}
