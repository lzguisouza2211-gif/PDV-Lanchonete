/**
 * TESTE MANUAL DO SISTEMA DE IMPRESSÃO
 * 
 * Copie e cole estes comandos no console do navegador (F12 → Console)
 * para testar o sistema de impressão
 */

// ============================================
// 1. VERIFICAR IMPORTS
// ============================================
console.log('🔍 Verificando sistema de impressão...')

// Teste 1: Ver status da fila
import { printQueue } from './services/printer/printQueue'
console.log('📋 Status da fila:', printQueue.getQueueStatus())

// ============================================
// 2. CRIAR PEDIDO FAKE PARA TESTE
// ============================================
const pedidoTeste = {
  id: 999,
  cliente: 'João Silva - TESTE',
  itens: [
    {
      nome: 'Hambúrguer Duplo',
      preco: 25.0,
      quantidade: 2,
      extras: [
        { nome: 'Bacon', preco: 5.0 },
        { nome: 'Queijo Extra', preco: 3.0 }
      ],
      observacoes: 'Sem cebola, com maionese extra'
    },
    {
      nome: 'Batata Frita Grande',
      preco: 15.0,
      quantidade: 1,
      observacoes: 'Sal grosso'
    },
    {
      nome: 'Cerveja Brahma 600ml',
      preco: 12.0,
      quantidade: 1
    },
    {
      nome: 'Doce de Leite',
      preco: 8.0,
      quantidade: 1
    }
  ],
  total: 88.0,
  status: 'Recebido',
  tipoentrega: 'entrega',
  endereco: 'Rua das Flores, 123 - Apt 402 - Centro',
  formapagamento: 'Dinheiro',
  troco: '12.00',
  created_at: new Date().toISOString()
}

console.log('✅ Pedido criado para teste:', pedidoTeste)

// ============================================
// 3. TESTAR IMPRESSÃO DE PRODUÇÃO
// ============================================
console.log('\n🖨️ TESTE 1: Impressão de Produção')
import { elginPrinter } from './services/printer/elginPrinter'
const producaoContent = elginPrinter.generateProducao(pedidoTeste)
console.log('Conteúdo gerado:')
console.log(producaoContent)

// ============================================
// 4. TESTAR IMPRESSÃO DE MOTOBOY
// ============================================
console.log('\n🖨️ TESTE 2: Impressão de Motoboy')
const motoboyContent = elginPrinter.generateMotoboy(pedidoTeste)
console.log('Conteúdo gerado:')
console.log(motoboyContent)

// ============================================
// 5. TESTAR IMPRESSÃO COMPLETA
// ============================================
console.log('\n🖨️ TESTE 3: Impressão Completa')
const completoContent = elginPrinter.generateCompleto(pedidoTeste)
console.log('Conteúdo gerado:')
console.log(completoContent)

// ============================================
// 6. ADICIONAR À FILA DE IMPRESSÃO
// ============================================
console.log('\n📋 TESTE 4: Adicionar à fila de impressão')

// Registrar callback (necessário apenas uma vez)
printQueue.registerPrintCallback(async (job) => {
  console.log('🖨️ Callback de impressão acionado:', job.id)
  console.log('Tipo:', job.type)
  console.log('Status:', job.status)
  // Aqui iria a lógica real de envio para impressora
  console.log('✅ Impressão simulada (use API real no production)')
})

// Adicionar trabalho
console.log('Adicionando trabalho de produção à fila...')
await printQueue.addJob('producao', { pedido: pedidoTeste, content: producaoContent })

console.log('Status da fila:', printQueue.getQueueStatus())

// ============================================
// 7. TESTAR MÚLTIPLAS IMPRESSÕES (FILA)
// ============================================
console.log('\n📋 TESTE 5: Testar fila com múltiplos pedidos')

const pedido2 = { ...pedidoTeste, id: 1000, cliente: 'Maria Silva' }
const pedido3 = { ...pedidoTeste, id: 1001, cliente: 'Carlos Santos' }

console.log('Adicionando 2 pedidos à fila...')
await printQueue.addJob('motoboy', { pedido: pedido2, content: elginPrinter.generateMotoboy(pedido2) })
await printQueue.addJob('producao', { pedido: pedido3, content: elginPrinter.generateProducao(pedido3) })

console.log('Status da fila:', printQueue.getQueueStatus())

// Aguarde 2 segundos e verifique novamente
setTimeout(() => {
  console.log('Após 2s, status da fila:', printQueue.getQueueStatus())
}, 2000)

// ============================================
// 8. TESTAR HOOK DE IMPRESSÃO
// ============================================
console.log('\n🎣 TESTE 6: Testar Hook usePrinter')

// Criar componente fake para testar hook
function TestComponent() {
  const { printProducao, printMotoboy, status } = usePrinter()
  
  console.log('Hook importado com sucesso')
  console.log('Status atual:', status)
  
  // Simular impressão
  console.log('Testando printProducao...')
  printProducao(pedidoTeste)
  
  console.log('Testando printMotoboy...')
  printMotoboy(pedidoTeste)
}

// ============================================
// 9. TESTAR API DE IMPRESSÃO
// ============================================
console.log('\n🌐 TESTE 7: Testar API de Impressão')

import { sendToPrinter } from './services/printer/printerApi'

const result = await sendToPrinter({
  content: producaoContent,
  printerName: 'ELGIN_I8_TEST'
})

console.log('Resultado da API:', result)

// ============================================
// 10. VERIFICAR LOGS
// ============================================
console.log('\n✅ TODOS OS TESTES COMPLETADOS')
console.log('📊 Status Final da Fila:', printQueue.getQueueStatus())

// ============================================
// COMANDOS ÚTEIS PARA DEBUGGING
// ============================================
console.log(`
📌 COMANDOS ÚTEIS:

// Ver fila de impressão
printQueue.getQueueStatus()

// Limpar fila
printQueue.clearQueue()

// Marcar impressora como pronta
printQueue.setPrinterReady(true)

// Testar um pedido específico
const pedido = { id: 1, cliente: 'Teste', itens: [], total: 50 }
elginPrinter.generateProducao(pedido)

// Testar impressão no navegador
window.open('about:blank').document.write('<pre>Seu conteúdo aqui</pre>')
`)

// ============================================
// LIMPEZA
// ============================================
console.log('\n🧹 Para limpar tudo e recomeçar:')
console.log('1. Recarregue a página (F5)')
console.log('2. Ou execute: printQueue.clearQueue()')
