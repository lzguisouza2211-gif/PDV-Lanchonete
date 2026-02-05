# 🧪 Guia de Testes Rápidos

## ✅ Verificação de 5 Minutos

### 1. Compilação (30 segundos)
```bash
npm run build
# Deve terminar com: ✓ built in 6.96s
```
✅ **Resultado esperado:** Sem erros, build bem-sucedido

---

### 2. Iniciar Dev (30 segundos)
```bash
npm run dev
# Deve iniciar servidor local
```
✅ **Resultado esperado:** 
```
➜  Local:   http://localhost:5173/
```

---

### 3. Acessar Admin (30 segundos)
1. Abra: http://localhost:5173/admin/pedidos
2. Verifique login
3. Você deve ver: **Kanban com 3 colunas**

✅ **Resultado esperado:** Colunas: Recebido, Em preparo, Finalizado

---

### 4. Verificar Botões (1 minuto)
1. Procure um **card de pedido** no kanban
2. Role para baixo do card
3. Você deve ver: **[🖨️ Imprimir]**

✅ **Resultado esperado:** Botão verde com ícone de impressora

---

### 5. Testar Menu de Impressão (1 minuto)
1. Clique em **[🖨️ Imprimir]**
2. Menu deve abrir com opções:
   - 👨‍🍳 Produção
   - 🚗 Motoboy (se entrega)
   - ✕ Fechar

✅ **Resultado esperado:** Menu com 2-3 opções

---

### 6. Testar Impressão (1 minuto)
1. Clique em **👨‍🍳 Produção**
2. Uma janela de impressão deve abrir
3. Veja o ticket formatado
4. Feche a janela

✅ **Resultado esperado:** 
- Janela com ticket
- Formatação legível
- Conteúdo correto

---

### 7. Verificar Dashboard (1 minuto)
1. Vá para: http://localhost:5173/admin/dashboard
2. Role para baixo
3. Procure: **🖨️ Fila de Impressão**

✅ **Resultado esperado:** Monitor de fila visível

---

## 🔬 Teste Detalhado

### Teste 1: Menu de Impressão

**Pré-requisito:** Estar no kanban com ao menos 1 pedido

```
✓ Botão [🖨️ Imprimir] visível
✓ Cor verde
✓ Ícone correto
✓ Clique abre menu
✓ Menu tem 2-3 opções
✓ Opções têm cores diferentes
✓ Botão ✕ Fechar funciona
```

### Teste 2: Impressão de Produção

```
✓ Janela abre ao clicar 👨‍🍳 Produção
✓ Título: *** TICKET DE PRODUÇÃO ***
✓ Mostra PEDIDO #ID
✓ Mostra CLIENTE
✓ Mostra ITENS COM QUANTIDADE
✓ Mostra EXTRAS se houver
✓ Mostra OBSERVAÇÕES
✓ Formatação centralizada
✓ Corte automático indicado
```

### Teste 3: Impressão de Motoboy

```
✓ Aparece só para pedidos de ENTREGA
✓ Janela abre ao clicar 🚗 Motoboy
✓ Título: *** TICKET DE ENTREGA ***
✓ Mostra PEDIDO #ID
✓ Mostra CLIENTE
✓ Mostra ENDEREÇO DE ENTREGA
✓ Mostra APENAS BEBIDAS/DOCES
✓ Mostra VALORES
✓ Mostra FORMA DE PAGAMENTO
✓ Mostra TROCO se aplicável
```

### Teste 4: Fila de Impressão

```
✓ Dashboard carrega sem erros
✓ Monitor visível quando há fila
✓ Mostra: 🖨️ Fila de Impressão
✓ Status: ⏳ Imprimindo... ou 📋 Na fila
✓ Lista jobs com tipo e status
✓ Desaparece quando fila vazia
```

### Teste 5: Console (F12)

