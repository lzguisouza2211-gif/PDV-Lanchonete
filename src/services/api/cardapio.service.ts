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
}

export const cardapioService = new CardapioService()