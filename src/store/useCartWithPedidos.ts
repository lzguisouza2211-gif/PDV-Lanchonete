import { useCart } from './useCart'
import usePedidos from '../hooks/usePedidos'
import { supabase } from '../services/supabaseClient'
import { normalizePedidoPayload } from '../utils/pedido'
import { withTimeout, getFriendlyErrorMessage } from '../utils/timeout'

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
    // Tentar obter user_id se houver sessão autenticada
    let userId: string | null = null
    try {
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id ?? null
    } catch (e) {
      // Ignora erro se não houver sessão (anon pode fazer pedido)
    }

    // Normaliza e valida payload
    const pedido = normalizePedidoPayload(
      {
        ...input,
        user_id: userId,
      },
      cart.items
    )

    try {
      // Adiciona timeout de 15s
      const criarPedidoPromise = criarPedidoService(pedido)
      const criado = await withTimeout(
        criarPedidoPromise,
        15000,
        'Tempo limite excedido. Verifique sua conexão e tente novamente.'
      )

      if (!criado) {
        throw new Error('Erro ao enviar pedido')
      }

      // Só limpa o carrinho APÓS confirmação de sucesso
      cart.clear()
      return true
    } catch (error: any) {
      // Converte erro para mensagem amigável
      const friendlyMessage = getFriendlyErrorMessage(error)
      throw new Error(friendlyMessage)
    }
  }

  return {
    ...cart,
    criarPedido,
  }
}