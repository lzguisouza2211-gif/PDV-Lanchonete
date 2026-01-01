import React, { useState } from 'react'
import { useCardapio } from '../../hooks/useCardapio'
import { useCartWithPedidos } from '../../store/useCartWithPedidos'

export default function Cardapio(): JSX.Element {
  const { itens, loading: carregandoCardapio, error: erroCardapio } = useCardapio()
  const { items, add, criarPedido } = useCartWithPedidos()

  const [loadingPedido, setLoadingPedido] = useState(false)
  const [errorPedido, setErrorPedido] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada')
  const [endereco, setEndereco] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro')
  const [troco, setTroco] = useState('')

  const handleSubmit = async () => {
    setErrorPedido(null)
    setLoadingPedido(true)

    try {
      const result = await criarPedido({
        cliente: nome,
        tipoEntrega: tipoEntrega,
        endereco: tipoEntrega === 'entrega' ? endereco : undefined,
        formaPagamento: formaPagamento,
        troco: formaPagamento === 'dinheiro' ? troco : undefined,
      })

      if (!result) {
        setErrorPedido('Falha ao criar pedido')
      }
    } catch (err) {
      setErrorPedido((err as Error).message)
    } finally {
      setLoadingPedido(false)
    }
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <main>
      <h1>Cardápio</h1>

      {/* CARDÁPIO */}
      {carregandoCardapio && <p>Carregando cardápio...</p>}
      {erroCardapio && <p>Erro ao carregar cardápio</p>}

      <section>
        {itens.map((item) => (
          <div key={item.id} style={{ borderBottom: '1px solid #ccc', padding: 8 }}>
            <strong>{item.nome}</strong>
            <p>R$ {item.preco.toFixed(2)}</p>

            <button
              onClick={() =>
                add({
                  id: String(item.id),
                  name: item.nome,
                  price: Number(item.preco),
                  qty: 1,
                })
              }
            >
              Adicionar
            </button>
          </div>
        ))}
      </section>

      <hr />

      {/* CARRINHO */}
      <h2>Carrinho</h2>

      <input
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <div>
        <label>
          <input
            type="radio"
            checked={tipoEntrega === 'retirada'}
            onChange={() => setTipoEntrega('retirada')}
          />
          Retirada
        </label>

        <label>
          <input
            type="radio"
            checked={tipoEntrega === 'entrega'}
            onChange={() => setTipoEntrega('entrega')}
          />
          Entrega
        </label>
      </div>

      {tipoEntrega === 'entrega' && (
        <input
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />
      )}

      <div>
        <label>
          <input
            type="radio"
            checked={formaPagamento === 'dinheiro'}
            onChange={() => setFormaPagamento('dinheiro')}
          />
          Dinheiro
        </label>

        <label>
          <input
            type="radio"
            checked={formaPagamento === 'cartao'}
            onChange={() => setFormaPagamento('cartao')}
          />
          Cartão
        </label>

        <label>
          <input
            type="radio"
            checked={formaPagamento === 'pix'}
            onChange={() => setFormaPagamento('pix')}
          />
          Pix
        </label>
      </div>

      {formaPagamento === 'dinheiro' && (
        <input
          placeholder="Troco para quanto?"
          value={troco}
          onChange={(e) => setTroco(e.target.value)}
        />
      )}

      <ul>
        {items.map((it, idx) => (
          <li key={`${it.id}-${idx}`}>
            {it.name} x{it.qty} — R$ {(it.price * it.qty).toFixed(2)}
          </li>
        ))}
      </ul>

      <strong>Total: R$ {total.toFixed(2)}</strong>

      {errorPedido && <p style={{ color: 'red' }}>{errorPedido}</p>}

      <button onClick={handleSubmit} disabled={loadingPedido || items.length === 0}>
        {loadingPedido ? 'Enviando...' : 'Finalizar Pedido'}
      </button>
    </main>
  )
}
