/**
 * EXEMPLO: Servidor Node.js/Express para controlar impressora Elgin i8
 * 
 * Este arquivo é um EXEMPLO de como implementar o backend para controlar
 * a impressora real. Copie e adapte conforme sua necessidade.
 * 
 * Dependências necessárias:
 * npm install express escpos-buffer
 */

const express = require('express')
const EscposBuffer = require('escpos-buffer').EscposBuffer

const app = express()
app.use(express.json())

/**
 * ⚠️ IMPORTANTE: Configure a porta serial da sua impressora
 */
const PRINTER_CONFIG = {
  device: '/dev/ttyUSB0', // Linux: /dev/ttyUSB0 ou /dev/ttyS0
  // device: 'COM3',      // Windows: COM3, COM4, etc
  baudRate: 9600,
}

/**
 * Endpoint para enviar conteúdo para impressora
 * 
 * POST /api/print
 * Body: {
 *   "content": "string com código de impressão",
 *   "printerName": "ELGIN_I8" (opcional)
 * }
 */
app.post('/api/print', async (req, res) => {
  try {
    const { content, printerName } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Conteúdo vazio',
      })
    }

    // Aqui você implementaria a lógica real de impressão
    // Exemplo com escpos-buffer:
    const buffer = new EscposBuffer()

    // Parse do conteúdo ESC/POS
    buffer.appendRaw(Buffer.from(content, 'utf8'))

    // Enviar para impressora
    // await sendToSerialPort(buffer.toBuffer())

    console.log(`✅ Trabalho de impressão criado: ${printerName || 'padrão'}`)

    res.json({
      success: true,
      message: 'Enviado para fila de impressão',
      jobId: `print-${Date.now()}`,
    })
  } catch (error) {
    console.error('❌ Erro ao imprimir:', error)

    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar impressão',
    })
  }
})

/**
 * Exemplo com biblioteca SerialPort (melhor para produção)
 * 
 * npm install serialport
 */
async function setupSerialPrinter() {
  try {
    const SerialPort = require('serialport').SerialPort

    const printer = new SerialPort({
      path: PRINTER_CONFIG.device,
      baudRate: PRINTER_CONFIG.baudRate,
    })

    printer.on('open', () => {
      console.log('🖨️ Impressora Elgin i8 conectada')
    })

    printer.on('error', (err) => {
      console.error('❌ Erro na impressora:', err.message)
    })

    global.printer = printer
  } catch (error) {
    console.warn(
      '⚠️  SerialPort não disponível. Usando fallback no navegador.'
    )
  }
}

/**
 * Enviar buffer para porta serial
 */
function sendToSerialPort(buffer) {
  return new Promise((resolve, reject) => {
    if (!global.printer || !global.printer.isOpen) {
      reject(new Error('Impressora não conectada'))
      return
    }

    global.printer.write(buffer, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })
}

/**
 * Exemplo com biblioteca termica (wrapper do ESC/POS)
 * 
 * npm install termica
 */
function setupTermicaPrinter() {
  try {
    const Termica = require('termica')

    global.termica = new Termica({
      device: PRINTER_CONFIG.device,
      baudRate: PRINTER_CONFIG.baudRate,
    })

    global.termica.on('connected', () => {
      console.log('🖨️ Impressora Termica conectada')
    })

    global.termica.on('error', (err) => {
      console.error('❌ Erro:', err)
    })
  } catch (error) {
    console.warn('⚠️  Biblioteca Termica não disponível')
  }
}

/**
 * Health check da impressora
 */
app.get('/api/printer/status', (req, res) => {
  const isConnected = global.printer?.isOpen ?? false

  res.json({
    connected: isConnected,
    model: 'Elgin i8',
    paperWidth: 48,
    device: PRINTER_CONFIG.device,
  })
})

/**
 * Testar impressora
 */
app.post('/api/printer/test', async (req, res) => {
  try {
    const testContent = `
*** TESTE DE IMPRESSORA ***
Elgin i8
Data: ${new Date().toLocaleString('pt-BR')}
Tudo funcionando!
`

    // Enviar para impressora
    // await sendToSerialPort(Buffer.from(testContent))

    res.json({
      success: true,
      message: 'Teste enviado',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// Inicializar
const PORT = process.env.PORT || 3001

setupSerialPrinter()
setupTermicaPrinter()

app.listen(PORT, () => {
  console.log(`🚀 Servidor de impressão rodando na porta ${PORT}`)
  console.log(`📝 POST /api/print - Enviar para impressora`)
  console.log(`🔍 GET /api/printer/status - Status da impressora`)
  console.log(`⚙️  POST /api/printer/test - Testar impressora`)
})

/**
 * ALTERNATIVA: Usando socket.io para tempo real
 */
const io = require('socket.io')(3002, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  console.log('📡 Cliente conectado para impressão em tempo real')

  socket.on('print', async (data) => {
    try {
      // Enviar para impressora
      // await sendToSerialPort(Buffer.from(data.content))

      socket.emit('print-status', {
        success: true,
        message: 'Impresso com sucesso',
        jobId: data.jobId,
      })
    } catch (error) {
      socket.emit('print-error', {
        message: error.message,
        jobId: data.jobId,
      })
    }
  })
})

console.log('📡 WebSocket para impressão rodando na porta 3002')
