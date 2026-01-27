import { supabase } from './supabaseClient'

export type ProdutoDisponibilidade = {
  id: number
  categoria: string
  tipo: string
  sabor: string
  disponivel: boolean
  criado_em: string
  atualizado_em: string
}

export async function listarProdutosDisponiveisPorCategoriaTipo(
  categoria: string,
  tipo: string
): Promise<ProdutoDisponibilidade[]> {
  const { data, error } = await supabase
    .from('produtos_disponibilidade')
    .select('*')
    .eq('categoria', categoria)
    .eq('tipo', tipo)
    .eq('disponivel', true)
    .order('sabor', { ascending: true })

  if (error) throw error
  return data as ProdutoDisponibilidade[]
}

export async function atualizarDisponibilidadeProduto(
  id: number,
  disponivel: boolean
): Promise<void> {
  const { error } = await supabase
    .from('produtos_disponibilidade')
    .update({ disponivel })
    .eq('id', id)
  if (error) throw error
}
