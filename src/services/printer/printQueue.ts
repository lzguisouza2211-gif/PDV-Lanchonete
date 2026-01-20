/**
 * Fila de impressão com retry automático
 * Evita problemas de impressão simultânea e fornece retry em caso de falha
 */

interface PrintJob {
  id: string
  type: 'producao' | 'motoboy'
  data: any
  retries: number
  maxRetries: number
  timestamp: number
  status: 'pending' | 'printing' | 'completed' | 'failed'
}

class PrintQueue {
  private queue: PrintJob[] = []
  private isPrinting = false
  private printerReady = true
  private printCallback: ((job: PrintJob) => Promise<void>) | null = null

  // Configuração de retry
  private readonly INITIAL_DELAY = 500 // ms
  private readonly MAX_RETRIES = 3
  private readonly RETRY_BACKOFF = 1000 // ms

  /**
   * Registra a função de callback que será executada ao imprimir
   */
  registerPrintCallback(
    callback: (job: PrintJob) => Promise<void>
  ) {
    this.printCallback = callback
  }

  /**
   * Adiciona um trabalho à fila
   */
  async addJob(
    type: 'producao' | 'motoboy',
    data: any,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<boolean> {
    const job: PrintJob = {
      id: `print-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      retries: 0,
      maxRetries,
      timestamp: Date.now(),
      status: 'pending'
    }

    this.queue.push(job)
    console.log(`📄 Trabalho de impressão adicionado à fila: ${job.id}`)

    // Inicia o processamento
    this.processQueue()

    return true
  }

  /**
   * Processa a fila de impressão
   */
  private async processQueue() {
    if (this.isPrinting || this.queue.length === 0) {
      return
    }

    this.isPrinting = true

    while (this.queue.length > 0) {
      const job = this.queue[0]

      try {
        job.status = 'printing'
        console.log(`🖨️  Imprimindo: ${job.id} (${job.type})`)

        if (!this.printCallback) {
          throw new Error('Callback de impressão não foi registrado')
        }

        // Aguarda a impressora estar pronta
        await this.waitForPrinter()

        // Executa a impressão com timeout de 5 segundos
        const printPromise = this.printCallback(job)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na impressão')), 5000)
        )

        await Promise.race([printPromise, timeoutPromise])

        job.status = 'completed'
        console.log(`✅ Impressão concluída: ${job.id}`)

        // Remove da fila IMEDIATAMENTE
        this.queue.shift()
        console.log(
          `📋 Fila atualizada. Ainda há ${this.queue.length} trabalhos.`
        )
      } catch (error) {
        console.error(`❌ Erro ao imprimir ${job.id}:`, error)

        job.retries++

        if (job.retries >= job.maxRetries) {
          job.status = 'failed'
          console.error(
            `🚨 Falha permanente após ${job.maxRetries} tentativas: ${job.id}`
          )
          // Remove da fila mesmo após falha
          this.queue.shift()
          console.log(
            `📋 Job removido após falha. Fila tem ${this.queue.length} trabalhos.`
          )
        } else {
          // Retry com backoff
          const delay = this.INITIAL_DELAY + job.retries * this.RETRY_BACKOFF
          console.log(
            `⏳ Retry em ${delay}ms... (${job.retries}/${job.maxRetries})`
          )
          await this.sleep(delay)
        }
      }
    }

    this.isPrinting = false
    console.log('✅ Fila de impressão vazia. Processamento finalizado.')
  }

  /**
   * Aguarda a impressora estar pronta
   */
  private async waitForPrinter(maxWait: number = 5000) {
    const startTime = Date.now()

    while (!this.printerReady) {
      if (Date.now() - startTime > maxWait) {
        throw new Error('Timeout: impressora não ficou pronta')
      }
      await this.sleep(100)
    }
  }

  /**
   * Define se a impressora está pronta
   */
  setPrinterReady(ready: boolean) {
    this.printerReady = ready
  }

  /**
   * Aguarda por tempo especificado
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Retorna o status da fila
   */
  getQueueStatus() {
    return {
      size: this.queue.length,
      isPrinting: this.isPrinting,
      jobs: this.queue.map((j) => ({
        id: j.id,
        type: j.type,
        status: j.status,
        retries: j.retries,
      })),
    }
  }

  /**
   * Limpa a fila
   */
  clearQueue() {
    this.queue = []
    console.log('🗑️  Fila de impressão limpa')
  }
}

export const printQueue = new PrintQueue()
