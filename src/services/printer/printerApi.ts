/**
 * Serviço de API para comunicação com impressora
 * Pode ser expandido para integração com servidor backend
 */

export interface PrintRequest {
  content: string
  printerName?: string
}

export interface PrintResponse {
  success: boolean
  message: string
  jobId?: string
}

/**
 * Envia conteúdo para impressão
 * Por enquanto usa fallback do navegador, mas pronto para integração com backend
 */
export async function sendToPrinter(
  request: PrintRequest
): Promise<PrintResponse> {
  try {
    // Tenta enviar para uma API de impressão backend
    const response = await fetch('/api/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Enviado para impressora via API')
    return {
      success: true,
      message: 'Enviado para impressora',
      jobId: data.jobId,
    }
  } catch (error) {
    console.warn(
      '⚠️  API de impressão não disponível, usando fallback do navegador'
    )

    // Fallback: imprime via navegador
    return printViaBrowser(request.content)
  }
}

/**
 * Imprime via navegador (fallback)
 */
function printViaBrowser(content: string): PrintResponse {
  try {
    // Limpa caracteres de controle para exibição
    const displayContent = content
      .replace(/\x1d\x56\x41/g, '\n--- CORTE ---\n')
      .replace(/[\x00-\x1f]/g, '')

    // Abre janela de impressão
    const win = window.open('', '', 'height=600,width=800')
    if (!win) {
      throw new Error('Não foi possível abrir janela de impressão')
    }

    win.document.write(`
      <html>
        <head>
          <title>Impressão de Pedido</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 20px;
              white-space: pre-wrap;
              font-size: 12px;
              line-height: 1.5;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>${escapeHtml(displayContent)}</body>
      </html>
    `)
    win.document.close()

    // Inicia impressão automática
    setTimeout(() => {
      win.print()
      // Fecha após 2 segundos
      setTimeout(() => win.close(), 2000)
    }, 500)

    return {
      success: true,
      message: 'Aberto para impressão',
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao imprimir: ${error.message}`,
    }
  }
}

/**
 * Escapa caracteres HTML
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
