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

async function writeToPrinter(rawText) {
  return new Promise((resolve, reject) => {
    // ESC/POS commands:
    // \x1B@ = Reset
    // \x1B\x61\x00 = Align LEFT (ESC a 0)
    // \x1B\x4D\x00 = Font A
    // \x1D\x57\x40\x02 = Print width 80mm
    // \x1D\x4C\x00\x00 = Left margin 0
    // \x1D\x56\x41 = Cut paper
    const init = '\x1B@\x1B\x61\x00\x1B\x4D\x00\x1D\x57\x40\x02\x1D\x4C\x00\x00';
    const data = ENABLE_CUT ? `${init}${rawText}\n\x1D\x56\x41` : `${init}${rawText}\n`;
    
    if (IS_WINDOWS) {
      // Windows: cria arquivo PRN e copia para impressora via comando net use
      const tempFile = `${os.tmpdir()}\\print_${Date.now()}.prn`;
      fs.writeFileSync(tempFile, data, 'binary');
      
      // Usa notepad para imprimir (funciona com qualquer impressora Windows)
      exec(`notepad /p "${tempFile}"`, (err) => {
        setTimeout(() => {
          try { fs.unlinkSync(tempFile); } catch(e) {}
        }, 2000);
        if (err) return reject(err);
        resolve();
      });
    } else {
      // Linux: escreve direto no device
      fs.writeFile(PRINTER_PATH, data, (err) => {
        if (err) return reject(err);
        resolve();
      });
    }
  });
}

// Formata pedido em texto para impressão (ELGIN I8: 48 colunas)
function formatPedidoReceipt(pedido) {
  const linhas = [];
  const WIDTH = 48; // Largura máxima da impressora térmica
  
  // Separadores (48 caracteres)
  const sep = '='.repeat(WIDTH);
  const sepDash = '-'.repeat(WIDTH);
  
  // Helper para centralizar texto
  function center(text, width = WIDTH) {
    const padding = Math.max(0, width - text.length);
    const left = Math.floor(padding / 2);
    const right = padding - left;
    return ' '.repeat(left) + text + ' '.repeat(right);
  }
  
  // Helper para alinhar esquerda e direita
  function alignLR(left, right, width = WIDTH) {
    const space = width - left.length - right.length;
    return left + ' '.repeat(Math.max(0, space)) + right;
  }
  
  linhas.push(sep);
  linhas.push(center('PEDIDO DE PRODUCAO'));
  linhas.push(sep);
  linhas.push('');
  
  linhas.push('PEDIDO #' + (pedido.pedidoId || 'SEM ID'));
  
  if (pedido.cliente) {
    const cliente = pedido.cliente;
    if (cliente.length > WIDTH - 2) {
      linhas.push(cliente.substring(0, WIDTH - 2) + '...');
    } else {
      linhas.push(cliente);
    }
  }
  
  linhas.push('');
  linhas.push(sepDash);
  
  // Itens
  if (Array.isArray(pedido.items) && pedido.items.length > 0) {
    pedido.items.forEach(item => {
      const qtd = (item.quantidade || 1).toString().padStart(2, ' ');
      let nome = item.nome || 'Item sem nome';
      
      // Se nome é muito longo, truncar
      const maxNome = WIDTH - 7; // 2 (qtd) + 2 (x ) + 3 espaços
      if (nome.length > maxNome) {
        nome = nome.substring(0, maxNome - 1) + '…';
      }
      
      linhas.push(qtd + 'x ' + nome);
      
      if (item.observacao) {
        const obs = item.observacao;
        if (obs.length > WIDTH - 6) {
          linhas.push('  Obs: ' + obs.substring(0, WIDTH - 9) + '…');
        } else {
          linhas.push('  Obs: ' + obs);
        }
      }
      
      if (item.adicionais && item.adicionais.length > 0) {
        item.adicionais.forEach(add => {
          const adText = (add || '').substring(0, WIDTH - 5);
          linhas.push('    + ' + adText);
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
    linhas.push(alignLR('TOTAL:', total));
  }
  
  // Pagamento
  if (pedido.pagamento) {
    const pag = pedido.pagamento.toUpperCase();
    linhas.push(alignLR('PAG:', pag));
  }
  
  // Observações gerais
  if (pedido.observacao) {
    linhas.push('');
    linhas.push(center('OBSERVACOES'));
    const obs = pedido.observacao;
    if (obs.length > WIDTH - 2) {
      // Quebrar em múltiplas linhas
      for (let i = 0; i < obs.length; i += WIDTH - 2) {
        linhas.push(obs.substring(i, i + WIDTH - 2));
      }
    } else {
      linhas.push(obs);
    }
  }
  
  linhas.push('');
  linhas.push(sep);
  linhas.push('');
  linhas.push('');
  
  return linhas.join('\n');
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
