/**
 * Serviço de impressão para impressora Elgin i8
 * Usa biblioteca escpos para formatação térmica correta
 */

import { Pedido } from '../api/pedidos.service'

// @ts-ignore - escpos não tem tipos TypeScript
import esc from 'escpos'

export interface PrinterConfig {
  printerName?: string
  paperWidth?: number // Largura em caracteres (padrão: 48 para térmica 80mm)
  useCuts?: boolean
}

/**
 * Escapa caracteres HTML para exibição no navegador
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

class ElginI8Printer {
  private config: PrinterConfig = {
    paperWidth: 48,
    useCuts: true,
  }

  constructor(config?: PrinterConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Formata texto centralizado
   */
  private center(text: string): string {
    const width = this.config.paperWidth || 48
    const padding = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(padding) + text
  }

  /**
   * Formata linha com dois valores (esquerda e direita)
   */
  private leftRight(left: string, right: string): string {
    const width = this.config.paperWidth || 48
    const gap = width - left.length - right.length
    if (gap < 0) {
      return left.substring(0, width - 3) + '...'
    }
    return left + ' '.repeat(Math.max(1, gap)) + right
  }

  /**
   * Formata divisor
   */
  private divider(char: string = '-'): string {
    return char.repeat(this.config.paperWidth || 48)
  }

  /**
   * Gera buffer ESC/POS usando a biblioteca escpos
   */
  private createBuffer(): string {
    // Cria um novo buffer para ESC/POS
    let output = ''

    // Inicializa impressora
    output += '\x1b\x40' // ESC @

    return output
  }

  private getEndereco(pedido: Pedido): string | null {
    const endereco = pedido.endereco ? String(pedido.endereco).trim() : ''
    const numero = pedido.numero ? String(pedido.numero).trim() : ''
    const bairro = pedido.bairro ? String(pedido.bairro).trim() : ''

    const novoFormato = endereco
      ? `${endereco}${numero ? `, ${numero}` : ''}${bairro ? ` - ${bairro}` : ''}`
      : ''

    const legado = pedido.endereco ? String(pedido.endereco).trim() : ''

    const resultado = novoFormato || legado
    return resultado || null
  }

  /**
   * Gera formato de impressão para PRODUÇÃO
   */
  generateProducao(pedido: Pedido): string {
    let buffer = ''

    // Cabeçalho da loja
    buffer += this.center('Luizao-Lanches') + '\n'
    buffer += this.center('Ouro Fino-MG') + '\n'
    buffer += this.divider() + '\n'

    // Cabeçalho do pedido
    buffer += this.center('NUMERO DO PEDIDO') + '\n'
    buffer += this.center(String(pedido.id)) + '\n'
    buffer += 'NOME DO CLIENTE\n'
    buffer += `${pedido.cliente}\n`
    buffer += '\n'
    buffer += 'ITENS DO PEDIDO\n'
    buffer += this.divider() + '\n'

    if (pedido.itens && pedido.itens.length > 0) {
      pedido.itens.forEach((item: any, idx: number) => {
        if (idx > 0) buffer += '\n'
        const quantidade = item.quantidade || 1
        buffer += `${quantidade}x ${item.nome}\n`

        if (item.extras && item.extras.length > 0) {
          item.extras.forEach((extra: any) => {
            const nome = typeof extra === 'string' ? extra : extra.nome
            buffer += `  + ${nome}\n`
          })
        }

        if (item.observacoes) {
          buffer += `  Obs: ${item.observacoes}\n`
        }
      })
    }

    buffer += this.divider() + '\n'
    buffer += 'VALOR FORMA DE PAGAMENTO E TROCO\n'
    buffer += this.leftRight(
      `Total:`,
      `R$ ${pedido.total.toFixed(2)}`
    ) + '\n'

    if (pedido.formapagamento) {
      buffer += this.leftRight(
        `Pagamento:`,
        pedido.formapagamento.toUpperCase()
      ) + '\n'

      if (pedido.troco && Number(pedido.troco) > 0) {
        buffer += this.leftRight(
          `Troco:`,
          `R$ ${Number(pedido.troco).toFixed(2)}`
        ) + '\n'
      }
    }

    // Linhas em branco para que o papel saia completamente da impressora
    buffer += '\n\n\n\n\n\n\n\n\n\n'

    return buffer
  }

  /**
   * Gera formato de impressão para MOTOBOY
   */
  generateMotoboy(pedido: Pedido): string {
    let buffer = ''

    // Cabeçalho da loja
    buffer += this.center('Luizao-Lanches') + '\n'
    buffer += this.center('Ouro Fino-MG') + '\n'
    buffer += this.divider() + '\n'

    // Cabeçalho do pedido
    buffer += this.center('NUMERO DO PEDIDO') + '\n'
    buffer += this.center(String(pedido.id)) + '\n'
    buffer += 'NOME DO CLIENTE\n'
    buffer += `${pedido.cliente}\n`
    buffer += '\n'

    // Endereço
    buffer += 'ENDERECO\n'
    if (pedido.tipoentrega === 'entrega') {
      const endereco = this.getEndereco(pedido)
      if (endereco) {
        buffer += `${endereco}\n`
      }
    }
    buffer += '\n'

    // Itens (Bebidas, Doces, Cervejas)
    buffer += 'ITENS\n'
    buffer += this.divider() + '\n'

    // Debug: verifica se itens têm categoria
    console.log('🔍 Itens do pedido:', JSON.stringify(pedido.itens, null, 2))

    const itensBebidasDoces = (pedido.itens || []).filter((item: any) => {
      // Tenta usar categoria primeiro (pedidos novos)
      if (item.categoria) {
        const temCategoria = (
          item.categoria === 'Bebidas' ||
          item.categoria === 'Cervejas' ||
          item.categoria === 'Doces'
        )
        console.log(`✅ Item "${item.nome}" tem categoria "${item.categoria}": ${temCategoria}`)
        return temCategoria
      }
      
      // Fallback: usa nome para pedidos antigos (sem categoria)
      const nome = (item.nome || '').toLowerCase()
      const temNome = (
        // Cervejas
        nome.includes('cerveja') ||
        nome.includes('brahma') ||
        nome.includes('skol') ||
        nome.includes('heineken') ||
        nome.includes('antarctica') ||
        nome.includes('stella') ||
        nome.includes('budweiser') ||
        nome.includes('chopp') ||
        // Bebidas
        nome.includes('suco') ||
        nome.includes('refrigerante') ||
        nome.includes('coca') ||
        nome.includes('guarana') ||
        nome.includes('agua') ||
        nome.includes('água') ||
        nome.includes('sprite') ||
        nome.includes('fanta') ||
        nome.includes('pepsi') ||
        nome.includes('schweppes') ||
        nome.includes('tonica') ||
        nome.includes('abacaxi') ||
        nome.includes('laranja') ||
        nome.includes('limao') ||
        nome.includes('limão') ||
        nome.includes('morango') ||
        nome.includes('uva') ||
        nome.includes('maracuja') ||
        nome.includes('maracujá') ||
        nome.includes('açai') ||
        nome.includes('acai') ||
        // Doces
        nome.includes('doce') ||
        nome.includes('chocolate') ||
        nome.includes('brigadeiro') ||
        nome.includes('sorvete') ||
        nome.includes('bombom') ||
        nome.includes('trufa') ||
        nome.includes('pudim') ||
        nome.includes('mousse') ||
        nome.includes('bolo') ||
        nome.includes('torta') ||
        nome.includes('brownie')
      )
      console.log(`⚠️ Item "${item.nome}" SEM categoria, usando nome: ${temNome}`)
      return temNome
    })

    console.log(`📦 Total de itens filtrados: ${itensBebidasDoces.length}`)


    if (itensBebidasDoces.length > 0) {
      itensBebidasDoces.forEach((item: any) => {
        const quantidade = item.quantidade || 1
        buffer += `${quantidade}x ${item.nome}\n`
      })
    }

    buffer += this.divider() + '\n'
    buffer += '\n'

    // Valores
    buffer += 'VALOR FORMA DE PAGAMENTO E TROCO\n'
    buffer += this.leftRight(
      `Total:`,
      `R$ ${pedido.total.toFixed(2)}`
    ) + '\n'

    if (pedido.formapagamento) {
      buffer += this.leftRight(
        `Pagamento:`,
        pedido.formapagamento.toUpperCase()
      ) + '\n'

      if (pedido.troco && Number(pedido.troco) > 0) {
        buffer += this.leftRight(
          `Troco:`,
          `R$ ${Number(pedido.troco).toFixed(2)}`
        ) + '\n'
      }
    }

    buffer += '\n'
    buffer += this.divider() + '\n'
    buffer += '\n'

    // Rodapé com disclaimer
    buffer += 'NAO E VALIDO COMO\n'
    buffer += 'COMPROVANTE DE VENDA\n'
    buffer += '\n'
    buffer += 'NAO E VALIDO COMO\n'
    buffer += 'CUPOM FISCAL\n'
    buffer += '\n\n\n\n\n\n\n\n\n\n'

    return buffer
  }

  /**
   * Formata um ticket completo
   */
  generateCompleto(pedido: Pedido): string {
    let buffer = '\n'

    buffer += this.center('*** PEDIDO COMPLETO ***') + '\n'
    buffer += this.divider() + '\n'
    buffer += '\n'

    buffer += this.center(`#${pedido.id}`) + '\n'
    const horario = new Date((pedido.created_at as string) || new Date())
      .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    buffer += this.center(horario) + '\n'
    buffer += '\n'

    buffer += `CLIENTE: ${pedido.cliente}\n`

    if (pedido.tipoentrega === 'entrega') {
      const endereco = this.getEndereco(pedido)
      if (endereco) {
        buffer += `ENDERECO: ${endereco}\n`
      }
    }

    buffer += this.divider() + '\n'
    buffer += '\n'

    buffer += 'ITENS:\n'

    if (pedido.itens && pedido.itens.length > 0) {
      pedido.itens.forEach((item: any) => {
        const quantidade = item.quantidade || 1
        buffer += `${quantidade}x ${item.nome}\n`

        if (item.extras && item.extras.length > 0) {
          item.extras.forEach((extra: any) => {
            const nome = typeof extra === 'string' ? extra : extra.nome
            buffer += `  + ${nome}\n`
          })
        }
      })
    }

    buffer += '\n'
    buffer += this.divider() + '\n'
    buffer += this.leftRight(`TOTAL:`, `R$ ${pedido.total.toFixed(2)}`) + '\n'

    if (pedido.formapagamento) {
      buffer += `Pag: ${pedido.formapagamento}\n`
    }

    buffer += '\n'
    buffer += this.center('Obrigado!') + '\n'
    buffer += '\n'

    return buffer
  }

  /**
   * Envia para impressão (tenta API, se não funcionar usa navegador)
   */
  async print(content: string): Promise<boolean> {
    try {
      // Tenta API primeiro
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          printerName: this.config.printerName,
        }),
      })

      if (!response.ok) {
        console.warn('⚠️  API não disponível, usando fallback')
        return this.printViaBrowser(content)
      }

      console.log('✅ Enviado para impressora via API')
      return true
    } catch (error) {
      console.warn('⚠️  Sem API, usando fallback do navegador')
      return this.printViaBrowser(content)
    }
  }

  /**
   * Fallback: impressão via navegador
   */
  private printViaBrowser(content: string): boolean {
    try {
      const win = window.open('', '', 'height=600,width=900')
      if (!win) {
        console.error('❌ Pop-ups bloqueados no navegador')
        return false
      }

      // Remove caracteres de controle ESC/POS
      const displayContent = content
        .replace(/[\x00-\x1f]/g, '')
        .trim()

      const htmlContent = escapeHtml(displayContent)

      win.document.write(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Impressão - Luizão Lanches</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
              }
              .ticket {
                background: white;
                width: 80mm;
                margin: 0 auto;
                padding: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              pre {
                margin: 0;
                font-size: 11px;
                line-height: 1.2;
                white-space: pre-wrap;
              }
              @media print {
                body { background: white; margin: 0; padding: 0; }
                .ticket { width: 100%; box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="ticket">
              <pre>${htmlContent}</pre>
            </div>
          </body>
        </html>
      `)
      win.document.close()

      console.log('🖨️  Janela aberta. Use Ctrl+P para imprimir ou clique em Imprimir')
      setTimeout(() => {
        win.print()
      }, 300)

      return true
    } catch (error) {
      console.error('❌ Erro ao abrir janela:', error)
      return false
    }
  }
}

export const elginPrinter = new ElginI8Printer({
  paperWidth: 42,  // Reduza se ainda cortar (tente 38, 35, 32)
  useCuts: true,
})
