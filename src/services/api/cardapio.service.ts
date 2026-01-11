import { supabase } from '../supabaseClient'

export type ItemCardapio = {
  id: string
  nome: string
  preco: number
  categoria: string
  ativo: boolean
  descricao?: string
  ingredientes?: string[]
}

class CardapioService {
  async list(): Promise<ItemCardapio[]> {
    const { data, error } = await supabase
      .from('cardapio')
      .select('*')
      .eq('ativo', true)
      .order('ordem_categoria', { ascending: true })
      .order('nome', { ascending: true })

    if (error) {
      throw error
    }

    // Parse ingredientes JSON se existir
    return (data || []).map((item: any) => ({
      ...item,
      id: String(item.id),
      ingredientes: Array.isArray(item.ingredientes)
        ? item.ingredientes
        : typeof item.ingredientes === 'string'
        ? JSON.parse(item.ingredientes || '[]')
        : item.ingredientes || [],
    })) as ItemCardapio[]
  }
}

export const cardapioService = new CardapioService()