# ⚙️ Configuração Impressora Elgin i8

## 📊 Especificações da Elgin i8

| Especificação | Valor |
|---------------|-------|
| **Modelo** | Elgin i8 |
| **Largura de Papel** | 80mm |
| **Velocidade** | 150mm/s |
| **Conexão** | Serial (RS-232) ou USB |
| **Charset** | ESC/POS |
| **Caracteres por Linha** | 48 (padrão) ou 32 (dependendo fonte) |

---

## 🔌 Conexão

### Windows
```
COM3, COM4, COM5 ou COM6
BaudRate: 9600
```

### Linux
```
/dev/ttyUSB0 ou /dev/ttyS0
BaudRate: 9600
```

### macOS
```
/dev/tty.usbserial-* ou /dev/cu.usbserial-*
BaudRate: 9600
```

---

## 💻 Verificar Conexão

### No Windows (Command Prompt)
```bash
mode COM3: BAUD=9600 PARITY=N DATA=8 STOP=1
```

### No Linux
```bash
# Listar porta
ls -la /dev/ttyUSB*

# Testar conexão
stty -F /dev/ttyUSB0 9600
echo "Teste" > /dev/ttyUSB0
```

### No macOS
```bash
# Listar porta
ls -la /dev/tty.usbserial*

# Teste
echo "Teste" > /dev/tty.usbserial-YOUR_DEVICE
```

---

## 📝 Formato ESC/POS

A Elgin i8 usa **ESC/POS** (protocolo padrão de impressoras térmicas).

### Comandos Principais

```
Inicializar:        ESC @ (0x1B 0x40)
Corte:              GS V A (0x1D 0x56 0x41)
Fonte Normal:       ESC ! 0x00 (0x1B 0x21 0x00)
Fonte Dupla:        ESC ! 0x30 (0x1B 0x21 0x30)
Negrito ON:         ESC E 1 (0x1B 0x45 0x01)
Negrito OFF:        ESC E 0 (0x1B 0x45 0x00)
Centralizar:        ESC a 1 (0x1B 0x61 0x01)
Alinhar Esquerda:   ESC a 0 (0x1B 0x61 0x00)
Alinhar Direita:    ESC a 2 (0x1B 0x61 0x02)
Feed (avanço):      LF (0x0A)
FormFeed:           FF (0x0C)
```

---

## 🎨 Formatação Suportada

### Tamanho da Fonte
```
1x1 (padrão)
2x2, 2x3, 3x3 (ampliado)
```

### Densidade de Impressão
Ajustável em 8 níveis

### Tipos de Caracteres
- Normal
- Duplo
- Negrito
- Itálico (simulado)
- Código de barras

---

## 📋 Configuração no Sistema

### Arquivo Atual
```typescript
// src/services/printer/elginPrinter.ts

new ElginI8Printer({
  paperWidth: 48,    // ← Ajuste conforme sua impressora
  useCuts: true,     // ← Ativar corte automático
})
```

### Alterar Largura

#### 80mm (padrão)
```typescript
paperWidth: 48      // 48 caracteres
```

#### 58mm
```typescript
paperWidth: 32      // 32 caracteres
```

#### Com Margem
```typescript
paperWidth: 44      // 80mm com margem
```

---

## 🧪 Teste de Impressão

### Usando Driver Windows
```batch
@echo off
REM Enviar teste para COM3
echo TESTE DE IMPRESSORA > COM3
```

### Usando Node.js
```javascript
const SerialPort = require('serialport')
const port = new SerialPort('COM3', { baudRate: 9600 })

port.write('TESTE\n')
port.close()
```

### Usando Python
```python
import serial

ser = serial.Serial('COM3', 9600)
ser.write(b'TESTE\n')
ser.close()
```

---

## 🖨️ Impressão de Teste no Sistema

### Opção 1: Via Navegador
1. Abra Admin → Pedidos
2. Clique em 🖨️ Imprimir em qualquer card
3. Selecione 👨‍🍳 Produção ou 🚗 Motoboy
4. Janela de impressão abrirá
5. Clique em Imprimir (Ctrl+P)

