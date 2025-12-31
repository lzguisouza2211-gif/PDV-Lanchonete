import React, { useState } from 'react'
import { useCartWithPedidos } from '../../store/useCart'

// Página PDV — integra o fluxo de envio de pedido com `useCartWithPedidos`
// Nota: não altera layout/JSX críticos — adiciona tratamento de submit para usar o service-backed hook.
export default function Cardapio(): JSX.Element {
  const { items, criarPedido } = useCartWithPedidos()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await criarPedido()
      if (!result) {
        setError('Falha ao criar pedido')
      }
    } catch (err) {
      setError((err as Error).message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <main>
      <h1>Cardápio</h1>
      <p>Itens no carrinho: {items.length}</p>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            {it.name} x{it.qty} — R$ {Number(it.price * it.qty).toFixed(2)}
          </li>
        ))}
      </ul>

      <div>
        <strong>Total: R$ {total.toFixed(2)}</strong>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading || items.length === 0}>
        {loading ? 'Enviando...' : 'Finalizar Pedido'}
      </button>
    </main>
  )
}
