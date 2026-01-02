import { supabase } from '../supabaseClient'

export type ItemCardapio = {
  id: string
  nome: string
  preco: number
  categoria: string
  ativo: boolean
}

class CardapioService {
  async list(): Promise<ItemCardapio[]> {
    const { data, error } = await supabase
      .from('cardapio')
      .select('*')
      .eq('ativo', true)

    if (error) {
      throw error
    }

    return data as ItemCardapio[]
  }
}

export const cardapioService = new CardapioService()