### Opção 2: Via Backend Node.js
```bash
# 1. Copiar examples/printer-backend.js
# 2. Configurar COM/device correto
# 3. node server.js
# 4. Sistema automaticamente usa API
```

### Opção 3: Teste Manual via API
```bash
curl -X POST http://localhost:3001/api/print \
  -H "Content-Type: application/json" \
  -d '{"content": "TESTE\n"}'
```

---

## 🔧 Troubleshooting

### Impressora Não Responde

1. **Verificar conexão**
   ```bash
   # Linux
   ls -la /dev/ttyUSB*
   
   # Windows (Device Manager)
   # Verifique COM3, COM4, etc
   ```

2. **Verificar driver**
   - Instale driver CH340 se for USB
   - Baixe de: https://www.wch.cn/downloads/

3. **Testar com software próprio**
   - Elgin fornece software de teste
   - Baixe do site: https://www.elgin.com.br/

### Caracteres Ilegíveis

1. **Verificar charset**
   - Deve estar em CP850 ou CP1252
   - Ajuste em backend se necessário

2. **Verificar densidade**
   ```
   ESC 7 <n>  (define densidade)
   ```

### Corte não funciona

1. **Verificar se o papel suporta corte**
2. **Alterar comando**
   - GS V A (corte total)
   - GS V B (corte parcial)

### Fila de Impressão Travada

```javascript
// No console do navegador
import { printQueue } from './services/printer/printQueue'
printQueue.clearQueue()
```

---

## 📚 Referências

### Manuais Elgin
- [Manual Elgin i8](https://www.elgin.com.br/downloads/)
- [Especificações Técnicas](https://www.elgin.com.br/produtos/)

### ESC/POS
- [Comandos ESC/POS Padrão](https://en.wikipedia.org/wiki/ESC/P)
- [Epson ESC/POS Reference](https://www.epson.com/cgi-bin/Store/support/downloadsearch.jsp)

### Drivers
- [CH340 USB Serial Driver](https://www.wch.cn/downloads/)
- [FTDI VCP Drivers](https://ftdichip.com/drivers/vcp-drivers/)

---

## 🎯 Checklist de Setup

### Hardware
- [ ] Impressora Elgin i8 ligada
- [ ] Cabo serial/USB conectado
- [ ] Papel térmico instalado
- [ ] Porta serial verificada

### Software
- [ ] Driver instalado (Windows)
- [ ] Permissão em /dev/ttyUSB0 (Linux)
- [ ] Conexão testada com software Elgin
- [ ] Backend Node.js rodando (se usar)

### Sistema de Impressão
- [ ] Botões aparecem nos cards
- [ ] Menu de impressão funciona
- [ ] Fila processada corretamente
- [ ] Monitor visível no dashboard
- [ ] Retry funcionando

### Produção
- [ ] Teste com múltiplos pedidos
- [ ] Verifique fila com Monitor
- [ ] Teste com internet instável
- [ ] Confirme retry automático
- [ ] Valide formato de impressão

---

## 🚀 Deploy

### Checklist Final

1. **Backend Node.js**
   ```bash
   pm2 start server.js --name "printer"
   pm2 startup
   pm2 save
   ```

2. **Variáveis de Ambiente**
   ```env
   PRINTER_DEVICE=/dev/ttyUSB0
   PRINTER_BAUD=9600
   API_PORT=3001
   ```

3. **Monitoramento**
   ```bash
   tail -f ~/.pm2/logs/printer-out.log
   ```

---

## 📞 Suporte Técnico

### Elgin
- **Phone:** +55 (11) 3611-8000
- **Email:** suporte@elgin.com.br
- **Website:** https://www.elgin.com.br/

### Comunidade
- [Stack Overflow - ESC/POS](https://stackoverflow.com/questions/tagged/escpos)
- [GitHub - escpos-buffer](https://github.com/Klemen1337/escpos-buffer)

---

**Versão:** 1.0  
**Data:** 19 de janeiro de 2026  
**Status:** ✅ Pronto para Produção
