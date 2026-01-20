import { supabase } from '../supabaseClient'
import { logger } from '../logger/logger'

export type ItemCardapio = {
  id: string
  nome: string
  preco: number
  categoria: string
  ativo: boolean
  descricao?: string
  ingredientes?: string[]
  disponivel?: boolean
  ingredientes_indisponiveis?: string[]
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

    const indisponiveisHoje = await this.listarIngredientesIndisponiveisHoje()

    // Parse ingredientes JSON se existir e anexa indisponíveis do dia
    return (data || []).map((item: any) => ({
      ...item,
      id: String(item.id),
      ingredientes: Array.isArray(item.ingredientes)
        ? item.ingredientes
        : typeof item.ingredientes === 'string'
        ? JSON.parse(item.ingredientes || '[]')
        : item.ingredientes || [],
      ingredientes_indisponiveis: indisponiveisHoje[String(item.id)] || [],
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

    const indisponiveisHoje = await this.listarIngredientesIndisponiveisHoje()

    // Parse ingredientes JSON se existir e anexa indisponíveis do dia
    return (data || []).map((item: any) => ({
      ...item,
      id: String(item.id),
      ingredientes: Array.isArray(item.ingredientes)
        ? item.ingredientes
        : typeof item.ingredientes === 'string'
        ? JSON.parse(item.ingredientes || '[]')
        : item.ingredientes || [],
      ingredientes_indisponiveis: indisponiveisHoje[String(item.id)] || [],
    })) as ItemCardapio[]
  }

  async toggleDisponibilidade(id: string): Promise<void> {
    logger.info('🔄 Toggling disponibilidade para produto:', id)
    
    // Primeiro busca o produto atual para pegar o estado de disponibilidade
    const { data: current, error: fetchError } = await supabase
      .from('cardapio')
      .select('id, nome, disponivel')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('❌ Erro ao buscar produto:', fetchError)
      throw new Error('Erro ao buscar produto. Verifique se a coluna "disponivel" existe no banco.')
    }

    logger.info('📦 Produto atual completo:', current)

    // Verifica se a coluna disponivel existe
    if (!('disponivel' in current)) {
      throw new Error('⚠️ A coluna "disponivel" não existe na tabela cardapio.\n\nExecute a migration 017 no Supabase SQL Editor!')
    }

    // Inverte o estado
    const novoEstado = !current?.disponivel
    logger.info('🔄 Novo estado:', novoEstado)

    // Atualiza sem esperar retorno (evita problemas com RLS)
    const { error, status, statusText } = await supabase
      .from('cardapio')
      .update({ disponivel: novoEstado })
      .eq('id', id)

    logger.info('📊 Status da atualização:', { status, statusText })

    if (error) {
      logger.error('❌ Erro ao atualizar produto:', error)
      throw error
    }

    logger.info('✅ Produto atualizado com sucesso!')
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
    const today = new Date().toISOString().slice(0, 10)
    try {
      const { data, error } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .select('cardapio_id, ingrediente')
        .eq('valid_on', today)

      if (error) throw error

      const mapa: Record<string, string[]> = {}
      ;(data || []).forEach((row: any) => {
        const key = String(row.cardapio_id)
        if (!mapa[key]) mapa[key] = []
        mapa[key].push(row.ingrediente)
      })

      return mapa
    } catch (error: any) {
      const msg = error?.message || ''
      if (msg.includes("Could not find the table 'public.ingredientes_indisponiveis_dia'")) {
        console.warn('⚠️ Migration 019 (ingredientes_indisponiveis_dia) não aplicada; ignorando ingredientes indisponíveis.')
        return {}
      }
      console.error('❌ Erro ao buscar ingredientes indisponíveis:', msg)
      return {}
    }
  }

  async definirIngredienteIndisponivel(
    cardapioId: string,
    ingrediente: string,
    indisponivel: boolean
  ): Promise<void> {
    const today = new Date().toISOString().slice(0, 10)
    try {
      if (indisponivel) {
        const { error } = await supabase
          .from('ingredientes_indisponiveis_dia')
          .upsert({ cardapio_id: Number(cardapioId), ingrediente, valid_on: today })

        if (error) throw error
        return
      }

      const { error } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .delete()
        .eq('cardapio_id', Number(cardapioId))
        .eq('ingrediente', ingrediente)
        .eq('valid_on', today)

      if (error) throw error
    } catch (error: any) {
      const msg = error?.message || ''
      if (msg.includes("Could not find the table 'public.ingredientes_indisponiveis_dia'")) {
        throw new Error('Tabela ingredientes_indisponiveis_dia não existe (rode migration 019 no Supabase).')
      }
      console.error('❌ Erro ao atualizar ingrediente indisponível:', msg)
      throw error
    }
  }
}

export const cardapioService = new CardapioService()