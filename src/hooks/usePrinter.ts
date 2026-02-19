/**
 * Hook para gerenciar impressão de pedidos
 */

import { useCallback, useState } from 'react'
import { Pedido } from '../services/api/pedidos.service'
import { Order } from '../types/index';
import { printQueue } from '../services/printer/printQueue'
import { supabase } from '../services/supabaseClient'

interface PrintStatus {
  isLoading: boolean
  error: string | null
  lastPrintedId: number | null
  queueSize: number
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

      // Função para formatar cada item, incluindo adicionais, retiradas e observações
      function formatarItemProducao(item: any) {
        let linha = `- ${item.quantity}x ${item.name}`;
        let detalhes: string[] = [];
        if (item.addons && item.addons.length > 0) {
          detalhes.push('Adicionais: ' + item.addons.map((a: any) => a.nome || a.name).join(', '));
        }
        if (item.removes && item.removes.length > 0) {
          detalhes.push('Retirar: ' + item.removes.map((r: any) => r.nome || r.name).join(', '));
        }
        if (item.observations) {
          detalhes.push('Obs: ' + item.observations);
        }
        if (detalhes.length > 0) {
          linha += '\n    ' + detalhes.join(' | ');
        }
        return linha;
      }

      let itensFormatados = order.items.map(formatarItemProducao).join('\n')

      // Buscar itens formatados via RPC (mesma abordagem do WhatsApp)
      try {
        const { data, error } = await supabase.rpc('format_pedido_itens_from_table', {
          pedido_id: pedido.id,
        })
        if (!error && typeof data === 'string' && data.trim() !== '') {
          itensFormatados = data
        }
      } catch (rpcError) {
        console.warn('Falha ao buscar itens via RPC, usando fallback local:', rpcError)
      }

      const texto =
        '==============================\n' +
        '        Luizao Lanches         \n' +
        '      PRODUCAO / COZINHA      \n' +
        '==============================\n' +
        `PEDIDO #${order.orderNumber}\n` +
        `Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}\n` +
        '\n' +
        '------------------------------\n' +
        `Cliente: ${order.customerName || '-'}\n` +
        (order.customerPhone ? `Fone: ${order.customerPhone}\n` : '') +
        (order.deliveryAddress ? formatarEndereco(order.deliveryAddress) + '\n' : '') +
        '\n' +
        '------------------------------\n' +
        'Itens:\n' +
        itensFormatados +
        '\n' +
        '------------------------------\n' +
        `Subtotal: R$ ${order.subtotal.toFixed(2)}\n` +
        (order.deliveryFee ? `Entrega: R$ ${order.deliveryFee.toFixed(2)}\n` : '') +
        `TOTAL: R$ ${order.total.toFixed(2)}\n` +
        `Pagamento: ${order.paymentMethod || '-'}\n` +
        '==============================\n' +
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
      // Layout detalhado para entrega
      const texto =
        '==============================\n' +
        '        Luizao Lanches         \n' +
        '     ENTREGA / MOTOBOY        \n' +
        '==============================\n' +
        `PEDIDO #${order.orderNumber}\n` +
        `Data: ${new Date(order.createdAt).toLocaleString('pt-BR')}\n` +
        '\n' +
        '------------------------------\n' +
        `Cliente: ${order.customerName || '-'}\n` +
        (order.customerPhone ? `Fone: ${order.customerPhone}\n` : '') +
        (order.deliveryAddress ? `Endereço: ${order.deliveryAddress}\n` : '') +
        '\n' +
        '------------------------------\n' +
        'Itens:\n' +
        order.items.map(i => `- ${i.quantity}x ${i.name}${i.observations ? ' ('+i.observations+')' : ''}`).join('\n') +
        '\n' +
        '------------------------------\n' +
        `Subtotal: R$ ${order.subtotal.toFixed(2)}\n` +
        (order.deliveryFee ? `Entrega: R$ ${order.deliveryFee.toFixed(2)}\n` : '') +
        `TOTAL: R$ ${order.total.toFixed(2)}\n` +
        `Pagamento: ${order.paymentMethod || '-'}\n` +
        '==============================\n' +
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
  const printCompleto = useCallback(async (pedido: Pedido) => {
    setStatus((s) => ({ ...s, isLoading: true, error: null }))

    try {
      const content = elginPrinter.generateCompleto(pedido)
      await printQueue.addJob('producao', { pedido, content }, 3)

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
