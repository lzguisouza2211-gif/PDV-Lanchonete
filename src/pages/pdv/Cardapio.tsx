import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useCardapio } from '../../hooks/useCardapio'
import { useCartWithPedidos } from '../../store/useCartWithPedidos'
import CategorySection from '../../components/pdv/CategorySection'
import CartDrawer from '../../components/pdv/CartDrawer'
import SuccessModal from '../../components/pdv/SuccessModal'
import CategoryTabs from '../../components/pdv/CategoryTabs'
import Toast from '../../components/pdv/Toast'

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
  const [nomeClienteSucesso, setNomeClienteSucesso] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null)

  // Prevenir envio duplo
  const enviandoRef = useRef(false)
  const categoriaRefs = useRef<Record<string, HTMLDivElement | null>>({})

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

  const listaCategorias = useMemo(() => Object.keys(categorias), [categorias])

  // Definir primeira categoria como ativa ao carregar
  useEffect(() => {
    if (listaCategorias.length > 0 && !categoriaAtiva) {
      setCategoriaAtiva(listaCategorias[0])
    }
  }, [listaCategorias, categoriaAtiva])

  // Scroll para categoria quando selecionada
  const scrollToCategoria = (categoria: string) => {
    setCategoriaAtiva(categoria)
    const element = categoriaRefs.current[categoria]
    if (element) {
      const headerOffset = 160
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  // Detectar categoria visível no scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (const categoria of listaCategorias) {
        const element = categoriaRefs.current[categoria]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setCategoriaAtiva(categoria)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [listaCategorias])

  async function finalizar() {
    // Prevenir envio duplo
    if (enviandoRef.current) {
      return
    }

    setErro(null)
    setEnviando(true)
    enviandoRef.current = true

    try {
      await criarPedido({
        cliente: nome,
        tipoEntrega,
        endereco: tipoEntrega === 'entrega' ? endereco : undefined,
        formaPagamento,
        troco: formaPagamento === 'dinheiro' ? troco : undefined,
      })

      setNomeClienteSucesso(nome)
      setCarrinhoAberto(false)
      setSucesso(true)
      
      // Limpar formulário
      setNome('')
      setEndereco('')
      setTroco('')
    } catch (e: any) {
      console.error('Erro ao finalizar pedido:', e)
      const mensagemErro = e.message || 'Erro desconhecido ao enviar pedido'
      setErro(mensagemErro)
      // Manter carrinho aberto para tentar novamente
    } finally {
      setEnviando(false)
      enviandoRef.current = false
    }
  }

  // Animação ao adicionar item
  const handleAddItem = (item: { id: string; name: string; price: number; qty: number }) => {
    add(item)
    setToast({
      message: `${item.name} adicionado ao carrinho!`,
      type: 'success',
    })
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
          🍔 Luizão Lanches
        </h1>

        <span
          style={{
            background: aberto ? '#2ecc71' : '#e74c3c',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {aberto ? '🟢 Aberto agora' : '🔴 Fechado'}
        </span>
      </header>

      {/* TABS DE CATEGORIAS */}
      {!loading && !error && listaCategorias.length > 0 && (
        <CategoryTabs
          categorias={listaCategorias}
          categoriaAtiva={categoriaAtiva}
          onSelectCategoria={scrollToCategoria}
        />
      )}

      {/* CARDÁPIO */}
      <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 18, color: '#666' }}>Carregando cardápio...</p>
          </div>
        )}
        
        {error && (
          <div
            style={{
              background: '#fee',
              padding: 16,
              borderRadius: 8,
              color: '#c0392b',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0 }}>Erro ao carregar cardápio. Tente recarregar a página.</p>
          </div>
        )}

        {!loading && !error && Object.keys(categorias).length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 18, color: '#666' }}>Nenhum item disponível no momento.</p>
          </div>
        )}

        {Object.entries(categorias).map(([categoria, lista]: [string, any[]]) => (
          <div
            key={categoria}
            ref={(el) => {
              categoriaRefs.current[categoria] = el
            }}
          >
            <CategorySection
              categoria={categoria}
              itens={lista}
              onAddItem={handleAddItem}
            />
          </div>
        ))}
      </main>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* BOTÃO CARRINHO FLUTUANTE */}
      {items.length > 0 && (
        <button
          onClick={() => setCarrinhoAberto(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#27ae60',
            color: '#fff',
            borderRadius: 30,
            padding: '16px 32px',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            boxShadow: '0 8px 24px rgba(39, 174, 96, 0.4)',
            zIndex: 1000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(39, 174, 96, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(39, 174, 96, 0.4)'
          }}
        >
          <span
            style={{
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {items.reduce((sum, item) => sum + item.qty, 0)}
          </span>
          Ver carrinho • R$ {total.toFixed(2)}
        </button>
      )}

      {/* DRAWER CARRINHO */}
      <CartDrawer
        isOpen={carrinhoAberto}
        onClose={() => setCarrinhoAberto(false)}
        items={items}
        total={total}
        onRemove={remove}
        onAdd={add}
      >
        <div>
          <input
            placeholder="Seu nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={enviando}
            inputMode="text"
            autoComplete="name"
            style={{
              width: '100%',
              marginBottom: 12,
              padding: 14,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              boxSizing: 'border-box',
            }}
          />

          <select
            value={tipoEntrega}
            onChange={(e) =>
              setTipoEntrega(e.target.value as 'retirada' | 'entrega')
            }
            disabled={enviando}
            style={{
              width: '100%',
              marginBottom: 12,
              padding: 14,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              boxSizing: 'border-box',
            }}
          >
            <option value="retirada">Retirada</option>
            <option value="entrega">Entrega</option>
          </select>

          {tipoEntrega === 'entrega' && (
            <input
              placeholder="Endereço de entrega *"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              disabled={enviando}
              inputMode="text"
              autoComplete="street-address"
              style={{
                width: '100%',
                marginBottom: 12,
                padding: 14,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
          )}

          <select
            value={formaPagamento}
            onChange={(e) =>
              setFormaPagamento(e.target.value as 'dinheiro' | 'cartao' | 'pix')
            }
            disabled={enviando}
            style={{
              width: '100%',
              marginBottom: 12,
              padding: 14,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              boxSizing: 'border-box',
            }}
          >
            <option value="dinheiro">💵 Dinheiro</option>
            <option value="cartao">💳 Cartão</option>
            <option value="pix">📱 PIX</option>
          </select>

          {formaPagamento === 'dinheiro' && (
            <input
              placeholder="Troco para quanto?"
              value={troco}
              onChange={(e) => setTroco(e.target.value)}
              disabled={enviando}
              inputMode="decimal"
              type="text"
              pattern="[0-9]*"
              style={{
                width: '100%',
                marginBottom: 12,
                padding: 14,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
          )}

          {erro && (
            <div
              style={{
                background: '#fee',
                color: '#c0392b',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                fontSize: 14,
              }}
            >
              {erro}
            </div>
          )}

          <button
            onClick={finalizar}
            disabled={enviando || !nome.trim() || items.length === 0}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              border: 'none',
              background:
                enviando || !nome.trim() || items.length === 0
                  ? '#95a5a6'
                  : '#27ae60',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor:
                enviando || !nome.trim() || items.length === 0
                  ? 'not-allowed'
                  : 'pointer',
              touchAction: 'manipulation',
              minHeight: 52,
              transition: 'background 0.2s ease',
            }}
          >
            {enviando ? (
              <span>
                <span
                  style={{
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite',
                  }}
                >
                  ⏳
                </span>{' '}
                Enviando pedido...
              </span>
            ) : (
              'Finalizar pedido'
            )}
          </button>
        </div>
      </CartDrawer>

      {/* MODAL SUCESSO */}
      {sucesso && (
        <SuccessModal
          onClose={() => {
            setSucesso(false)
            setNomeClienteSucesso('')
          }}
          cliente={nomeClienteSucesso}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
