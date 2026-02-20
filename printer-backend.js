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
const fs = require('fs')
const os = require('os')
const { exec } = require('child_process')

const IS_WINDOWS = os.platform() === 'win32'
const PRINTER_NAME = process.env.PRINTER_NAME || 'ELGIN'
const PRINTER_PATH = process.env.PRINTER_PATH || (IS_WINDOWS ? 'USB001' : '/dev/usb/lp1')
const API_PORT = Number(process.env.PRINTER_API_PORT || 4000)
const ENABLE_CUT = (process.env.PRINTER_ENABLE_CUT || 'true') !== 'false'
const FALLBACK_MODE = (process.env.PRINTER_FALLBACK_MODE || 'true') !== 'false'

// Libs para impressão USB no Windows
let escpos, escposUSB;
if (IS_WINDOWS) {
  try {
    escpos = require('escpos');
    escposUSB = require('escpos-usb');
    escpos.USB = escposUSB;
  } catch (e) {
    console.warn('⚠️ Biblioteca escpos-usb não disponível:', e.message);
  }
}

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '1mb' }))


// --- Helpers de formatação ESC/POS ---

// Remove acentos e caracteres incompatíveis com ESC/POS (ASCII)
function normalizeText(text) {
  if (!text) return '';
  // Remove acentos e converte para ASCII
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/[^\x20-\x7E\n]/g, '?'); // Substitui não-ASCII exceto \n
}

