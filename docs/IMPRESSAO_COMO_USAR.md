# 🖨️ Sistema de Impressão - Luizão Lanches

## Sobre

Sistema de impressão para Elgin i8 (80mm) com suporte automático a fallback pelo navegador.

## Funcionamento Atual

### ✅ Funcionando
- **Botão de Impressão**: Aparece em cada card do kanban
- **Duas Opções de Impressão**:
  - 👨‍🍳 **Produção**: Mostra itens, quantidade, extras, observações
  - 🚗 **Motoboy**: Apenas bebidas/cervejas/doces + endereço + pagamento
- **Fallback Automático**: Se API não responder, abre janela do navegador (Ctrl+P)
- **Fila de Impressão**: Processa um trabalho por vez, sem conflitos
- **Monitor em Tempo Real**: Dashboard mostra status da fila

### 📦 Biblioteca
- **escpos**: Formatação correta para impressoras térmicas

## Como Testar

### 1. Teste via Navegador (Sem Printer)
```
1. Acesse: http://localhost:5173/admin
2. Clique em um pedido
3. Clique no botão 🖨️ (ou no card)
4. Selecione "Produção" ou "Motoboy"
5. Janela abrirá com preview
6. Pressione Ctrl+P ou clique "Imprimir"
```

### 2. Teste com API (Com Printer USB/Serial)
```
# Se tiver Elgin i8 conectada:
1. Copie examples/printer-backend.js
2. Instale: npm install express serialport
3. Configure a porta: /dev/ttyUSB0 (Linux) ou COM3 (Windows)
4. Execute: node printer-backend.js
5. Sistema usará automaticamente a API
```

## Formatos de Impressão

### 👨‍🍳 Produção
```
*** PRODUÇÃO ***
-----------------------------------------------
PEDIDO #1234
14:30

CLIENTE: João Silva
-----------------------------------------------

ITENS:
-----------------------------------------------

2x Hambúrguer Premium
  EXTRAS:
    + Bacon
    + Queijo Extra
  OBS: Sem cebola

1x Refrigerante 2L

-----------------------------------------------
Pronto para embalar

```

### 🚗 Motoboy
```
*** ENTREGA ***
-----------------------------------------------
PEDIDO #1234

CLIENTE: João Silva

ENDERECO:
-----------------------------------------------
Rua das Flores, 123, Apto 405
Bairro Centro

BEBIDAS/DOCES:
-----------------------------------------------
2x Refrigerante Coca-Cola 2L
1x Broto de Chocolate

-----------------------------------------------

VALORES:
Total:                    R$ 45.90
Pagamento:               CREDITO
Troco:                   R$ 4.10

-----------------------------------------------
OK para entregar

```

## Estrutura de Arquivos

```
src/services/printer/
├── elginPrinter.ts        # Serviço de impressão (formatos + fallback)
├── printQueue.ts          # Fila de impressão com retry
└── README.md              # Documentação técnica

src/hooks/
├── usePrinter.ts          # Hook com métodos de impressão
└── useCardapio.ts         # (Sem mudanças)

src/components/admin/
├── PrintButtons.tsx       # Botão + menu de seleção
├── PrintQueueMonitor.tsx  # Dashboard da fila
└── (Outros componentes)

src/pages/admin/
├── Admin.tsx              # Integração dos botões
└── Dashboard.tsx          # Monitor de fila
```

## Lógica de Retry

Se impressão falhar:
1. Tenta novamente após 500ms (espera 1)
2. Tenta novamente após 1500ms (espera 2)
3. Tenta novamente após 2500ms (espera 3)
4. Se falhar 3x, desiste e registra erro

Se API não responder → Abre navegador automaticamente

## Configuração

### Mudar Largura de Papel
Em `src/services/printer/elginPrinter.ts`:
```typescript
export const elginPrinter = new ElginI8Printer({
  paperWidth: 48,  // 48 = 80mm (padrão)
               // 32 = 58mm
               // 56 = 80mm+ (mais espaço)
  useCuts: true,
})
```

## Segurança

- Pop-ups: Abrirá em nova janela. Se bloqueado no navegador, erro será exibido
- Dados: Não armazena histórico de impressões (pode ser implementado)
- API: Tenta apenas POST /api/print (sem autenticação, configure conforme necessário)

## Próximos Passos

1. **Teste com printer física**: Se tiver Elgin i8
2. **Integrar com backend**: Copie `examples/printer-backend.js`
3. **Persistência**: Salvar histórico em BD (próxima fase)
4. **Múltiplas printers**: Suporte para 2+ impressoras

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Pop-up não abre | Desbloquear pop-ups do site |
| Impressão em branco | Verificar se `escapeHtml()` está funcional |
| Printer não encontrada | Verificar porta serial/USB |
| Fila travada | Recarregar a página (ctrl+shift+r) |

## Contato

Dúvidas? Verifique o console do navegador (F12 → Console) para logs detalhados.