```
✓ Abrir F12 → Console
✓ Procurar logs de impressão
✓ Deve ver:
  - 📄 Trabalho de impressão adicionado
  - 🖨️ Imprimindo: print-xxx
  - ✅ Impressão concluída
```

---

## 🚨 Troubleshooting Rápido

### Problema: Botão não aparece
```
1. Recarregue página (F5)
2. Verifique console (F12) para erros
3. Execute: npm run dev
```

### Problema: Menu não abre
```
1. Clique novamente
2. Verifique console para erros
3. Feche e abra painel admin novamente
```

### Problema: Janela de impressão não abre
```
1. Verifique pop-up blocker do navegador
2. Clique no ícone de bloqueio (URL)
3. Permita pop-ups
4. Teste novamente
```

### Problema: Fila não aparece no dashboard
```
1. Imprima um pedido
2. Vá para dashboard
3. Role para baixo
4. Deve aparecer quando há trabalhos
```

### Problema: Erros no console
```
1. Abra F12 → Console
2. Procure erros em vermelho
3. Copie erro completo
4. Verifique PRINT_SYSTEM.md seção troubleshooting
```

---

## 📋 Checklist de Testes

### Frontend
- [ ] Página carrega sem erros
- [ ] Botões visíveis em cards
- [ ] Menu abre corretamente
- [ ] Janelas de impressão abrem
- [ ] Formatação legível
- [ ] Dashboard carrega
- [ ] Monitor de fila aparece
- [ ] Sem erros no console

### Funcionalidade
- [ ] Produção mostra itens corretos
- [ ] Motoboy mostra bebidas/doces
- [ ] Bebidas corretas filtradas
- [ ] Endereço de entrega correto
- [ ] Valores corretos
- [ ] Forma de pagamento correta
- [ ] Troco correto (se houver)

### UX
- [ ] Menu responsivo
- [ ] Animações suaves
- [ ] Feedback visual clara
- [ ] Carregamento indicado
- [ ] Estados bem definidos
- [ ] Sem travamentos

### Performance
- [ ] Sem lag ao clicar botões
- [ ] Menu abre rápido
- [ ] Fila processa sem travar
- [ ] Dashboard não fica lento

---

## 🎯 Teste de Stress (Opcional)

### Teste: Imprimir 10 Pedidos

```
1. Abra Admin → Pedidos
2. Para cada card, clique [🖨️ Imprimir]
3. Escolha tipo aleatório
4. Repita 10 vezes em menos de 1 minuto
5. Vá para Dashboard
6. Verifique fila processa corretamente
```

✅ **Esperado:**
- Todos os 10 aparecem na fila
- Processados um por um
- Sem travamentos
- Monitor mostra progresso

---

## 📊 Teste de Retry (Avançado)

### Simular Falha de Impressão

1. Abra Console (F12)
2. Execute:
```javascript
// Ver status
import { printQueue } from './services/printer/printQueue'
printQueue.getQueueStatus()

// Marcar impressora como não pronta
printQueue.setPrinterReady(false)

// Tentar imprimir (vai falhar)
const { usePrinter } = await import('./hooks/usePrinter.ts')
// Isso vai falhar e retentar
```

✅ **Esperado:**
- Retry automático em 500ms
- Retry novamente em 1500ms
- Retry final em 2500ms
- Se não recuperar → Status: failed

---

## 🏁 Conclusão dos Testes

Após completar todos os testes:

```
✅ Sistema pronto para uso
✅ Sem bugs conhecidos
✅ Performance satisfatória
✅ UX fluida
✅ Documentação completa

Próximo passo:
→ Integrar com impressora real (opcional)
→ Ou usar fallback do navegador
```

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique PRINT_SYSTEM.md** (seção Troubleshooting)
2. **Limpe console:** `printQueue.clearQueue()`
3. **Recarregue página:** F5
4. **Reinicie servidor:** npm run dev

---

**Status dos Testes:** 🟢 Pronto  
**Tempo Estimado:** 5-10 minutos  
**Dificuldade:** Fácil (UI já pronta)
