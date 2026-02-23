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

// ================= CONFIG =================

const WIDTH = 42

const ESC = '\x1B'
const GS = '\x1D'

const INIT = ESC + '@'
const ALIGN_LEFT = ESC + '\x61\x00'
const ALIGN_CENTER = ESC + '\x61\x01'
const ALIGN_RIGHT = ESC + '\x61\x02'

const BOLD_ON = ESC + '\x45\x01'
const BOLD_OFF = ESC + '\x45\x00'

const NORMAL_SIZE = GS + '\x21\x00'
const DOUBLE_SIZE = GS + '\x21\x11'

const CUT = GS + '\x56\x41'
const BEEP = ESC + '\x42\x03\x02' // beep impressora

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

function wrapText(text, width = WIDTH) {
  text = normalize(text)
  const words = text.split(' ')
  const lines = []
  let line = ''

  for (const word of words) {
    if ((line + word).length >= width) {
      lines.push(line.trim())
      line = ''
    }
    line += word + ' '
  }

  if (line) lines.push(line.trim())
  return lines
}

function formatItemLine(nome, qtd, preco) {
  const right = `R$ ${preco}`
  const maxLeft = WIDTH - right.length - 1
  const lines = wrapText(`${qtd}x ${nome}`, maxLeft)

  let result = ''
  lines.forEach((l, i) => {
    if (i === 0) result += leftRight(l, right) + '\n'
    else result += ' '.repeat(4) + l + '\n'
  })

  return result
}

// ================= DRIVER =================

async function writeToPrinter(text) {
  return new Promise((resolve, reject) => {
    const data = INIT + ALIGN_LEFT + NORMAL_SIZE + BEEP + text + '\n' + CUT

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

// ================= TEMPLATE COZINHA =================

function formatKitchenTicket(pedido) {
  let out = ''

  out += ALIGN_CENTER
  out += BOLD_ON + DOUBLE_SIZE
  out += center('COZINHA') + '\n'
  out += NORMAL_SIZE + BOLD_OFF
  out += line('=') + '\n'

  if (pedido.tipo) {
    out += BOLD_ON + center(pedido.tipo.toUpperCase()) + '\n' + BOLD_OFF
    out += line('-') + '\n'
  }

  out += ALIGN_LEFT
  out += leftRight('Pedido:', pedido.pedidoId || '') + '\n'

  if (pedido.cliente)
    wrapText(`Cliente: ${pedido.cliente}`).forEach(l => out += l + '\n')

  out += line('-') + '\n'

  pedido.items?.forEach(item => {
    const qtd = item.qty || item.quantidade || 1
    const nome = item.name || item.nome || ''

    out += BOLD_ON
    wrapText(`${qtd}x ${nome}`).forEach(l => out += l + '\n')
    out += BOLD_OFF

    if (item.observacao)
      wrapText(`Obs: ${item.observacao}`, WIDTH - 2)
        .forEach(l => out += '  ' + l + '\n')

    if (item.adicionais)
      item.adicionais.forEach(a =>
        wrapText(`+ ${a}`, WIDTH - 4)
          .forEach(l => out += '   ' + l + '\n')
      )

    out += '\n'
  })

  out += '\n\n'
  return out
}

// ================= TEMPLATE CLIENTE =================

function formatClienteTicket(pedido) {
  let out = ''

  out += ALIGN_CENTER
  out += BOLD_ON + DOUBLE_SIZE
  out += center(pedido.company?.name || 'Luizão-Lanches') + '\n'
  out += NORMAL_SIZE + BOLD_OFF

  out += center('RECIBO') + '\n'
  out += line('=') + '\n'

  if (pedido.tipo) {
    out += BOLD_ON + center(pedido.tipo.toUpperCase()) + '\n' + BOLD_OFF
    out += line('-') + '\n'
  }

  out += ALIGN_LEFT
  out += leftRight('Pedido:', pedido.pedidoId || '') + '\n'
  out += leftRight('Data:', new Date().toLocaleString('pt-BR')) + '\n'

  if (pedido.cliente)
    wrapText(`Cliente: ${pedido.cliente}`).forEach(l => out += l + '\n')

  out += line('-') + '\n'

  pedido.items?.forEach(item => {
    const qtd = item.qty || item.quantidade || 1
    const nome = item.name || item.nome || ''
    const preco = Number(item.price || item.preco || 0).toFixed(2)

    out += formatItemLine(nome, qtd, preco)
  })

  out += line('=') + '\n'

  if (pedido.total) {
    out += ALIGN_CENTER
    out += BOLD_ON + DOUBLE_SIZE
    out += `TOTAL R$ ${Number(pedido.total).toFixed(2)}\n`
    out += NORMAL_SIZE + BOLD_OFF
  }

  if (pedido.payment || pedido.pagamento)
    out += ALIGN_LEFT + leftRight('Pagamento:', pedido.payment || pedido.pagamento) + '\n'

  out += '\n'
  out += ALIGN_CENTER
  out += center('Obrigado pela preferencia!') + '\n'
  out += '\n\n\n'

  return out
}

// ================= API =================

app.post('/api/print', async (req, res) => {
  try {
    const { content, ...pedido } = req.body || {}

    if (content) {
      await writeToPrinter(content)
      return res.json({ success: true })
    }

    if (!pedido.items && !pedido.pedidoId)
      return res.status(400).json({ error: 'Envie content ou dados do pedido' })

    // impressão dupla automática
    await writeToPrinter(formatKitchenTicket(pedido))
    await writeToPrinter(formatClienteTicket(pedido))

    res.json({ success: true, mode: 'duplo' })

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
  console.log('Modo: COZINHA + CLIENTE + BEEP')
  console.log('===================================')
})