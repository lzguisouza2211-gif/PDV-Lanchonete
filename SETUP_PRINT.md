# 🖨️ Setup Rápido - Sistema de Impressão

## ✅ O que foi implementado

### 1. **Serviços de Impressão**
- ✅ `printQueue.ts` - Fila com retry automático
- ✅ `elginPrinter.ts` - Formatação para Elgin i8
- ✅ `printerApi.ts` - API de comunicação

### 2. **Hooks React**
- ✅ `usePrinter.ts` - Hook para gerenciar impressões

### 3. **Componentes UI**
- ✅ `PrintButtons.tsx` - Botões de impressão no card
- ✅ `PrintQueueMonitor.tsx` - Monitor em dashboard

### 4. **Integração**
- ✅ Botões adicionados ao kanban (Admin.tsx)
- ✅ Monitor adicionado ao dashboard
- ✅ Callback de impressão registrado

### 5. **Documentação**
- ✅ `PRINT_SYSTEM.md` - Documentação completa
- ✅ `examples/printer-backend.js` - Exemplo de backend

---

## 🚀 Para usar agora (sem backend)

### 1. Teste o sistema
```bash
# No navegador:
# 1. Vá para Admin → Pedidos (kanban)
# 2. Clique em "🖨️ Imprimir" em qualquer card
# 3. Escolha "👨‍🍳 Produção" ou "🚗 Motoboy"
# 4. Uma janela se abrirá com o ticket formatado
# 5. A impressão será automática (Ctrl+P)
```

### 2. Testes Prévios
```bash
# No console do navegador (F12):
import { printQueue } from './services/printer/printQueue'
printQueue.getQueueStatus()  # Ver fila de impressão
```

---

## 🔗 Configurar Impressora Real (Elgin i8)

### Opção A: Via Backend Node.js (Recomendado)

#### 1. Criar servidor backend
```bash
cd seu-projeto
npm install express escpos-buffer serialport
```

#### 2. Criar `server.js` (copiar de `examples/printer-backend.js`)
```bash
# Adapte conforme necessário:
# - Device: /dev/ttyUSB0 (Linux) ou COM3 (Windows)
# - BaudRate: 9600
```

#### 3. Rodar servidor
```bash
node server.js
# 🚀 Servidor de impressão rodando na porta 3001
```

#### 4. Configurar Frontend
```typescript
// Editar em elginPrinter.ts se porta for diferente
const response = await fetch('/api/print', {
  // ou mudar para:
  // const response = await fetch('http://localhost:3001/api/print', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content })
})
```

### Opção B: Via WebSocket (Tempo Real)

```typescript
// Usar Socket.io para comunicação em tempo real
// Copie exemplos/socket.io do arquivo printer-backend.js
```

---

## 🎯 Fluxo de Impressão

```
┌──────────────────────┐
│ Clica em "Imprimir"  │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────┐
│ Menu: Produção/Motoboy   │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│ Gera conteúdo formatado  │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│ Adiciona à fila de print │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│ Aguarda impressora pronta│
└──────────┬───────────────┘
           │
           ├─→ [API Backend] → Impressora Elgin i8
           │
           └─→ [Fallback] → Navegador (Ctrl+P)
```

---

## 📋 Tipos de Impressão

### 👨‍🍳 Produção (para cozinha)
```
QUANTIDADE + NOME DO PRODUTO
├─ Adicionais/Extras
├─ Observações
└─ #ID do Pedido + Cliente
```

### 🚗 Motoboy (para entrega)
```
PEDIDO #ID
├─ Cliente
├─ Endereço de Entrega
├─ APENAS: Bebidas, Cervejas, Doces
├─ Valores
├─ Forma de Pagamento
└─ Troco
```

---

## 🔧 Customizações Comuns

### 1. Mudar largura da impressora
```typescript
// src/services/printer/elginPrinter.ts
new ElginI8Printer({
  paperWidth: 32,  // Para 58mm (padrão: 48 para 80mm)
  useCuts: true,
})
```

### 2. Adicionar mais categorias para motoboy
```typescript
// src/services/printer/elginPrinter.ts
// Em generateMotoboy()
const categoriasMotoboy = [
  'Bebidas', 'Cervejas', 'Doces',
  'Sua Categoria' // ← Adicione aqui
]
```

### 3. Aumentar tentativas de retry
```typescript
// src/services/printer/printQueue.ts
MAX_RETRIES = 5  // De 3 para 5
```

### 4. Desativar corte automático
```typescript
// src/services/printer/elginPrinter.ts
new ElginI8Printer({
  useCuts: false,  // Sem corte
})
```

---

## 📊 Monitor da Fila

Aparece automaticamente no Dashboard quando há trabalhos:

```
🖨️ Fila de Impressão     [⏳ Imprimindo...]
├─ 👨‍🍳 Produção - Imprimindo... (0 retries)
├─ 🚗 Motoboy - Concluído (0 retries)
└─ 👨‍🍳 Produção - Aguardando... (1 retentativa)
```

---

## 🐛 Troubleshooting

### Impressão não funciona?
1. Abra console (F12)
2. Procure por erros em vermelho
3. Se mostrar "API não disponível", é esperado (usando fallback)
4. Janela do navegador deve abrir automaticamente

### Fila travada?
```javascript
// No console:
import { printQueue } from './services/printer/printQueue'
printQueue.clearQueue()  // Limpa
```

### Botões não aparecem?
- Verifique se `PrintButtons.tsx` foi importado em `Admin.tsx`
- Verifique se não há erro de compilação (npm run dev)

### Fallback (navegador) ativado?
- Significa que `/api/print` não está disponível
- Isso é normal se não tiver backend
- Use Ctrl+P para imprimir

---

## 📁 Arquivos Criados

```
src/
├── services/printer/
│   ├── printQueue.ts          (145 linhas)
│   ├── elginPrinter.ts        (320 linhas)
│   └── printerApi.ts          (80 linhas)
├── hooks/
│   └── usePrinter.ts          (90 linhas)
├── components/admin/
│   ├── PrintButtons.tsx       (200 linhas)
│   └── PrintQueueMonitor.tsx  (180 linhas)
└── pages/admin/
    ├── Admin.tsx              (ATUALIZADO)
    └── Dashboard.tsx          (ATUALIZADO)

Documentação:
├── PRINT_SYSTEM.md            (400+ linhas)
└── examples/
    └── printer-backend.js     (250 linhas)
```

---

## ✨ Próximos Passos Opcionais

1. **Backend Node.js** - Usar `examples/printer-backend.js`
2. **Histórico de Impressões** - Salvar em BD quando impresso
3. **Múltiplas Impressoras** - Suporte para 2+ impressoras
4. **Impressão em Lote** - Selecionar vários pedidos
5. **Customização de Template** - Usuário editar formato

---

## 💡 Dicas

- **Teste com navegador primeiro** (sem backend)
- **Use o Monitor** para verificar fila em tempo real
- **Retry automático** evita problemas de conexão
- **Fallback para navegador** sempre funciona
- **Console (F12)** mostra logs de impressão

---

## 📞 Dúvidas?

Consulte `PRINT_SYSTEM.md` para documentação completa.
