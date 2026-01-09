import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useCardapio } from '../../hooks/useCardapio'
import { useCartWithPedidos } from '../../store/useCartWithPedidos'
import { useStoreStatus } from '../../hooks/useStoreStatus'
import CategorySection from '../../components/pdv/CategorySection'
import CartDrawer from '../../components/pdv/CartDrawer'
import SuccessModal from '../../components/pdv/SuccessModal'
import ProductCustomizationModal, {
  CustomizationData,
  ExtraOption,
} from '../../components/pdv/ProductCustomizationModal'
import CustomizationPrompt from '../../components/pdv/CustomizationPrompt'
import { productAddonsService } from '../../services/productAddons'

export default function Cardapio(): JSX.Element {
  const { itens, loading, error } = useCardapio()
  const { items, add, remove, criarPedido } = useCartWithPedidos()
  const { isOpen: lojaAberta, loading: statusLoading } = useStoreStatus()

  const [nome, setNome] = useState('')
  const [tipoEntrega, setTipoEntrega] =
    useState<'retirada' | 'entrega' | 'local'>('retirada')
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
  const [promptAberto, setPromptAberto] = useState(false)
  const [modalCustomizacaoAberto, setModalCustomizacaoAberto] = useState(false)

  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [extrasDisponiveis, setExtrasDisponiveis] = useState<ExtraOption[]>([])
  const [produtoAdicionado, setProdutoAdicionado] = useState<string | null>(null)

  const enviandoRef = useRef(false)
  const categoriaRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const total = items.reduce((s, i) => {
    const extras = (i.extras || []).reduce(
      (sum, e) => sum + (e.tipo === 'add' ? e.preco : 0),
      0
    )
    return s + (i.price + extras) * i.qty
  }, 0)

  const ORDEM_CATEGORIAS = [
    'Lanches',
    'Macarrão',
    'Porções',
    'Omeletes',
    'Bebidas',
    'Doces',
  ]

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

  const listaCategorias = useMemo(() => {
    return ORDEM_CATEGORIAS.filter((cat) => categorias[cat])
  }, [categorias])

  useEffect(() => {
    if (listaCategorias.length > 0 && !categoriaAtiva) {
      setCategoriaAtiva(listaCategorias[0])
    }
  }, [listaCategorias, categoriaAtiva])

  const scrollToCategoria = (categoria: string) => {
    setCategoriaAtiva(categoria)
    const el = categoriaRefs.current[categoria]
    if (!el) return

    window.scrollTo({
      top: el.offsetTop - 140,
      behavior: 'smooth',
    })
  }

  /* =======================
     ADICIONAR PRODUTO
  ======================= */
  const handleAddItemClick = async (produto: any) => {
    if (!lojaAberta) {
      setErro('Estamos fechados no momento')
      return
    }

    const addons = await productAddonsService.getByProduct(produto.id)
    const extras = addons
      .filter((a) => a.tipo === 'add')
      .map((a) => ({
        id: String(a.id),
        nome: a.nome,
        preco: Number(a.preco),
        tipo: a.tipo,
      }))

    setExtrasDisponiveis(extras)
    setProdutoSelecionado(produto)
    setPromptAberto(true)
  }

  const handlePromptNo = () => {
    if (!produtoSelecionado) return

    add({
      id: String(produtoSelecionado.id),
      name: produtoSelecionado.nome,
      price: produtoSelecionado.preco,
      qty: 1,
    })

    setProdutoAdicionado(String(produtoSelecionado.id))
    setTimeout(() => setProdutoAdicionado(null), 600)

    setPromptAberto(false)
    setProdutoSelecionado(null)
  }

  const handlePromptYes = () => {
    setPromptAberto(false)
    setModalCustomizacaoAberto(true)
  }

  const handleConfirmCustomization = (data: CustomizationData) => {
    if (!produtoSelecionado) return

    const precoExtras = data.extras.reduce(
      (sum, e) => sum + (e.tipo === 'add' ? e.preco : 0),
      0
    )

    add({
      id: String(produtoSelecionado.id),
      name: produtoSelecionado.nome,
      price: produtoSelecionado.preco + precoExtras,
      qty: 1,
      observacoes: data.observacoes,
      extras: data.extras,
    })

    setProdutoAdicionado(String(produtoSelecionado.id))
    setTimeout(() => setProdutoAdicionado(null), 600)

    setModalCustomizacaoAberto(false)
    setProdutoSelecionado(null)
  }

  /* =======================
     FINALIZAR PEDIDO
  ======================= */
  async function finalizar() {
    if (enviandoRef.current) return
    enviandoRef.current = true
    setEnviando(true)
    setErro(null)

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
      setNome('')
      setEndereco('')
      setTroco('')
    } catch (e: any) {
      setErro(e.message || 'Erro ao enviar pedido')
    } finally {
      setEnviando(false)
      enviandoRef.current = false
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff8f2' }}>
      {/* HEADER FIXO */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,               // 👈 ALTURA FIXA
          zIndex: 300,
          background: '#c0392b',
          color: '#fff',
          padding: '0 16px',        // 👈 remove padding vertical
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <span style={{ fontSize: 22 }}>🍔</span>
          <span>Luizão Lanches</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          {statusLoading
            ? 'Carregando...'
            : lojaAberta
            ? 'Estamos abertos! 🟢'
            : 'Fechado no momento 🔴'}
        </span>
      </header> 
      {/* DROPDOWN FIXO DE CATEGORIAS */}
      {!loading && !error && (
        <div
            style={{
            position: 'fixed',
            top: 56,                  // 👈 MESMO valor do header
            left: 0,
            right: 0,
            zIndex: 200,
            background: '#ffffff',
            padding: '12px 16px',
            borderBottom: '1px solid #e5e5e5',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: '#666',
              marginBottom: 6,
            }}
          >
            📂 Escolher categoria
          </label>

          <select
            value={categoriaAtiva || ''}
            onChange={(e) => scrollToCategoria(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 16,
              borderRadius: 10,
              border: '1px solid #ddd',
              background: '#fff',
              appearance: 'none',
            }}
          >
            {listaCategorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CONTEÚDO */}
      <main
        style={{
          padding: 16,
          paddingTop: 140,
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        {Object.entries(categorias).map(([categoria, lista]) => (
          <div
            key={categoria}
            ref={(el) => (categoriaRefs.current[categoria] = el)}
          >
            <CategorySection
              categoria={categoria}
              itens={lista}
              onAddItem={handleAddItemClick}
              lojaAberta={lojaAberta}
              produtoAdicionado={produtoAdicionado}
            />
          </div>
        ))}
      </main>

      {/* BOTÃO CARRINHO */}
      {items.length > 0 && (
        <button
          onClick={() => setCarrinhoAberto(true)}
          style={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 400,
            background: '#27ae60',
            color: '#fff',
            padding: 16,
            borderRadius: 12,
            border: 'none',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{items.length} itens</span>
          <span>R$ {total.toFixed(2)}</span>
        </button>
      )}

      {/* DRAWER */}
      <CartDrawer
        isOpen={carrinhoAberto}
        onClose={() => setCarrinhoAberto(false)}
        items={items}
        total={total}
        onRemove={remove}
        onAdd={add}
      >
        <div>
          {/* DADOS DO CLIENTE */}
          <h3 style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>
            🧾 Dados do pedido
          </h3>

          <input
            placeholder="Seu nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={enviando}
            style={{
              width: '100%',
              boxSizing: 'border-box', // 👈 ESSENCIAL
              marginBottom: 12,
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: '1px solid #ddd',
              background: '#fff',
            }}
          />

          <select
            value={tipoEntrega}
            onChange={(e) =>
              setTipoEntrega(e.target.value as 'retirada' | 'entrega' | 'local')
            }
            disabled={enviando}
            style={{
              width: '100%',
              boxSizing: 'border-box', // 👈 ESSENCIAL
              marginBottom: 12,
              padding: 14,
              fontSize: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
            }}
          >
            <option value="retirada">Retirada</option>
            <option value="entrega">Entrega</option>
            <option value="local">Consumir no local</option>
          </select>

          {tipoEntrega === 'entrega' && (
            <input
              placeholder="Endereço de entrega *"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              disabled={enviando}
              style={{
                width: '100%',
                boxSizing: 'border-box', // 👈 ESSENCIAL
                marginBottom: 12,
                padding: 14,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ddd',
              }}
            />
          )}
          {tipoEntrega === 'entrega' && (
            <>
              <h3 style={{ margin: '16px 0 8px', fontSize: 16, fontWeight: 700 }}>
                💳 Pagamento
              </h3>

              <select
                value={formaPagamento}
                onChange={(e) =>
                  setFormaPagamento(
                    e.target.value as 'dinheiro' | 'cartao' | 'pix'
                  )
                }
                disabled={enviando}
                style={{
                  width: '100%',
                  boxSizing: 'border-box', // 👈 ESSENCIAL
                  marginBottom: 12,
                  padding: 14,
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                }}
              >
                <option value="dinheiro">💵 Dinheiro</option>
                <option value="cartao">💳 Cartão</option>
                <option value="pix">📱 PIX</option>  
              </select>

          {formaPagamento === 'dinheiro' && tipoEntrega !== 'local' && (
            <input
              placeholder="Troco para quanto?"
              value={troco}
              onChange={(e) => setTroco(e.target.value)}
              disabled={enviando}
              style={{
                width: '100%',
                boxSizing: 'border-box', // 👈 ESSENCIAL
                marginBottom: 12,
                padding: 14,
                fontSize: 16,
                borderRadius: 8,
                border: '1px solid #ddd',
              }}
            />
          )}
          </>)}

          {erro && (
            <div
              style={{
                background: '#fdecea',
                color: '#c0392b',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
                border: '1px solid #f5c6cb',
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
              borderRadius: 10,
              border: 'none',
              background:
                enviando || !nome.trim() || items.length === 0
                  ? '#95a5a6'
                  : '#27ae60',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {enviando ? 'Enviando pedido...' : 'Finalizar pedido'}
          </button>
        </div>  
      </CartDrawer>


      {/* =======================
          MODAIS (NO FINAL)
         ======================= */}
      {produtoSelecionado && (
        <CustomizationPrompt
          isOpen={promptAberto}
          produtoNome={produtoSelecionado.nome}
          onNo={handlePromptNo}
          onYes={handlePromptYes}
          onClose={() => {
            setPromptAberto(false)
            setProdutoSelecionado(null)
          }}
        />
      )}

      {produtoSelecionado && (
        <ProductCustomizationModal
          isOpen={modalCustomizacaoAberto}
          produto={produtoSelecionado}
          extrasDisponiveis={extrasDisponiveis}
          ingredientesRemoviveis={produtoSelecionado.ingredientes || []}
          onConfirm={handleConfirmCustomization}
          onClose={() => {
            setModalCustomizacaoAberto(false)
            setProdutoSelecionado(null)
          }}
        />
      )}

      {sucesso && (
        <SuccessModal
          cliente={nomeClienteSucesso}
          onClose={() => setSucesso(false)}
        />
      )}
    </div>
  )
}