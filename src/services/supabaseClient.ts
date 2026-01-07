import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = (process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined
const key = (process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) as string | undefined

let _supabase: SupabaseClient | any = null

if (url && key) {
	_supabase = createClient(url, key)
}
if (!url || !key) {
	throw new Error('Supabase env vars not found')
}


export const supabase = createClient(url, key)

