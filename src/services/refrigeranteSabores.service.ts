import { supabase } from './supabaseClient'

export async function listarSaboresRefrigerantePorTipo(tipo: string) {
  const { data, error } = await supabase
    .from('produtos_disponibilidade')
    .select('*')
    .eq('categoria', 'refrigerante')
    .eq('tipo', tipo)
    .eq('disponivel', true)
    .order('sabor', { ascending: true })
  if (error) throw error
  return data || []
}
