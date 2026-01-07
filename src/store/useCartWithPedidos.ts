import { useCart } from './useCart'
import usePedidos from '../hooks/usePedidos'

export function useCartWithPedidos() {
  const cart = useCart()
  const { criarPedido: criarPedidoService } = usePedidos()

  async function criarPedido(input: {
    cliente: string
    tipoEntrega?: string
    endereco?: string
    formaPagamento?: string
    troco?: number | string
  }) {
    if (!input.cliente) {
      throw new Error('Nome do cliente é obrigatório')
    }

    if (cart.items.length === 0) {
      throw new Error('Carrinho vazio')
    }

    const pedido = {
      cliente: input.cliente,
      tipoentrega: input.tipoEntrega ?? null,
      endereco: input.endereco ?? null,
      formapagamento: input.formaPagamento ?? null,
      troco: input.troco ?? null,
      status: 'Recebido',
      total: cart.items.reduce(
        (s, i) => s + i.price * i.qty,
        0
      ),
      itens: cart.items.map((item) => ({
        nome: item.name,
        preco: item.price,
        adicionais: [], // ✅ formato esperado pelo banco
      })),
    }

    console.log('📦 Pedido enviado:', pedido)

    const criado = await criarPedidoService(pedido)

    if (!criado) {
      throw new Error('Erro ao enviar pedido')
    }

    cart.clear()
    return true
  }

  return {
    ...cart,
    criarPedido,
  }
}