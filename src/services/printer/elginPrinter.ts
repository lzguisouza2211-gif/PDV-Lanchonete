import { Pedido } from '../api/pedidos.service'
// @ts-ignore - escpos não tem tipos TypeScript
import esc from 'escpos'

export interface PrinterConfig {
  printerName?: string
  paperWidth?: number
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

/**
 * Serviço de impressão para impressora Elgin i8
 * Usa biblioteca escpos para formatação térmica correta
 */
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

  private center(text: string): string {
    const width = this.config.paperWidth || 48
    const padding = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(padding) + text
  }

  private leftRight(left: string, right: string): string {
    const width = this.config.paperWidth || 48
    const gap = width - left.length - right.length
    if (gap < 0) {
      return left.substring(0, width - 3) + '...'
    }
    return left + ' '.repeat(Math.max(1, gap)) + right
  }

  private divider(char: string = ' '): string {
    return '\n'
  }

  private createBuffer(): string {
    let output = ''
    output += '\x1b\x40'
    return output
  }

  private getEndereco(pedido: Pedido): string | null {
    const endereco = pedido.endereco ? String(pedido.endereco).trim() : ''
    const numero = pedido.numero ? String(pedido.numero).trim() : ''
    const bairro = pedido.bairro ? String(pedido.bairro).trim() : ''
    const entrega = pedido.taxa_entrega ? String(pedido.taxa_entrega).trim() : ''

    const novoFormato = endereco
      ? `${endereco}${numero ? `, ${numero}` : ''}${bairro ? ` - ${bairro}` : ''}`
      : ''

    const legado = pedido.endereco ? String(pedido.endereco).trim() : ''
    return novoFormato || legado || null
  }

  /**
   * Gera formato de impressão no layout "cupom fiscal fake"
   */
  generateCupomFiscalFake(pedido: Pedido): string {
    let buffer = ''
    buffer += this.center('Luizão Lanches').toUpperCase() + '\n'
    buffer += this.center('Ouro Fino - MG') + '\n'
    buffer += this.divider('-') + '\n'
    buffer += this.center('DELIVERY | [Entrega]') + '\n'
    buffer += this.divider('-') + '\n'

    const data = pedido.created_at ? new Date(pedido.created_at) : new Date()
    buffer += `PEDIDO: ${pedido.id || '-'}   DATA: ${data.toLocaleDateString('pt-BR')}   HORA: ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n`
    buffer += `CLIENTE: ${(pedido.cliente || '-').toUpperCase()}\n`
    if (pedido.phone) buffer += `TELEFONE: ${pedido.phone}\n`
    if (pedido.endereco) buffer += `ENDEREÇO: ${this.getEndereco(pedido)}\n`
    if (pedido.bairro) buffer += `REFERÊNCIA: ${pedido.bairro}\n`

    buffer += `OPERADOR: 01-LUIZAO\n`
    buffer += this.divider('-') + '\n'
    buffer += 'QTD  PRODUTO                    PR.UNIT.  SUBTOTAL\n'
    buffer += this.divider('-') + '\n'

    let totalProdutos = 0
    if (pedido.itens?.length) {
      pedido.itens.forEach((item: any) => {
        const quantidade = item.quantidade || 1
        let nome = (item.nome || '').toUpperCase()
        if (nome.length > 25) nome = nome.slice(0, 25)
        nome = nome.padEnd(25, ' ')
        const preco = (item.preco || 0).toFixed(2).padStart(7, ' ')
        const subtotal = (quantidade * (item.preco || 0)).toFixed(2).padStart(8, ' ')
        buffer += `${quantidade.toString().padEnd(4, ' ')} ${nome}${preco}${subtotal}\n`
        totalProdutos += quantidade * (item.preco || 0)
      })
    }

    buffer += this.divider('-') + '\n'
    buffer += `TOTAL DOS PRODUTOS:           R$ ${totalProdutos.toFixed(2)}\n`
    buffer += `VALOR DA ENTREGA:             R$ ${(pedido.taxa_entrega || 0).toFixed(2)}\n`
    buffer += this.divider('-') + '\n'
    buffer += `TOTAL PEDIDO:                 R$ ${pedido.total?.toFixed(2) || '0.00'}\n`
    buffer += this.divider('-') + '\n'
    buffer += `FORMA DE PAGTO: ${(pedido.formapagamento || '-').toUpperCase()}\n`
    buffer += this.divider('-') + '\n'
    buffer += 'Não é válido como comprovante de venda\n'
    buffer += 'Não é válido como cupom fiscal\n'
    buffer += this.divider('-') + '\n'
    buffer += 'Desenvolvido por: DSoft Informática\n\n\n'

    return buffer
  }

  async print(content: string): Promise<boolean> {
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          printerName: this.config.printerName,
        }),
      })

      if (!response.ok) return this.printViaBrowser(content)
      return true
    } catch {
      return this.printViaBrowser(content)
    }
  }

  private printViaBrowser(content: string): boolean {
    try {
      const win = window.open('', '', 'height=600,width=900')
      if (!win) return false

      const displayContent = content.replace(/[\x00-\x1f]/g, '').trim()
      const htmlContent = escapeHtml(displayContent)

      win.document.write(`
        <html>
          <body>
            <pre style="font-family: monospace">${htmlContent}</pre>
          </body>
        </html>
      `)
      win.document.close()
      setTimeout(() => win.print(), 300)
      return true
    } catch {
      return false
    }
  }
}

export const elginPrinter = new ElginI8Printer({
  paperWidth: 42,
  useCuts: true,
})
