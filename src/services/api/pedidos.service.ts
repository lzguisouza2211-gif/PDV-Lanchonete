import { supabase } from '../supabaseClient'

export type Adicional = {
  nome: string
  preco: number
}

export type Item = {
  nome: string
  preco: number
  adicionais?: Adicional[]
}

export type Pedido = {
  id: number
  cliente: string
  itens: Item[]
  total: number
  status?: string
  tipoentrega?: string
  endereco?: string
  formapagamento?: string
  troco?: string | number
  created_at?: string
  updated_at?: string
}

export const pedidosService = {
  async list(): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')

    if (error) {
      throw error
    }

    return data || []
  },

  async listByRange(start: string, end: string): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .gte('created_at', start)
      .lt('created_at', end)

    if (error) {
      throw error
    }

    return data || []
  },

  async create(pedido: Omit<Pedido, 'id'>): Promise<boolean> {
    const { error } = await supabase
      .from('pedidos')
      .insert([pedido])

    if (error) {
      return false
    }

    return true
  },

  async updateStatus(id: number, status: string): Promise<boolean> {
    const { error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)

    if (error) {
      return false
    }

    return true
  },
}