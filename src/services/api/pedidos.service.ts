import { supabase } from '../supabaseClient'
import { pedidoItensService, PedidoItem } from './pedido_itens.service'

export type Adicional = {
  nome: string
  preco: number
}

export type Item = {
  nome: string
  preco: number
}

export type Pedido = {
  id: number
  cliente: string
  itens: PedidoItem[]
  total: number
  status?: string
  tipoentrega?: string
  endereco?: string
  numero?: string
  bairro?: string
  formapagamento?: string
  phone?: string
  troco?: string | number
  tempo_preparo?: number
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

    // Buscar itens para cada pedido (garante sempre preenchido)
    const pedidos: Pedido[] = data || []
    return await Promise.all(
      pedidos.map(async (pedido) => {
        const itens = await pedidoItensService.buscarPorPedido(pedido.id)
        return { ...pedido, itens }
      })
    )
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

    const pedidos: Pedido[] = data || []
    for (const pedido of pedidos) {
      pedido.itens = await pedidoItensService.buscarPorPedido(pedido.id)
    }
    return pedidos
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

  async updateStatus(id: number, status: string, tempo_preparo?: number): Promise<Pedido> {
    const updateData: any = { status }
    if (tempo_preparo !== undefined) {
      updateData.tempo_preparo = tempo_preparo
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Erro ao atualizar status do pedido')
    }

    if (!data) {
      throw new Error('Atualização de status não retornou dados')
    }

    return data as Pedido
  },
}