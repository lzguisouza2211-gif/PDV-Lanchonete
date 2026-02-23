'use strict'

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const os = require('os')
const fs = require('fs')

const IS_WINDOWS = os.platform() === 'win32'
const API_PORT = process.env.PRINTER_API_PORT || 4000
const PRINTER_PATH = process.env.PRINTER_PATH || (IS_WINDOWS ? 'USB001' : '/dev/usb/lp1')

let escpos, escposUSB
if (IS_WINDOWS) {
  try {
    escpos = require('escpos')
    escposUSB = require('escpos-usb')
    escpos.USB = escposUSB
  } catch {}
}

const app = express()
app.use(cors())
app.use(bodyParser.json())

// ================= CONFIG ELGIN =================

const WIDTH = 32 // Elgin i8 sempre 32 colunas

const ESC = '\x1B'
const GS = '\x1D'

const INIT = ESC + '@'
const ALIGN_LEFT = ESC + '\x61\x00'
const ALIGN_CENTER = ESC + '\x61\x01'
const BOLD_ON = ESC + '\x45\x01'
const BOLD_OFF = ESC + '\x45\x00'
const NORMAL_SIZE = GS + '\x21\x00'
const DOUBLE_SIZE = GS + '\x21\x11'
const CUT = GS + '\x56\x41'

// ================= HELPERS =================

function normalize(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, '')
}

function center(text) {
  text = normalize(text)
  const space = Math.floor((WIDTH - text.length) / 2)
  return ' '.repeat(Math.max(0, space)) + text
}

function leftRight(left, right) {
  left = normalize(left)
  right = normalize(right)
  const space = WIDTH - left.length - right.length
  return left + ' '.repeat(Math.max(1, space)) + right
}

function line(char = '-') {
  return char.repeat(WIDTH)
}

// ================= DRIVER ESTÁVEL =================

async function writeToPrinter(text) {
  return new Promise((resolve, reject) => {
    const data = INIT + ALIGN_LEFT + NORMAL_SIZE + text + '\n' + CUT

    if (IS_WINDOWS) {
      try {
        const device = new escpos.USB()
        const printer = new escpos.Printer(device)

        device.open(err => {
          if (err) return reject(err)
          printer.raw(Buffer.from(data, 'binary'))
          printer.close()
          resolve()
        })
      } catch (e) {
        reject(e)
      }
    } else {
      fs.writeFile(PRINTER_PATH, data, { encoding: 'binary' }, err => {
        if (err) return reject(err)
        resolve()
      })
    }
  })
}

// ================= TEMPLATE AUTOMÁTICO =================

function formatPedidoReceipt(pedido) {
  let out = ''

  // ===== HEADER =====
  out += ALIGN_CENTER
  out += BOLD_ON + DOUBLE_SIZE
  out += center(pedido.company?.name || 'AUTO COLOR') + '\n'
  out += NORMAL_SIZE + BOLD_OFF

  out += center('PEDIDO') + '\n'
  out += line('=') + '\n'

  // ===== INFO PEDIDO =====
  out += ALIGN_LEFT
  out += leftRight('Pedido:', pedido.pedidoId || '') + '\n'
  out += leftRight('Data:', new Date().toLocaleString('pt-BR')) + '\n'

  if (pedido.cliente)
    out += `Cliente: ${normalize(pedido.cliente)}\n`

  out += line('-') + '\n'

  // ===== ITENS =====
  if (Array.isArray(pedido.items)) {
    pedido.items.forEach(item => {
      const qtd = item.qty || item.quantidade || 1
      const nome = normalize(item.name || item.nome || '')
      const preco = Number(item.price || item.preco || 0)
      const totalItem = (qtd * preco).toFixed(2)

      // nome do item destacado
      out += BOLD_ON
      out += leftRight(`${qtd}x ${nome}`, `R$ ${totalItem}`) + '\n'
      out += BOLD_OFF

      // observação
      if (item.observacao)
        out += `  Obs: ${normalize(item.observacao)}\n`

      // adicionais
      if (item.adicionais)
        item.adicionais.forEach(a => {
          out += `   + ${normalize(a)}\n`
        })

      out += '\n'
    })
  }

  // ===== TOTAL =====
  out += line('=') + '\n'

  if (pedido.total) {
    out += ALIGN_RIGHT
    out += BOLD_ON + DOUBLE_SIZE
    out += `TOTAL R$ ${Number(pedido.total).toFixed(2)}\n`
    out += NORMAL_SIZE + BOLD_OFF
    out += ALIGN_LEFT
  }

  if (pedido.payment || pedido.pagamento)
    out += leftRight('Pagamento:', pedido.payment || pedido.pagamento) + '\n'

  // ===== RODAPE =====
  out += '\n'
  out += ALIGN_CENTER
  out += center('Obrigado pela preferencia!') + '\n'
  out += center('Volte sempre') + '\n'
  out += '\n\n\n'

  return out
}

// ================= API (COMPATÍVEL COM SEU SISTEMA) =================

app.post('/api/print', async (req, res) => {
  try {
    const { content, ...pedido } = req.body || {}

    // Se veio texto pronto → imprime direto (igual seu backend antigo)
    let texto = content

    // Se veio pedido estruturado → gera layout profissional
    if (!texto && (pedido.items || pedido.pedidoId)) {
      texto = formatPedidoReceipt(pedido)
    }

    if (!texto)
      return res.status(400).json({ error: 'Envie content ou dados do pedido' })

    await writeToPrinter(texto)

    res.json({ success: true })
  } catch (e) {
    console.error('Erro impressão:', e.message)
    res.status(500).json({ error: e.message })
  }
})

// ================= HEALTH =================

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    platform: os.platform(),
    printer: PRINTER_PATH,
    width: WIDTH
  })
})

app.listen(API_PORT, () => {
  console.log('')
  console.log('===================================')
  console.log('🖨️ Printer Server Luizão-Lanches')
  console.log('===================================')
  console.log('Porta:', API_PORT)
  console.log('Plataforma:', os.platform())
  console.log('Largura: 32 colunas (Elgin i8)')
  console.log('Modo: COMPATÍVEL + PROFISSIONAL')
  console.log('===================================')
})