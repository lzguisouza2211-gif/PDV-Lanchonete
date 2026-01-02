import React, { useEffect } from 'react'
import Routes from './routes'
import { supabase } from '../services/supabaseClient'

export default function App(): JSX.Element {
  useEffect(() => {
    const ensureAuth = async () => {
      const { data } = await supabase.auth.getSession()

      if(!data.session) {
        await supabase.auth.signInAnonymously()
      }
    }

    ensureAuth()
  }, [])

  return <Routes />
}