// Quebra texto em linhas de no máximo 'width' caracteres
function wrapText(text, width) {
  if (!text) return [];
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + (line ? ' ' : '') + word).length > width) {
      if (line) lines.push(line);
      line = word.length > width ? word.slice(0, width) : word;
    } else {
      line += (line ? ' ' : '') + word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Centraliza texto na largura
function centerText(text, width) {
  text = normalizeText(text);
  if (text.length >= width) return text.slice(0, width);
  const pad = width - text.length;
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

// Alinha esquerda/direita
function alignLeftRight(left, right, width) {
  left = normalizeText(left);
  right = normalizeText(right);
  const space = width - left.length - right.length;
  if (space < 0) return (left + ' ' + right).slice(0, width);
  return left + ' '.repeat(space) + right;
}

// Detecta largura real da impressora (Elgin i8: 32 ou 48 colunas)
function detectPrinterWidth() {
  // Tenta detectar via env, senão assume 32 (mais seguro para Elgin i8)
  const envWidth = Number(process.env.PRINTER_WIDTH);
  if (envWidth === 32 || envWidth === 48) return envWidth;
  // Heurística: se caminho padrão, assume 32, senão 48
  if (PRINTER_PATH.includes('lp1') || PRINTER_PATH.includes('usb')) return 32;
  return 48;
}

// Envia texto ESC/POS puro para impressora térmica Elgin i8
// Windows: usa escpos/escpos-usb (USB)
// Linux: escreve direto no device
async function writeToPrinter(rawText) {
  return new Promise(async (resolve, reject) => {
    const WIDTH = detectPrinterWidth();
    // Comando ESC/POS: Reset, alinhamento à esquerda, fonte A, largura, margem 0
    const widthCmd = WIDTH === 48 ? '\x1D\x57\x40\x02' : '\x1D\x57\x80\x01';
    const init = '\x1B@\x1B\x61\x00\x1B\x4D\x00' + widthCmd + '\x1D\x4C\x00\x00';
    const safeText = normalizeText(rawText);
    const data = ENABLE_CUT ? `${init}${safeText}\n\x1D\x56\x41` : `${init}${safeText}\n`;

    if (IS_WINDOWS) {
      // --- Impressão ESC/POS direta via USB usando escpos/escpos-usb ---
      try {
        if (!escpos || !escposUSB) throw new Error('escpos/escpos-usb não disponível');
        // Busca primeira impressora USB disponível (ou filtra por nome se necessário)
        const devices = escposUSB.findPrinter();
        if (!devices || devices.length === 0) throw new Error('Nenhuma impressora USB encontrada');
        // Usa a primeira impressora encontrada
        const device = new escpos.USB();
        const printer = new escpos.Printer(device);
        device.open(function(err){
          if (err) return reject(new Error('Erro ao abrir impressora USB: ' + err.message));
          // Envia comandos ESC/POS puros
          printer.raw(Buffer.from(data, 'ascii'));
          if (ENABLE_CUT) printer.cut();
          printer.close();
          resolve();
        });
      } catch (e) {
        return reject(new Error('ESC/POS USB: ' + e.message));
      }
    } else {
      // --- Impressão direta no device Linux (ex: /dev/usb/lp1) ---
      fs.writeFile(PRINTER_PATH, data, { encoding: 'ascii' }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    }
  });
}


// Formata pedido em texto para impressão (ajustado para Elgin i8)
function formatPedidoReceipt(pedido) {
  const WIDTH = detectPrinterWidth();
  const linhas = [];
  const sep = '='.repeat(WIDTH);
  const sepDash = '-'.repeat(WIDTH);

  linhas.push(sep);
  linhas.push(centerText('PEDIDO DE PRODUCAO', WIDTH));
  linhas.push(sep);
  linhas.push('');

  linhas.push(alignLeftRight('PEDIDO #', (pedido.pedidoId || 'SEM ID').toString(), WIDTH));

  if (pedido.cliente) {
    wrapText(pedido.cliente, WIDTH).forEach(l => linhas.push(l));
  }

  linhas.push('');
  linhas.push(sepDash);

  // Itens
  if (Array.isArray(pedido.items) && pedido.items.length > 0) {
    pedido.items.forEach(item => {
      const qtd = (item.quantidade || 1).toString().padStart(2, ' ');
      let nome = item.nome || 'Item sem nome';
      nome = normalizeText(nome);
      // Nome do item pode ser longo, quebra se necessário
      const itemLine = `${qtd}x ${nome}`;
      wrapText(itemLine, WIDTH).forEach((l, i) => linhas.push(i === 0 ? l : ' '.repeat(4) + l));

      // Observação do item
      if (item.observacao) {
        wrapText('Obs: ' + item.observacao, WIDTH - 2).forEach(l => linhas.push('  ' + l));
      }

      // Adicionais
      if (item.adicionais && item.adicionais.length > 0) {
        item.adicionais.forEach(add => {
          wrapText('+ ' + add, WIDTH - 4).forEach(l => linhas.push('    ' + l));
        });
      }
    });
  }

  linhas.push(sepDash);
  linhas.push('');

  // Total
  if (pedido.total !== undefined) {
    const total = typeof pedido.total === 'number'
      ? pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : pedido.total;
    linhas.push(alignLeftRight('TOTAL:', total, WIDTH));
  }

  // Pagamento
  if (pedido.pagamento) {
    const pag = (pedido.pagamento || '').toUpperCase();
    linhas.push(alignLeftRight('PAG:', pag, WIDTH));
  }

  // Observações gerais
  if (pedido.observacao) {
    linhas.push('');
    linhas.push(centerText('OBSERVACOES', WIDTH));
    wrapText(pedido.observacao, WIDTH).forEach(l => linhas.push(l));
  }

  linhas.push('');
  linhas.push(sep);
  linhas.push('');
  linhas.push('');

  // Normaliza todas as linhas para ASCII seguro
  return linhas.map(normalizeText).join('\n');
}

app.post('/api/print', async (req, res) => {
  const { content, pedidoId, cliente, items, total, pagamento, observacao } = req.body || {};
  
  // Se passou pedidoId, items ou cliente = é um pedido estruturado
  let texto = content;
  if (pedidoId || items) {
    const pedido = { pedidoId, cliente, items, total, pagamento, observacao };
    texto = formatPedidoReceipt(pedido);
  }
  
  if (!texto) return res.status(400).json({ error: 'Envie content ou pedido estruturado' });

  try {
    await writeToPrinter(texto);
    console.log('✅ Impresso com sucesso');
    return res.json({ ok: true, mode: 'printer' });
  } catch (error) {
    console.error('❌ Falha ao imprimir:', error.message);
    // Fallback: aceita request mas só loga
    if (FALLBACK_MODE) {
      console.log('📄 MODO FALLBACK - Conteúdo recebido:');
      console.log('-------------------------------------------');
      console.log(texto);
      console.log('-------------------------------------------');
      return res.json({ ok: true, mode: 'fallback', warning: 'Impressora indisponível' });
    }
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', async (req, res) => {
  // Checa se o arquivo da impressora existe (Linux) ou se está no Windows
  const printerAvailable = IS_WINDOWS ? true : fs.existsSync(PRINTER_PATH);
  res.json({
    ok: true,
    platform: os.platform(),
    printerName: IS_WINDOWS ? PRINTER_NAME : PRINTER_PATH,
    printerAvailable,
    fallbackMode: FALLBACK_MODE,
  });
});

// Lista portas disponíveis
app.get('/api/ports', async (req, res) => {
  // Lista apenas o caminho configurado
  res.json({ ok: true, ports: [PRINTER_PATH] });
});

app.listen(API_PORT, async () => {
  console.log(`🖨️  Printer API rodando em http://localhost:${API_PORT}`);
  console.log(`Plataforma: ${os.platform()}`);
  console.log(`Configuração: ${IS_WINDOWS ? `Impressora: ${PRINTER_NAME}` : `Device: ${PRINTER_PATH}`}`);
  console.log(`Corte automático: ${ENABLE_CUT}`);
  console.log(`Modo fallback: ${FALLBACK_MODE ? 'ATIVO' : 'desativado'}`);
  console.log('');
  console.log('Endpoints disponíveis:');
  console.log(`  POST http://localhost:${API_PORT}/api/print`);
  console.log(`  GET  http://localhost:${API_PORT}/api/health`);
  console.log(`  GET  http://localhost:${API_PORT}/api/ports`);
});
