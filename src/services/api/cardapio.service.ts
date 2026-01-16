import { supabase } from '../supabaseClient'

export type ItemCardapio = {
  id: string
  nome: string
  preco: number
  categoria: string
  ativo: boolean
  descricao?: string
  ingredientes?: string[]
  disponivel?: boolean
}

class CardapioService {
  async list(): Promise<ItemCardapio[]> {
    // ⚡ Otimizado: Remover ordem_categoria (causa erro + retry lento)
    // Usar apenas categoria + nome para ordenação
    const { data, error } = await supabase
      .from('cardapio')
      .select('id, nome, preco, categoria, ativo, descricao, ingredientes, disponivel')
      .eq('ativo', true)
      .eq('disponivel', true)
      .order('categoria', { ascending: true })
      .order('nome', { ascending: true })

    if (error) {
      console.error('❌ Erro ao carregar cardápio:', error.message)
      throw error
    }

    console.log('📥 Cardápio carregado:', data?.length, 'itens')

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

  async listAll(): Promise<ItemCardapio[]> {
    // Método para admin ver TODOS os produtos (ativos)
    const { data, error } = await supabase
      .from('cardapio')
      .select('id, nome, preco, categoria, ativo, descricao, ingredientes, disponivel')
      .eq('ativo', true)
      .order('categoria', { ascending: true })
      .order('nome', { ascending: true })

    if (error) {
      console.error('❌ Erro ao carregar cardápio completo:', error.message)
      throw error
    }

    console.log('📥 Cardápio admin carregado:', data?.length, 'itens')

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

  async toggleDisponibilidade(id: string): Promise<void> {
    console.log('🔄 Toggling disponibilidade para produto:', id)
    
    // Primeiro busca o produto atual para pegar o estado de disponibilidade
    const { data: current, error: fetchError } = await supabase
      .from('cardapio')
      .select('id, nome, disponivel')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('❌ Erro ao buscar produto:', fetchError)
      throw new Error('Erro ao buscar produto. Verifique se a coluna "disponivel" existe no banco.')
    }

    console.log('📦 Produto atual completo:', current)

    // Verifica se a coluna disponivel existe
    if (!('disponivel' in current)) {
      throw new Error('⚠️ A coluna "disponivel" não existe na tabela cardapio.\n\nExecute a migration 017 no Supabase SQL Editor!')
    }

    // Inverte o estado
    const novoEstado = !current?.disponivel
    console.log('🔄 Novo estado:', novoEstado)

    // Atualiza sem esperar retorno (evita problemas com RLS)
    const { error, status, statusText } = await supabase
      .from('cardapio')
      .update({ disponivel: novoEstado })
      .eq('id', id)

    console.log('📊 Status da atualização:', { status, statusText })

    if (error) {
      console.error('❌ Erro ao atualizar produto:', error)
      throw error
    }

    console.log('✅ Produto atualizado com sucesso!')
  }

  async atualizarPreco(id: string, novoPreco: number): Promise<void> {
    const { error } = await supabase
      .from('cardapio')
      .update({ preco: novoPreco })
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  async listarIngredientesIndisponiveisHoje(): Promise<Record<string, string[]>> {
    const hoje = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('ingredientes_indisponiveis_dia')
      .select('cardapio_id, ingrediente')
      .eq('valid_on', hoje)

    if (error) {
      throw error
    }

    const mapa: Record<string, string[]> = {}
    ;(data || []).forEach((row: any) => {
      const key = String(row.cardapio_id)
      if (!mapa[key]) mapa[key] = []
      mapa[key].push(row.ingrediente)
    })

    return mapa
  }

  async definirIngredienteIndisponivel(
    cardapioId: string,
    ingrediente: string,
    indisponivel: boolean,
  ): Promise<void> {
    const hoje = new Date().toISOString().split('T')[0]

    if (indisponivel) {
      const { error } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .upsert(
          [{ cardapio_id: Number(cardapioId), ingrediente, valid_on: hoje }],
          { onConflict: 'cardapio_id,ingrediente,valid_on' }
        )

      if (error) {
        throw error
      }
    } else {
      const { error } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .delete()
        .eq('cardapio_id', cardapioId)
        .eq('ingrediente', ingrediente)
        .eq('valid_on', hoje)

      if (error) {
        throw error
      }
    }
  }
}

export const cardapioService = new CardapioService()