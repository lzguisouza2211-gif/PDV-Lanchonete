'use strict'

// API para enviar texto ESC/POS para a Elgin i8 via serial/USB
// Modo de fallback: Se impressora não disponível, loga no console
// Variáveis de ambiente:
// PRINTER_SERIAL_PATH (padrão: auto-detect ou /dev/ttyUSB0)
// PRINTER_BAUD_RATE   (padrão: 9600)
// PRINTER_API_PORT    (padrão: 4000)
// PRINTER_ENABLE_CUT  (padrão: true)
// PRINTER_FALLBACK_MODE (padrão: true) - Aceita requests mesmo sem printer

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { SerialPort } = require('serialport')

const SERIAL_PATH = process.env.PRINTER_SERIAL_PATH || 'auto'
const BAUD_RATE = Number(process.env.PRINTER_BAUD_RATE || 9600)
const API_PORT = Number(process.env.PRINTER_API_PORT || 4000)
const ENABLE_CUT = (process.env.PRINTER_ENABLE_CUT || 'true') !== 'false'
const FALLBACK_MODE = (process.env.PRINTER_FALLBACK_MODE || 'true') !== 'false'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '1mb' }))

let detectedPrinterPath = null

// Auto-detecta impressora se modo auto
async function autoDetectPrinter() {
  try {
    const ports = await SerialPort.list()
    // Procura por USB/ACM (impressoras térmicas comuns)
    const candidates = ports.filter((p) =>
      p.path.includes('ttyUSB') || p.path.includes('ttyACM')
    )
    if (candidates.length > 0) {
      detectedPrinterPath = candidates[0].path
      console.log(`✅ Auto-detectado: ${detectedPrinterPath}`)
      return detectedPrinterPath
    }
    console.log('⚠️  Nenhuma impressora USB/ACM detectada')
    return null
  } catch (err) {
    console.error('Erro ao auto-detectar:', err.message)
    return null
  }
}

// Abre porta serial (cria apenas quando necessário)
let printerPort = null

async function getOrCreatePort() {
  const targetPath = SERIAL_PATH === 'auto' ? detectedPrinterPath : SERIAL_PATH
  
  if (!targetPath) {
    throw new Error('Porta não configurada e nenhuma impressora detectada')
  }

  // Reutiliza porta se já aberta
  if (printerPort && printerPort.path === targetPath && printerPort.isOpen) {
    return printerPort
  }

  // Fecha porta antiga se mudou
  if (printerPort && printerPort.isOpen) {
    printerPort.close()
  }

  // Cria nova porta
  printerPort = new SerialPort({
    path: targetPath,
    baudRate: BAUD_RATE,
    autoOpen: false,
  })

  return new Promise((resolve, reject) => {
    printerPort.open((err) => {
      if (err) return reject(err)
      console.log(`✅ Porta aberta: ${targetPath} @ ${BAUD_RATE}bps`)
      resolve(printerPort)
    })
  })
}

async function writeToPrinter(rawText) {
  try {
    const port = await getOrCreatePort()
    const data = ENABLE_CUT ? `${rawText}\n\x1d\x56\x41` : `${rawText}\n`
    
    return new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) return reject(err)
        port.drain((drainErr) => {
          if (drainErr) return reject(drainErr)
          resolve()
        })
      })
    })
  } catch (error) {
    throw error
  }
}

app.post('/api/print', async (req, res) => {
  const { content } = req.body || {}
  if (!content) return res.status(400).json({ error: 'content vazio' })

  try {
    await writeToPrinter(content)
    console.log('✅ Impresso com sucesso')
    return res.json({ ok: true, mode: 'printer' })
  } catch (error) {
    console.error('❌ Falha ao imprimir:', error.message)
    
    // Fallback: aceita request mas só loga
    if (FALLBACK_MODE) {
      console.log('📄 MODO FALLBACK - Conteúdo recebido:')
      console.log('-------------------------------------------')
      console.log(content)
      console.log('-------------------------------------------')
      return res.json({ ok: true, mode: 'fallback', warning: 'Impressora indisponível' })
    }
    
    return res.status(500).json({ error: error.message })
  }
})

app.get('/api/health', async (req, res) => {
  const targetPath = SERIAL_PATH === 'auto' ? detectedPrinterPath : SERIAL_PATH
  const printerAvailable = !!(printerPort && printerPort.isOpen)
  
  res.json({
    ok: true,
    serial: targetPath || 'não detectado',
    baud: BAUD_RATE,
    printerAvailable,
    fallbackMode: FALLBACK_MODE,
  })
})

// Lista portas disponíveis
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list()
    res.json({ ok: true, ports })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

app.listen(API_PORT, async () => {
  console.log(`🖨️  Printer API rodando em http://localhost:${API_PORT}`)
  console.log(`Configuração: ${SERIAL_PATH} @ ${BAUD_RATE}bps | corte: ${ENABLE_CUT}`)
  console.log(`Modo fallback: ${FALLBACK_MODE ? 'ATIVO' : 'desativado'}`)
  console.log('')
  
  // Auto-detecta se necessário
  if (SERIAL_PATH === 'auto') {
    await autoDetectPrinter()
  }
  
  // Lista todas as portas
  try {
    const ports = await SerialPort.list()
    const usbPorts = ports.filter((p) => p.path.includes('ttyUSB') || p.path.includes('ttyACM'))
    
    if (usbPorts.length > 0) {
      console.log('✅ Portas USB/ACM detectadas:')
      usbPorts.forEach((p) => console.log(`   - ${p.path} (${p.manufacturer || 'desconhecido'})`))
    } else {
      console.log('⚠️  Nenhuma impressora USB detectada')
      if (FALLBACK_MODE) {
        console.log('   Modo fallback ATIVO: API aceita requests e loga no console')
        console.log('   Conecte a impressora e reinicie o servidor')
      }
    }
  } catch (err) {
    console.error('Erro ao listar portas:', err.message)
  }
  
  console.log('')
  console.log('Endpoints disponíveis:')
  console.log(`  POST http://localhost:${API_PORT}/api/print`)
  console.log(`  GET  http://localhost:${API_PORT}/api/health`)
  console.log(`  GET  http://localhost:${API_PORT}/api/ports`)
})
