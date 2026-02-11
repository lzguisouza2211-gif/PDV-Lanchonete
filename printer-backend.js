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
    const data = ENABLE_CUT ? `${rawText}\n\x1d\x56\x41` : `${rawText}\n`;
    
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

app.post('/api/print', async (req, res) => {
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content vazio' });

  try {
    await writeToPrinter(content);
    console.log('✅ Impresso com sucesso');
    return res.json({ ok: true, mode: 'printer' });
  } catch (error) {
    console.error('❌ Falha ao imprimir:', error.message);
    // Fallback: aceita request mas só loga
    if (FALLBACK_MODE) {
      console.log('📄 MODO FALLBACK - Conteúdo recebido:');
      console.log('-------------------------------------------');
      console.log(content);
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
