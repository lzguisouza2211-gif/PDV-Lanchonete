'use strict'

// API para imprimir via CUPS (sistema de impressão Linux)
// Mais simples que serial - usa comando 'lp' ou 'lpr'
// Variáveis de ambiente:
// PRINTER_NAME     (padrão: POS-80-2)
// PRINTER_API_PORT (padrão: 4000)

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

const PRINTER_NAME = process.env.PRINTER_NAME || 'POS-80-2'
const API_PORT = Number(process.env.PRINTER_API_PORT || 4000)

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '1mb' }))

async function printViaCUPS(content) {
  try {
    // Usa comando lp para imprimir
    const command = `echo "${content.replace(/"/g, '\\"')}" | lp -d ${PRINTER_NAME} -o raw`
    const { stdout, stderr } = await execAsync(command)
    
    if (stderr && !stderr.includes('request id')) {
      throw new Error(stderr)
    }
    
    console.log('✅ Enviado para CUPS:', stdout.trim())
    return true
  } catch (error) {
    throw error
  }
}

app.post('/api/print', async (req, res) => {
  const { content } = req.body || {}
  if (!content) return res.status(400).json({ error: 'content vazio' })

  try {
    await printViaCUPS(content)
    console.log('✅ Impresso com sucesso')
    return res.json({ ok: true, mode: 'cups', printer: PRINTER_NAME })
  } catch (error) {
    console.error('❌ Falha ao imprimir:', error.message)
    
    // Modo fallback: aceita mas só loga
    console.log('📄 FALLBACK - Conteúdo:')
    console.log('-------------------------------------------')
    console.log(content)
    console.log('-------------------------------------------')
    
    return res.json({ ok: true, mode: 'fallback', warning: error.message })
  }
})

app.get('/api/health', async (req, res) => {
  try {
    const { stdout } = await execAsync(`lpstat -p ${PRINTER_NAME} 2>&1`)
    const available = stdout.includes('habilitada') || stdout.includes('idle')
    
    res.json({
      ok: true,
      printer: PRINTER_NAME,
      available,
      status: stdout.trim(),
    })
  } catch (error) {
    res.json({
      ok: false,
      printer: PRINTER_NAME,
      available: false,
      error: error.message,
    })
  }
})

app.get('/api/ports', async (req, res) => {
  try {
    const { stdout } = await execAsync('lpstat -p -d 2>&1')
    res.json({ ok: true, printers: stdout })
  } catch (error) {
    res.json({ ok: false, error: error.message })
  }
})

app.listen(API_PORT, () => {
  console.log(`🖨️  Printer API (CUPS) rodando em http://localhost:${API_PORT}`)
  console.log(`Impressora configurada: ${PRINTER_NAME}`)
  console.log('')
  
  // Verifica status
  exec(`lpstat -p ${PRINTER_NAME} 2>&1`, (err, stdout) => {
    if (err) {
      console.log(`⚠️  Impressora ${PRINTER_NAME} não encontrada`)
      console.log('   Execute: lpstat -p -d para ver impressoras disponíveis')
    } else {
      const status = stdout.includes('habilitada') ? '✅' : '⚠️'
      console.log(`${status} Status: ${stdout.trim()}`)
    }
    
    console.log('')
    console.log('Endpoints disponíveis:')
    console.log(`  POST http://localhost:${API_PORT}/api/print`)
    console.log(`  GET  http://localhost:${API_PORT}/api/health`)
    console.log(`  GET  http://localhost:${API_PORT}/api/ports`)
  })
})
