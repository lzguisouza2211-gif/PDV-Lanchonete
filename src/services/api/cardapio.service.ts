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
}

class CardapioService {
  async list(): Promise<ItemCardapio[]> {
<<<<<<< Updated upstream
=======
    // Primeira tentativa: ordenar por ordem_categoria (se existir)
    let { data, error } = await supabase
      .from('cardapio')
      .select('id, nome, preco, categoria, ativo, descricao, ingredientes, disponivel')
      .eq('ativo', true)
      .eq('disponivel', true)
      .order('ordem_categoria', { ascending: true })
      .order('nome', { ascending: true })

    // Fallback: se a coluna ordem_categoria não existir no ambiente, reexecuta sem ela
    if (error) {
      const msg = String(error.message || '')
      const isColMissing = msg.includes('ordem_categoria') || msg.includes('undefined column') || msg.includes('42703')
      if (isColMissing) {
        logger.warn('[CardapioService.list] Coluna ordem_categoria ausente. Aplicando ordenação alternativa.')
        const retry = await supabase
          .from('cardapio')
          .select('id, nome, preco, categoria, ativo, descricao, ingredientes, disponivel')
          .eq('ativo', true)
          .eq('disponivel', true)
          .order('categoria', { ascending: true })
          .order('nome', { ascending: true })
        data = retry.data
        error = retry.error
      }
    }

    if (error) {
      throw error
    }

    logger.info('📥 Dados recebidos do Supabase (primeiro item):', data?.[0])

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
    // Método para admin ver TODOS os produtos (ativos mas sem filtro de disponivel)
    // Primeira tentativa: ordenar por ordem_categoria (se existir)
    let { data, error } = await supabase
      .from('cardapio')
      .select('id, nome, preco, categoria, ativo, descricao, ingredientes, disponivel')
      .eq('ativo', true)
      .order('ordem_categoria', { ascending: true })
      .order('nome', { ascending: true })

    // Fallback: se a coluna ordem_categoria não existir, reexecuta sem ela
    if (error) {
      const msg = String(error.message || '')
      const isColMissing = msg.includes('ordem_categoria') || msg.includes('undefined column') || msg.includes('42703')
      if (isColMissing) {
        logger.warn('[CardapioService.listAll] Coluna ordem_categoria ausente. Aplicando ordenação alternativa.')
        const retry = await supabase
          .from('cardapio')
          .select('id, nome, preco, categoria, ativo, descricao, ingredientes, disponivel')
          .eq('ativo', true)
          .order('categoria', { ascending: true })
          .order('nome', { ascending: true })
        data = retry.data
        error = retry.error
      }
    }

    if (error) {
      throw error
    }

    logger.info('📥 Dados (Admin - Todos) recebidos do Supabase:', data?.length, 'itens')

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

  async listarIngredientesIndisponiveisHoje(): Promise<Record<string, string[]>> {
    const hoje = new Date().toISOString().split('T')[0]

>>>>>>> Stashed changes
    const { data, error } = await supabase
      .from('cardapio')
      .select('*')
      .eq('ativo', true)

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