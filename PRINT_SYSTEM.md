# 🖨️ Sistema de Impressão de Pedidos

Sistema completo de impressão térmica para pedidos em impressora **Elgin i8**. Inclui suporte para múltiplos tipos de impressão com fila robusta e retry automático.

## 📋 Características

### ✅ Funcionalidades Implementadas

1. **Impressão de Produção** 👨‍🍳
   - Exibe quantidade, nome do produto, personalizações
   - Mostra observações do cliente
   - Informações de identificação (pedido #ID e cliente)
   - Ideal para cozinha preparar os itens

2. **Impressão de Motoboy** 🚗
   - Apenas bebidas, cervejas e doces
   - Informações de entrega (endereço)
   - Valores totais e forma de pagamento
   - Troco se aplicável
   - Ideal para motoboy saber o que entregar

3. **Fila de Impressão** 📄
   - Processa pedidos sequencialmente (sem conflitos)
   - Retry automático (até 3 tentativas)
   - Backoff exponencial entre tentativas
   - Status em tempo real

4. **Monitor de Fila** 📊
   - Visível no Dashboard
   - Mostra trabalhos pendentes, imprimindo e concluídos
   - Estatísticas de retries

## 🎯 Como Usar

### 1. Acessar Kanban de Pedidos
```
Painel Admin → Pedidos
```

### 2. Imprimir um Pedido
Cada card do kanban tem um botão **🖨️ Imprimir**:

```
[Card do Pedido]
├─ Cliente: João Silva
├─ 📦 Entrega
├─ 💳 Dinheiro
├─ R$ 45.50
└─ [🖨️ Imprimir] ← Clique aqui
```

### 3. Menu de Opções
Ao clicar no botão, abre um menu:

```
┌─────────────────┐
│ 👨‍🍳 Produção  │ ← Imprimir para cozinha
│ 🚗 Motoboy     │ ← Imprimir só bebidas (se entrega)
│ ✕ Fechar       │
└─────────────────┘
```

### 4. Monitor de Fila
No Dashboard, você verá o status:

```
🖨️ Fila de Impressão     [⏳ Imprimindo...]
├─ 👨‍🍳 Produção - Imprimindo...
├─ 🚗 Motoboy - Concluído
└─ (Nenhum trabalho na fila quando vazio)
```

## 📝 Formato de Impressão

### Ticket de Produção
```
*** TICKET DE PRODUÇÃO ***
------------------------------------------------
PEDIDO #123
14:35

CLIENTE: João Silva
------------------------------------------------

ITENS A PREPARAR:

2x Hambúrguer
  + Extras:
    • Bacon
    • Queijo Extra
  📝 Sem Cebola

1x Batata Frita

------------------------------------------------
Aguarde o ticket de entrega

[CORTE AUTOMÁTICO]
```

### Ticket de Motoboy
```
*** TICKET DE ENTREGA ***
------------------------------------------------
PEDIDO #123

CLIENTE: João Silva

📍 ENDEREÇO DE ENTREGA:
------
Rua das Flores, 123 - Apt 402

BEBIDAS/DOCES:
-------
2x Refrigerante 2L
1x Cerveja Brahma 600ml

VALORES:
Subtotal:         R$ 45.50
Pagamento:        DINHEIRO
Troco para:       R$ 54.50

------------------------------------------------
Entrega confirmada

[CORTE AUTOMÁTICO]
```

## 🔧 Configuração

### Largura da Impressora
Por padrão, configurada para **48 caracteres** (impressora térmica 80mm):

```typescript
// src/services/printer/elginPrinter.ts
new ElginI8Printer({
  paperWidth: 48,      // Largura em caracteres
  useCuts: true,       // Ativar corte automático
})
```

Para alterar:
```typescript
// Se sua impressora tem largura diferente
paperWidth: 32  // Para 58mm
paperWidth: 56  // Para 80mm com margem
```

### Categorias Detectadas (Motoboy)
As seguintes palavras-chave identificam items para impressão de motoboy:
- `bebida`
- `cerveja`
- `chopp`
- `refrigerante`
- `suco`
- `agua`
- `doce`

Para adicionar mais:
```typescript
// src/services/printer/elginPrinter.ts - generateMotoboy()
const itensBebidasDoces = itensEntrega.filter((item: any) => {
  const nome = (item.nome || '').toLowerCase()
  return (
    nome.includes('bebida') ||
    nome.includes('cerveja') ||
    nome.includes('sua_categoria') // ← Adicione aqui
  )
})
```

## 🔌 Integração com Impressora Real

### Via API Backend (Recomendado)
Se tiver um servidor backend para controlar a impressora:

1. **Endpoint da API:**
```
POST /api/print
Content-Type: application/json

{
  "content": "... conteúdo ESC/POS ...",
  "printerName": "ELGIN_I8"
}

Response:
{
  "success": true,
  "jobId": "print-1234567890"
}
```

2. **O sistema automaticamente tentará esta rota**
   - Se falhar, volta para fallback (navegador)

### Fallback no Navegador
Se não houver API, a impressão é feita via navegador:
- Abre janela de impressão
- Formata para leitura clara
- Auto-print em 0.5s
- Fecha após 2s

## ⚙️ Lógica de Retry

### Fluxo Automático
```
┌─────────────┐
│ Novo trabalho│
└──────┬──────┘
       ↓
┌──────────────────┐
│ Fila (não bloqueia)│
└──────┬───────────┘
       ↓
┌───────────────────────┐
│ Aguarda printer pronto │
└──────┬────────────────┘
       ↓
┌──────────────┐
│ Tenta imprimir│
└──────┬───────┘
       ↓
    SUCESSO?
    ├─ Sim → Marca completo ✅
    └─ Não → Retenta com delay
            (até 3x com backoff)
            ├─ Falha após Max → Marca erro ❌
```

### Configuração de Retry
```typescript
// src/services/printer/printQueue.ts
INITIAL_DELAY = 500      // 500ms entre retries
MAX_RETRIES = 3          // Até 3 tentativas
RETRY_BACKOFF = 1000     // +1000ms a cada retry
```

## 🛠️ Desenvolvimento

### Estrutura de Arquivos
```
src/
├── services/printer/
│   ├── printQueue.ts      ← Gerencia fila com retry
│   ├── elginPrinter.ts    ← Formata tickets
│   └── printerApi.ts      ← Comunica com backend
├── hooks/
│   └── usePrinter.ts      ← Hook React para impressão
├── components/admin/
│   ├── PrintButtons.tsx   ← UI dos botões
│   └── PrintQueueMonitor.tsx ← Monitor em tempo real
└── pages/admin/
    ├── Admin.tsx          ← Integração no kanban
    └── Dashboard.tsx      ← Monitor na dashboard
```

### Usar o Sistema

#### 1. Imprimir um Pedido
```typescript
import { usePrinter } from '../../hooks/usePrinter'
import { Pedido } from '../../services/api/pedidos.service'

function MeuComponente() {
  const { printProducao, printMotoboy, status } = usePrinter()
  const meuPedido: Pedido = { ... }

  return (
    <button onClick={() => printProducao(meuPedido)}>
      Imprimir Produção
    </button>
  )
}
```

#### 2. Gerar Conteúdo de Impressão
```typescript
import { elginPrinter } from '../../services/printer/elginPrinter'
import { Pedido } from '../../services/api/pedidos.service'

const pedido: Pedido = { ... }

// Produção
const contentProducao = elginPrinter.generateProducao(pedido)

// Motoboy
const contentMotoboy = elginPrinter.generateMotoboy(pedido)

// Completo
const contentCompleto = elginPrinter.generateCompleto(pedido)
```

#### 3. Adicionar à Fila Manualmente
```typescript
import { printQueue } from '../../services/printer/printQueue'

// Registrar callback (faça uma vez)
printQueue.registerPrintCallback(async (job) => {
  // Sua lógica de impressão aqui
  console.log('Imprimindo:', job)
})

// Adicionar trabalho
await printQueue.addJob('producao', { pedido, content }, 3)
```

## 📊 Monitoramento

### Verificar Status da Fila
```typescript
import { printQueue } from '../../services/printer/printQueue'

const status = printQueue.getQueueStatus()
console.log(status)
// {
//   size: 2,
//   isPrinting: true,
//   jobs: [
//     { id: 'print-123...', type: 'producao', status: 'printing', retries: 0 },
//     { id: 'print-456...', type: 'motoboy', status: 'pending', retries: 0 }
//   ]
// }
```

### Limpar Fila
```typescript
printQueue.clearQueue()
```

## 🚀 Próximas Melhorias

- [ ] Integração com WebSocket para tempo real
- [ ] Histórico de impressões por pedido
- [ ] Marcar se foi impresso no banco de dados
- [ ] Reprimir pedido (guardar último formato)
- [ ] Customização de templates por usuário
- [ ] Impressão em lote (selecionar vários pedidos)
- [ ] Estatísticas de impressão/hora
- [ ] Sincronização com múltiplas impressoras

## 🐛 Troubleshooting

### Impressora não funciona
1. Abra o console (F12)
2. Verifique se há erros de conectividade
3. Confirme que `/api/print` está disponível
4. Tente usar o fallback do navegador (Ctrl+P)

### Fila travada
```typescript
// Limpe a fila no console
import { printQueue } from './services/printer/printQueue'
printQueue.clearQueue()
```

### Formatos desalinhados
Ajuste `paperWidth` em `elginPrinter.ts` conforme sua impressora

## 📞 Suporte

Para dúvidas ou problemas com a impressora Elgin i8:
- [Documentação Elgin](https://www.elgin.com.br/)
- [Comandos ESC/POS](https://www.elgin.com.br/downloads/)
