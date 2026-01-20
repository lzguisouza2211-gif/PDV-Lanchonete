import { supabase } from '../supabaseClient'
import { ExtraOption } from '../../components/pdv/ProductCustomizationModal'

export interface Adicional {
  id: number
  product_id: number
  nome: string
  preco: number
  ativo: boolean
  ordem: number
  created_at: string
  updated_at: string
}

export interface RetirarIngred {
  id: number
  product_id: number
  nome: string
  ativo: boolean
  ordem: number
  created_at: string
  updated_at: string
}

export const ingredientesService = {
  // Obter ingredientes adicionáveis por produto
  async getAdicionaisPorProduto(productId: number): Promise<ExtraOption[]> {
    const { data, error } = await supabase
      .from('adicional')
      .select('*')
      .eq('product_id', productId)
      .eq('ativo', true)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao buscar adicionais:', error)
      return []
    }

    return (data || []).map((item) => ({
      id: String(item.id),
      nome: item.nome,
      preco: item.preco,
      tipo: 'add' as const,
    }))
  },

  // Obter ingredientes removíveis por produto
  async getRetirarPorProduto(productId: number): Promise<string[]> {
    const { data, error } = await supabase
      .from('retirar_ingred')
      .select('nome')
      .eq('product_id', productId)
      .eq('ativo', true)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao buscar removíveis:', error)
      return []
    }

    return (data || []).map((item) => item.nome)
  },

  // Obter todos os adicionais de um produto (incluindo inativos) - para admin
  async getAdicionaisAdminPorProduto(productId: number): Promise<Adicional[]> {
    const { data, error } = await supabase
      .from('adicional')
      .select('*')
      .eq('product_id', productId)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao buscar adicionais admin:', error)
      return []
    }

    return data || []
  },

  // Obter todos os removíveis de um produto (incluindo inativos) - para admin
  async getRetirarAdminPorProduto(productId: number): Promise<RetirarIngred[]> {
    const { data, error } = await supabase
      .from('retirar_ingred')
      .select('*')
      .eq('product_id', productId)
      .order('ordem', { ascending: true })

    if (error) {
      console.error('Erro ao buscar removíveis admin:', error)
      return []
    }

    return data || []
  },

  // Atualizar um adicional
  async atualizarAdicional(id: number, updates: Partial<Adicional>): Promise<Adicional | null> {
    const { data, error } = await supabase
      .from('adicional')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar adicional:', error)
      return null
    }

    return data
  },

  // Atualizar um removível
  async atualizarRetirar(id: number, updates: Partial<RetirarIngred>): Promise<RetirarIngred | null> {
    const { data, error } = await supabase
      .from('retirar_ingred')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar retirar:', error)
      return null
    }

    return data
  },

  // Criar um novo adicional
  async criarAdicional(productId: number, nome: string, preco: number): Promise<Adicional | null> {
    const { data, error } = await supabase
      .from('adicional')
      .insert([
        {
          product_id: productId,
          nome,
          preco,
          ativo: true,
          ordem: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar adicional:', error)
      return null
    }

    return data
  },

  // Criar um novo removível
  async criarRetirar(productId: number, nome: string): Promise<RetirarIngred | null> {
    const { data, error } = await supabase
      .from('retirar_ingred')
      .insert([
        {
          product_id: productId,
          nome,
          ativo: true,
          ordem: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar retirar:', error)
      return null
    }

    return data
  },

  // Excluir um adicional
  async excluirAdicional(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('adicional')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir adicional:', error)
      return false
    }

    return true
  },

  // Excluir um removível
  async excluirRetirar(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('retirar_ingred')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir retirar:', error)
      return false
    }

    return true
  },
}
