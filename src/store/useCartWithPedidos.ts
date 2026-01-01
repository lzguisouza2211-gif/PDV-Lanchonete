import { useCart } from './useCart'
import { usePedidos } from '../hooks/usePedidos'
import { supabase } from '../services/supabaseClient'

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
    if (!input.cliente || input.cliente.trim() === '') {
      throw new Error('Nome do cliente é obrigatório')
    }

    if (cart.items.length === 0) {
      throw new Error('Carrinho vazio')
    }

    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      throw new Error('Usuário não autenticado')
    }

    const pedido = {
      user_id: data.user.id,
      cliente: input.cliente,
      tipoentrega: input.tipoEntrega ?? null,
      endereco: input.endereco ?? null,
      formapagamento: input.formaPagamento ?? null,
      troco: input.troco ? Number(input.troco) : null,
      status: 'Recebido',
      total: cart.items.reduce(
        (s, i) => s + i.price * i.qty,
        0
      ),
      itens: cart.items.map((item) => ({
        nome: item.name,
        preco: item.price,
        quantidade: item.qty,
      })),
    }

    console.log('📦 Pedido enviado:', pedido)

    const criado = await criarPedidoService(pedido)

    if (criado) {
      cart.clear()
    }

    return criado
  }

  return {
    ...cart,
    criarPedido,
  }
}
