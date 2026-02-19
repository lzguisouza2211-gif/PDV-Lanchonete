/**
 * Hook para gerenciar impressão de pedidos
 */

import { useCallback, useState } from 'react'
import { Pedido } from '../services/api/pedidos.service'
import { printQueue } from '../services/printer/printQueue'
import { supabase } from '../services/supabaseClient'

interface PrintStatus {
  isLoading: boolean
  error: string | null
  lastPrintedId: number | null
  queueSize: number
}


function getItemKey(item: any) {
  const nome = item.nome || item.name || ''
  const observacoes = item.observacoes || item.observations || ''
  const categoria = item.categoria || 'Itens'
  const adicionais = (item.adicionais || item.addons || [])
    .map((a: any) => a.nome || a.name)
    .sort()
    .join('|')
  const retirados = (item.retirados || item.removes || [])
    .map((r: any) => r.nome || r.name)
    .sort()
    .join('|')
  return [categoria, nome, observacoes, adicionais, retirados].join('||')
}

function consolidateItems(items: any[]) {
  const map = new Map<string, any>()
  for (const item of items) {
    const key = getItemKey(item)
    const quantidade = item.quantidade ?? item.quantity ?? 1
    if (map.has(key)) {
      const existente = map.get(key)
      existente.quantidade = (existente.quantidade ?? existente.quantity ?? 1) + quantidade
    } else {
      map.set(key, { ...item, quantidade })
    }
  }
  return Array.from(map.values())
}

function formatItemDetalhes(item: any) {
  const nome = item.nome || item.name || ''
  const quantidade = item.quantidade ?? item.quantity ?? 1
  let linha = `${quantidade}x ${nome}`

  const detalhes: string[] = []
  const adicionais = item.adicionais || item.addons || []
  if (Array.isArray(adicionais) && adicionais.length > 0) {
    detalhes.push('Adicionais: ' + adicionais.map((a: any) => a.nome || a.name).join(', '))
  }
  const retirados = item.retirados || item.removes || []
  if (Array.isArray(retirados) && retirados.length > 0) {
    detalhes.push('Retirar: ' + retirados.map((r: any) => r.nome || r.name).join(', '))
  }
  const observacoes = item.observacoes || item.observations
  if (observacoes) {
    detalhes.push('Obs: ' + observacoes)
  }
  if (detalhes.length > 0) {
    linha += '\n  ' + detalhes.join(' | ')
  }
  return linha
}

function formatItensPorCategoria(items: any[], _width: number) {
  if (!Array.isArray(items) || items.length === 0) return ''
  const consolidado = consolidateItems(items)
  const grupos = new Map<string, any[]>()

  for (const item of consolidado) {
    const categoria = (item.categoria || 'Itens').toString()
    if (!grupos.has(categoria)) grupos.set(categoria, [])
    grupos.get(categoria)!.push(item)
  }

  const partes: string[] = []
  for (const [categoria, itensCat] of grupos.entries()) {
    partes.push(categoria.toUpperCase())
    for (const item of itensCat) {
      partes.push(formatItemDetalhes(item))
    }
    partes.push('')
  }

  if (partes.length > 0 && partes[partes.length - 1] === '') {
    partes.pop()
  }

  return partes.join('\n')
}

function dedupeLines(text: string) {
  if (!text) return text
  const seen = new Set<string>()
  const result: string[] = []
  for (const line of text.split('\n')) {
    const key = line.trim()
    if (!key) {
      result.push(line)
      continue
    }
    if (!seen.has(key)) {
      seen.add(key)
      result.push(line)
    }
  }
  return result.join('\n')
}

