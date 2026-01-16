import { supabase } from './supabaseClient'

export interface ProductAddon {
  id: number
  product_id: number
  nome: string
  preco: number
  tipo: 'add' | 'remove'
  ativo: boolean
  ordem: number
}

export const productAddonsService = {
  async getByProduct(productId: number): Promise<ProductAddon[]> {
    const { data, error } = await supabase
      .from('product_addons')
      .select('*')
      .eq('product_id', productId)
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .order('tipo', { ascending: true })

    if (error) {
      return []
    }

    return data || []
  },
}

