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
  /**
   * Retorna um array de itens do cardápio, cada um com ingredientes_indisponiveis,
   * e adiciona a propriedade global proibeGratuidade (em cada item, para fácil acesso no front).
   */
  async list(): Promise<ItemCardapio[]> {
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

    const { mapa, proibeGratuidade } = await this.listarIngredientesIndisponiveisHoje()

    return (data || []).map((item: any) => ({
      ...item,
      id: String(item.id),
      ingredientes: Array.isArray(item.ingredientes)
        ? item.ingredientes
        : typeof item.ingredientes === 'string'
        ? JSON.parse(item.ingredientes || '[]')
        : item.ingredientes || [],
      ingredientes_indisponiveis: mapa[String(item.id)] || [],
      proibeGratuidade,
    })) as ItemCardapio[]
  }

  async listAll(): Promise<ItemCardapio[]> {
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

    const { mapa, proibeGratuidade } = await this.listarIngredientesIndisponiveisHoje()

    return (data || []).map((item: any) => ({
      ...item,
      id: String(item.id),
      ingredientes: Array.isArray(item.ingredientes)
        ? item.ingredientes
        : typeof item.ingredientes === 'string'
        ? JSON.parse(item.ingredientes || '[]')
        : item.ingredientes || [],
      ingredientes_indisponiveis: mapa[String(item.id)] || [],
      proibeGratuidade,
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

  /**
   * Retorna um objeto com:
   * - mapa: Record<string, string[]> (ingredientes indisponíveis por produto)
   * - proibeGratuidade: boolean (true se algum indisponível do dia tem pg = true)
   */
  async listarIngredientesIndisponiveisHoje(): Promise<{ mapa: Record<string, string[]>; proibeGratuidade: boolean }> {
    const today = new Date().toISOString().slice(0, 10)
    try {
      // Busca todos os ingredientes marcados como indisponíveis (indisponivel = true) para o dia, incluindo flag pg
      const { data, error } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .select('id, ingrediente, indisponivel, pg, valid_on')
        .eq('valid_on', today)
      if (error) throw error
      // Só considera os ingredientes que estão indisponíveis (indisponivel = true)
      const indisponiveisHoje = (data || []).filter((row: any) => row.indisponivel === true)
      // Busca todos os produtos ativos e seus ingredientes
      const { data: produtos, error: errProdutos } = await supabase
        .from('cardapio')
        .select('id, ingredientes')
        .eq('ativo', true)
      if (errProdutos) throw errProdutos
      const mapa: Record<string, string[]> = {}
      // Novo: mapeia ingredientes indisponíveis e se pg=true
      const pgMap: Record<string, boolean> = {}
      indisponiveisHoje.forEach((row: any) => {
        pgMap[row.ingrediente.toLowerCase().trim()] = !!row.pg
      })
      produtos.forEach((prod: any) => {
        const key = String(prod.id)
        const ingredientesProduto = Array.isArray(prod.ingredientes)
          ? prod.ingredientes.map((i: string) => i.toLowerCase().trim())
          : []
        mapa[key] = []
        indisponiveisHoje.forEach((row: any) => {
          // Só adiciona se o produto realmente tem o ingrediente
          if (ingredientesProduto.includes(row.ingrediente.toLowerCase().trim())) {
            mapa[key].push(row.ingrediente)
          }
        })
      })
      // Se pelo menos um ingrediente indisponível do dia tem pg=true, libera troca grátis
      const proibeGratuidade = Object.values(pgMap).some((v) => v === true)
      return { mapa, proibeGratuidade }
    } catch (error: any) {
      const msg = error?.message || ''
      if (msg.includes("Could not find the table 'public.ingredientes_indisponiveis_dia'")) {
        console.warn('⚠️ Migration 019 (ingredientes_indisponiveis_dia) não aplicada; ignorando ingredientes indisponíveis.')
        return { mapa: {}, proibeGratuidade: false }
      }
      console.error('❌ Erro ao buscar ingredientes indisponíveis:', msg)
      return { mapa: {}, proibeGratuidade: false }
    }
  }

  // Função para normalizar ingrediente: maiúsculo e sem acento
    normalizarIngrediente(nome: string) {
      return nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    }

  async definirIngredienteIndisponivel(
    _cardapioId: string | null,
    ingrediente: string,
    indisponivel: boolean,
    global: boolean = true
  ): Promise<void> {
    const ingredienteBusca = this.normalizarIngrediente(ingrediente)
    const today = new Date().toISOString().slice(0, 10)
    try {
      if (indisponivel) {
        // Sempre faz select primeiro
        const { data: selectData, error: selectError } = await supabase
          .from('ingredientes_indisponiveis_dia')
          .select('id, indisponivel')
          .eq('ingrediente', ingredienteBusca)
          .eq('valid_on', today)
        if (selectError) throw selectError
        if (selectData && selectData.length > 0) {
          // Se já existe, só faz update se indisponivel for false
          const row = selectData[0]
          if (!row.indisponivel) {
            const { error: updateError } = await supabase
              .from('ingredientes_indisponiveis_dia')
              .update({ indisponivel: true })
              .eq('id', row.id)
            if (updateError) throw updateError
          }
          return
        } else {
          // Se não existe, faz insert
          const insertData = { ingrediente: ingredienteBusca, valid_on: today, indisponivel: true }
          const { error: insertError } = await supabase
            .from('ingredientes_indisponiveis_dia')
            .insert([insertData])
          if (insertError) throw insertError
          return
        }
      }

      // Para marcar como disponível, faz update para indisponivel: false
      const { error } = await supabase
        .from('ingredientes_indisponiveis_dia')
        .update({ indisponivel: false })
        .eq('ingrediente', ingredienteBusca)
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