export function usePrinter() {
  const [status, setStatus] = useState<PrintStatus>({
    isLoading: false,
    error: null,
    lastPrintedId: null,
    queueSize: 0,
  })

  /**
   * Imprime ticket de produção
   */
  const printProducao = useCallback(async (pedido: any) => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }));
    try {
      // Adaptar pedido para Order
      const order: Order = {
        orderNumber: pedido.id,
        createdAt: pedido.created_at || new Date(),
        customerName: pedido.cliente,
        customerPhone: pedido.phone,
        deliveryAddress: pedido.endereco,
        items: (pedido.itens || []).map((item: any) => ({
          name: item.nome,
          quantity: item.quantidade,
          observations: item.observacoes,
          addons: item.adicionais || [],
          removes: item.retirados || [],
        })),
        paymentMethod: pedido.formapagamento || '',
        subtotal: pedido.total || 0,
        deliveryFee: pedido.taxa_entrega || 0,
        total: pedido.total || 0,
        isDelivery: pedido.tipoentrega === 'entrega',
      };
      
      console.log('🖨️ DEBUG IMPRESSAO:');
      console.log('Pedido completo:', JSON.stringify(pedido, null, 2));
      console.log('Order.items:', JSON.stringify(order.items, null, 2));
      
      // Layout detalhado para produção
      // Função para formatar endereço separando rua, número e bairro
      function formatarEndereco(endereco: string | undefined) {
        if (!endereco) return '-';
        // Tenta separar por vírgula ou hífen
        const partes = endereco.split(/,| - | -|-/);
        let rua = partes[0]?.trim() || '';
        let numero = '';
        let bairro = '';
        if (partes.length > 1) {
          numero = partes[1]?.replace(/N[ºo]?/i, '').trim();
        }
        if (partes.length > 2) {
          bairro = partes[2]?.trim();
        }
        let resultado = `Rua: ${rua}`;
        if (numero) resultado += `\nNº: ${numero}`;
        if (bairro) resultado += `\nBairro: ${bairro}`;
        return resultado;
      }

      const receiptWidth = 48
      const separator = '='.repeat(receiptWidth)
      const dashLine = '-'.repeat(receiptWidth)

      let itensFormatados = formatItensPorCategoria(pedido.itens || [], receiptWidth)
      if (!itensFormatados) {
        itensFormatados = order.items.map(formatItemDetalhes).join('\n')
      }
      itensFormatados = dedupeLines(itensFormatados)
      itensFormatados = dedupeLines(itensFormatados)

      // Buscar itens formatados via RPC (mesma abordagem do WhatsApp)
      try {
        const { data, error } = await supabase.rpc('format_pedido_itens_from_table', {
          pedido_id: pedido.id,
        })
        if (!itensFormatados && !error && typeof data === 'string' && data.trim() !== '') {
          itensFormatados = data
        }
      } catch (rpcError) {
        console.warn('Falha ao buscar itens via RPC, usando fallback local:', rpcError)
      }

      // Remove linhas duplicadas consecutivas (evita itens duplicados)
      const linhas = itensFormatados.split('\n')
      const linhasDedup: string[] = []
      for (const linha of linhas) {
        if (linhasDedup.length === 0 || linha !== linhasDedup[linhasDedup.length - 1]) {
          linhasDedup.push(linha)
        }
      }
      itensFormatados = linhasDedup.join('\n')

      const texto =
        `${separator}\n` +
        'Luizao Lanches\n' +
        'PRODUCAO / COZINHA\n' +
        `${separator}\n` +
        `PEDIDO #${order.orderNumber}\n` +
        `Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}\n` +
        `${dashLine}\n` +
        `Cliente: ${order.customerName || '-'}\n` +
        (order.customerPhone ? `Fone: ${order.customerPhone}\n` : '') +
        (order.deliveryAddress ? formatarEndereco(order.deliveryAddress) + '\n' : '') +
        `${dashLine}\n` +
        'ITENS:\n' +
        itensFormatados +
        '\n' +
        `${dashLine}\n` +
        (order.deliveryFee ? `Entrega: R$ ${order.deliveryFee.toFixed(2)}\n` : '') +
        `Pagamento: ${order.paymentMethod || '-'}\n` +
        `TOTAL: R$ ${order.total.toFixed(2)}\n` +
        `${separator}\n` +
        '\n\n\n\n\n\n\n\n\n\n\n'; // Espaço extra no final
      const response = await fetch('http://localhost:4000/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: texto }),
      });
      if (!response.ok) throw new Error('Erro ao enviar para impressão');
      setStatus((s) => ({
        ...s,
        isLoading: false,
        lastPrintedId: pedido.id,
      }));
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao imprimir produção';
      setStatus((s) => ({
        ...s,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  /**
   * Imprime ticket de motoboy (entrega)
   */
  const printMotoboy = useCallback(async (pedido: any) => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }));
    try {
      // Adaptar pedido para Order
      const order: Order = {
        orderNumber: pedido.id,
        createdAt: pedido.created_at || new Date(),
        customerName: pedido.cliente,
        customerPhone: pedido.phone,
        deliveryAddress: pedido.endereco,
        items: (pedido.itens || []).map((item: any) => ({
          name: item.nome,
          quantity: item.quantidade,
          observations: item.observacoes,
          addons: item.adicionais || [],
          removes: item.retirados || [],
        })),
        paymentMethod: pedido.formapagamento || '',
        subtotal: pedido.total || 0,
        deliveryFee: pedido.taxa_entrega || 0,
        total: pedido.total || 0,
        isDelivery: pedido.tipoentrega === 'entrega',
      };
      // Layout detalhado para entrega (80mm / 48 colunas)
      const receiptWidth = 48
      const separator = '='.repeat(receiptWidth)
      const dashLine = '-'.repeat(receiptWidth)
      let itensFormatados = formatItensPorCategoria(pedido.itens || [], receiptWidth)
      if (!itensFormatados) {
        itensFormatados = order.items.map(formatItemDetalhes).join('\n')
      }

      const texto =
        `${separator}\n` +
        'Luizao Lanches\n' +
        'ENTREGA / MOTOBOY\n' +
        `${separator}\n` +
        `PEDIDO #${order.orderNumber}\n` +
        `Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}\n` +
        `${dashLine}\n` +
        `Cliente: ${order.customerName || '-'}\n` +
        (order.customerPhone ? `Fone: ${order.customerPhone}\n` : '') +
        (order.deliveryAddress ? `Endereço: ${order.deliveryAddress}\n` : '') +
        `${dashLine}\n` +
        'ITENS:\n' +
        itensFormatados +
        '\n' +
        `${dashLine}\n` +
        (order.deliveryFee ? `Entrega: R$ ${order.deliveryFee.toFixed(2)}\n` : '') +
        `Pagamento: ${order.paymentMethod || '-'}\n` +
        `TOTAL: R$ ${order.total.toFixed(2)}\n` +
        `${separator}\n` +
        '\n\n\n\n\n\n\n\n\n\n\n'; // Espaço extra no final
      const response = await fetch('http://localhost:4000/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: texto }),
      });
      if (!response.ok) throw new Error('Erro ao enviar para impressão');
      setStatus((s) => ({
        ...s,
        isLoading: false,
        lastPrintedId: pedido.id,
      }));
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao imprimir entrega';
      setStatus((s) => ({
        ...s,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  /**
   * Imprime ticket completo
   */
  // Função placeholder: não usar mais elginPrinter.generateCompleto
  const printCompleto = useCallback(async (pedido: Pedido) => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }))
    try {
      // Apenas adiciona o pedido na fila, sem formatação especial
      await printQueue.addJob('producao', { pedido, content: JSON.stringify(pedido) }, 3)
      setStatus((s) => ({
        ...s,
        isLoading: false,
        lastPrintedId: pedido.id,
      }))
      return true
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao imprimir'
      setStatus((s) => ({
        ...s,
        isLoading: false,
        error: errorMessage,
      }))
      return false
    }
  }, [])

  /**
   * Limpa estado de erro
   */
  const clearError = useCallback(() => {
    setStatus((s) => ({ ...s, error: null }))
  }, [])

  return {
    printProducao,
    printMotoboy,
    printCompleto,
    status,
    clearError,
  }
}
