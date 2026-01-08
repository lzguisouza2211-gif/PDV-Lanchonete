import { createClient, SupabaseClient }  from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Supabase env vars not found')
}

export const supabase: SupabaseClient = createClient(url, key)
