import { supabase } from './supabaseClient'

export async function listarSaboresDelValle() {
  const { data, error } = await supabase
    .from('produtos_disponibilidade')
    .select('*')
    .eq('categoria', 'del valle')
    .eq('disponivel', true)
    .order('sabor', { ascending: true })
  if (error) throw error
  return data || []
}
