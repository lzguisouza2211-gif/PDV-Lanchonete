import React, { useState, useMemo } from 'react'
import { useCardapio } from '../../hooks/useCardapio'
import { useCartWithPedidos } from '../../store/useCartWithPedidos'

export default function Cardapio(): JSX.Element {
  const { itens, loading, error } = useCardapio()
  const { items, add, remove, criarPedido } = useCartWithPedidos()

  const [nome, setNome] = useState('')
  const [tipoEntrega, setTipoEntrega] =
    useState<'retirada' | 'entrega'>('retirada')
  const [endereco, setEndereco] = useState('')
  const [formaPagamento, setFormaPagamento] =
    useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro')
  const [troco, setTroco] = useState('')

  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const aberto = true

  /* =======================
     AGRUPAR POR CATEGORIA
  ======================= */
  const categorias = useMemo(() => {
    const map: Record<string, any[]> = {}
    itens.forEach((item: any) => {
      const cat = item.categoria || 'Outros'
      if (!map[cat]) map[cat] = []
      map[cat].push(item)
    })
    return map
  }, [itens])

  async function finalizar() {
    setErro(null)
    setEnviando(true)

    try {
      await criarPedido({
        cliente: nome,
        tipoEntrega,
        endereco: tipoEntrega === 'entrega' ? endereco : undefined,
        formaPagamento,
        troco: formaPagamento === 'dinheiro' ? troco : undefined,
      })

      setCarrinhoAberto(false)
      setSucesso(true)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f2' }}>
      {/* HEADER */}
      <header
        style={{
          background: '#c0392b',
          color: '#fff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>🍔 Luizão Lanches</h1>

        <span
          style={{
            background: aberto ? '#2ecc71' : '#e74c3c',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {aberto ? 'Aberto agora' : 'Fechado'}
        </span>
      </header>

      {/* CARDÁPIO */}
      <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {loading && <p>Carregando...</p>}
        {error && <p>Erro ao carregar cardápio</p>}

        {Object.entries(categorias).map(([categoria, lista]) => (
          <section key={categoria} style={{ marginBottom: 32 }}>
            <h2 style={{ marginBottom: 16 }}>{categoria}</h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {lista.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                >
                  <strong>{item.nome}</strong>
                  <p style={{ margin: '8px 0' }}>
                    R$ {item.preco.toFixed(2)}
                  </p>

                  <button
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: 'none',
                      background: '#c0392b',
                      color: '#fff',
                    }}
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
            </div>
          </section>
        ))}
      </main>

      {/* BOTÃO CARRINHO */}
      {items.length > 0 && (
        <button
          onClick={() => setCarrinhoAberto(true)}
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#27ae60',
            color: '#fff',
            borderRadius: 30,
            padding: '14px 24px',
            fontWeight: 600,
            border: 'none',
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            zIndex: 1000,
          }}
        >
          Ver carrinho • R$ {total.toFixed(2)}
        </button>
      )}

      {/* DRAWER CARRINHO */}
      {carrinhoAberto && (
        <div
          onClick={() => setCarrinhoAberto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: 420,
              height: '100%',
              padding: 20,
              overflowY: 'auto',
            }}
          >
            <h3>Seu pedido</h3>

            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <span>{it.name}</span>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => remove(it.id)}>➖</button>
                  <strong>{it.qty}</strong>
                  <button
                    onClick={() =>
                      add({ ...it, qty: 1 })
                    }
                  >
                    ➕
                  </button>
                </div>
              </div>
            ))}

            <strong>Total: R$ {total.toFixed(2)}</strong>

            <input
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{ width: '100%', marginTop: 12 }}
            />

            <button
              onClick={finalizar}
              disabled={enviando}
              style={{
                marginTop: 16,
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: 'none',
                background: '#27ae60',
                color: '#fff',
                fontWeight: 600,
              }}
            >
              {enviando ? 'Enviando...' : 'Finalizar pedido'}
            </button>

            {erro && <p style={{ color: 'red' }}>{erro}</p>}
          </div>
        </div>
      )}

      {/* MODAL SUCESSO */}
      {sucesso && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 32,
              borderRadius: 16,
              textAlign: 'center',
            }}
          >
            <h2>🎉 Pedido enviado!</h2>
            <p>Seu pedido foi recebido com sucesso.</p>

            <button
              onClick={() => setSucesso(false)}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#c0392b',
                color: '#fff',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
