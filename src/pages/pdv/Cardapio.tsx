import React, { useState, useMemo, useRef, useEffect, useCallback, ForwardedRef } from 'react'
import { useCardapio } from '../../hooks/useCardapio'
import { useCartWithPedidos } from '../../store/useCartWithPedidos'
import { useStoreStatus } from '../../hooks/useStoreStatus'
import { useDeliveryFee } from '../../hooks/useDeliveryFee'
import CategorySection from '../../components/pdv/CategorySection'
import CartDrawer from '../../components/pdv/CartDrawer'
import SuccessModal from '../../components/pdv/SuccessModal'
import ProductCustomizationModal, {
  CustomizationData,
  ExtraOption,
} from '../../components/pdv/ProductCustomizationModal'
import CustomizationPrompt from '../../components/pdv/CustomizationPrompt'

import { cardapioService } from '../../services/api/cardapio.service'
import { storeStatusService } from '../../services/storeStatus'
import PixKeyDisplay from '../../components/pdv/PixKeyDisplay'
import { PIX_CONFIG } from '../../config/pix'
import { useProdutosDisponibilidadeRealtime } from '../../hooks/useProdutosDisponibilidadeRealtime'
import { validarTelefoneBrasileiro } from '../../utils/validation'
import { ingredientesService } from '../../services/api/ingredientes.service'

// Componente de input com mask customizado para evitar deprecated findDOMNode
const MaskedPhoneInput = React.forwardRef((props: any, ref: ForwardedRef<HTMLInputElement>) => {
  const [value, setValue] = useState(props.value || '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    
    if (val.length <= 11) {
      if (val.length <= 2) {
        val = val
      } else if (val.length <= 6) {
        val = `(${val.slice(0, 2)}) ${val.slice(2)}`
      } else {
        val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
      }
    }
    
    setValue(val)
    props.onChange({ target: { value: val } })
  }

  return (
    <input
      ref={ref}
      {...props}
      value={value}
      onChange={handleChange}
      placeholder="(XX) XXXXX-XXXX"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: 12,
        padding: 14,
        fontSize: 16,
        borderRadius: 10,
        border: '1px solid #ddd',
        background: '#fff',
      }}
    />
  )
})

export default function Cardapio(): JSX.Element {
  const { itens: itensCardapio, loading, error, recarregar } = useCardapio()
  const [itens, setItens] = useState<any[]>([])
  const { items, add, remove, criarPedido } = useCartWithPedidos()
  const { isOpen: lojaAberta, loading: statusLoading } = useStoreStatus()
  const { taxaEntrega } = useDeliveryFee()
  const [tempoEsperaDia, setTempoEsperaDia] = useState<number>(40)

  const [nome, setNome] = useState('')
    const [telefone, setTelefone] = useState('')
  const [tipoEntrega, setTipoEntrega] =
    useState<'retirada' | 'entrega' | 'local'>('retirada')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
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
  const [ingredientesRemoviveisDisponiveis, setIngredientesRemoviveisDisponiveis] = useState<string[]>([])
  const [produtoAdicionado, setProdutoAdicionado] = useState<string | null>(null)

  const enviandoRef = useRef(false)
  const categoriaRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const totalItens = items.reduce((sum, i) => sum + i.qty, 0)

  const subtotal = items.reduce((s, i) => {
    const extras = (i.extras || []).reduce(
      (sum, e) => sum + (e.tipo === 'add' ? e.preco : 0),
      0
    )
    return s + (i.price + extras) * i.qty
  }, 0)

  // Adiciona taxa de entrega se o tipo for 'entrega'
  const total = tipoEntrega === 'entrega' ? subtotal + taxaEntrega : subtotal

  // Sincroniza itens do hook com estado local para permitir atualizações em tempo real
  useEffect(() => {
    setItens(itensCardapio)
  }, [itensCardapio])

  // Busca tempo de espera do dia
  useEffect(() => {
    const loadTempo = async () => {
      const status = await storeStatusService.getStatus()
      if (status?.tempo_espera_padrao) {
        setTempoEsperaDia(status.tempo_espera_padrao)
      }
    }
    loadTempo()
  }, [])

  // Polling de 2s para atualizar tempo de espera do dia
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const status = await storeStatusService.getStatus()
        if (status?.tempo_espera_padrao) {
          setTempoEsperaDia(status.tempo_espera_padrao)
        }
      } catch (e) {
        // ignora erros
      }
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const ORDEM_CATEGORIAS = [
    'Lanches',
    'Macarrão',
    'Porções',
    'Omeletes',
    'Bebidas',
    'Cervejas',
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

  const ingredientesIndisponiveisMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    itens.forEach((item: any) => {
      if (Array.isArray(item.ingredientes_indisponiveis)) {
        map[String(item.id)] = item.ingredientes_indisponiveis
      }
    })
    return map
  }, [itens])

  const listaCategorias = useMemo(() => {
    return ORDEM_CATEGORIAS.filter((cat) => categorias[cat])
  }, [categorias])

  useEffect(() => {
    if (listaCategorias.length > 0 && categoriaAtiva === null) {
      setCategoriaAtiva(listaCategorias[0])
    }
  }, [listaCategorias, categoriaAtiva])

  // Callback para atualização de disponibilidade de produtos
  const handleProdutosDisponibilidadeUpdate = useCallback((itensAtualizados: any[]) => {
    setItens(itensAtualizados)
    console.log('📡 Cardápio atualizado em tempo real:', itensAtualizados.length, 'itens')
  }, [])

  // Realtime/Polling para disponibilidade de produtos (habilitar/desabilitar)
  useProdutosDisponibilidadeRealtime(handleProdutosDisponibilidadeUpdate)

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
  // Categorias que permitem customização completa
  const CATEGORIAS_CUSTOMIZAVEIS = ['Lanches', 'Macarrão', 'Omeletes']

  const handleAddItemClick = async (produto: any) => {
    if (!lojaAberta) {
      setErro('Estamos fechados no momento')
      return
    }

    if (CATEGORIAS_CUSTOMIZAVEIS.includes(produto.categoria)) {
      const [extras, removiveis] = await Promise.all([
        ingredientesService.getAdicionaisPorProduto(produto.id),
        ingredientesService.getRetirarPorProduto(produto.id),
      ])
      const removiveisComFallback = removiveis.length > 0
        ? removiveis
        : Array.isArray(produto.ingredientes)
        ? produto.ingredientes
        : []

      const temExtras = extras.length > 0
      const temRemoviveis = removiveisComFallback.length > 0

      setExtrasDisponiveis(extras)
      setIngredientesRemoviveisDisponiveis(removiveisComFallback)
      setProdutoSelecionado(produto)
      if (temExtras || temRemoviveis) {
        setPromptAberto(true)
      } else {
        // Produto da categoria, mas sem extras/removíveis: só observação
        setModalCustomizacaoAberto(true)
      }
    } else {
      // Para outros produtos, só permite observação
      setExtrasDisponiveis([])
      setProdutoSelecionado(produto)
      setModalCustomizacaoAberto(true)
    }
  }

  const handlePromptNo = () => {
    if (!produtoSelecionado) return

    add({
      id: String(produtoSelecionado.id),
      name: produtoSelecionado.nome,
      price: produtoSelecionado.preco,
      qty: 1,
      categoria: produtoSelecionado.categoria,
      ingredientes_indisponiveis: [],
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

    add({
      id: String(produtoSelecionado.id),
      name: produtoSelecionado.nome,
      price: produtoSelecionado.preco,
      qty: 1,
      categoria: produtoSelecionado.categoria,
      observacoes: data.observacoes,
      extras: data.extras,
      ingredientes_indisponiveis: data.ingredientes_indisponiveis,
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
      if (!nome.trim()) {
        throw new Error('Nome é obrigatório')
      }

      if (!validarTelefoneBrasileiro(telefone)) {
        throw new Error('Telefone inválido. Use o formato: (XX) XXXXX-XXXX')
      }


      if (tipoEntrega === 'entrega') {
        if (!endereco.trim() || !numero.trim() || !bairro.trim()) {
          throw new Error('Preencha rua, número e bairro para entrega')
        }
      }


      await criarPedido({
        cliente: nome,
        phone: telefone,
        tipoEntrega,
        endereco: tipoEntrega === 'entrega' ? endereco : undefined,
        numero: tipoEntrega === 'entrega' ? numero : undefined,
        bairro: tipoEntrega === 'entrega' ? bairro : undefined,
        formaPagamento,
        troco: formaPagamento === 'dinheiro' ? troco : undefined,
        taxaEntrega: tipoEntrega === 'entrega' ? taxaEntrega : 0,
      })

      setNomeClienteSucesso(nome)
      setCarrinhoAberto(false)
      setSucesso(true)
      setNome('')
      setTelefone('')
      setEndereco('')
      setNumero('')
      setBairro('')
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
        <div style={{ textAlign: 'right' }}>
          {statusLoading ? (
            <span style={{ fontSize: 12, color: '#fff' }}>Carregando...</span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: lojaAberta ? '#166534' : '#991b1b',
                background: lojaAberta ? '#dcfce7' : '#fee2e2',
                border: '1px solid',
                borderColor: lojaAberta ? '#86efac' : '#fecaca',
                padding: '4px 10px',
                borderRadius: 16,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: lojaAberta ? '#22c55e' : '#ef4444',
                  display: 'inline-block',
                }}
              />
              {lojaAberta ? 'Aberto' : 'Fechado'}
            </span>
          )}
          <span style={{ 
            fontSize: 12, 
            color: '#fff',
            fontWeight: 700,
            marginTop: 4,
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '4px 10px',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.4)',
          }}>
            ⏱️ {tempoEsperaDia}min
          </span>
        </div>
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

          <div style={{ position: 'relative' }}>
            <select
              value={categoriaAtiva || ''}
              onChange={(e) => scrollToCategoria(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                paddingRight: '40px',
                fontSize: 16,
                borderRadius: 10,
                border: '1px solid #ddd',
                background: '#fff',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              {listaCategorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                fontSize: 18,
                color: '#666',
              }}
            >
              ▼
            </div>
          </div>
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
        {listaCategorias.map((categoria) => (
          <div
            key={categoria}
            ref={(el) => (categoriaRefs.current[categoria] = el)}
          >
            <CategorySection
              categoria={categoria}
              itens={Array.isArray(categorias[categoria]) ? categorias[categoria] : []}
              onAddItem={handleAddItemClick}
              lojaAberta={lojaAberta}
              produtoAdicionado={produtoAdicionado}
              ingredientesIndisponiveisMap={ingredientesIndisponiveisMap}
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
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(39, 174, 96, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🛒</span>
            <span>{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
          </div>
          <span style={{ fontSize: 18 }}>R$ {total.toFixed(2)}</span>
        </button>
      )}

      {/* DRAWER */}
      <CartDrawer
        isOpen={carrinhoAberto}
        onClose={() => setCarrinhoAberto(false)}
        items={items}
        subtotal={subtotal}
        taxaEntrega={tipoEntrega === 'entrega' ? taxaEntrega : 0}
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
              boxSizing: 'border-box',
              marginBottom: 12,
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: '1px solid #ddd',
              background: '#fff',
            }}
          />

          <MaskedPhoneInput
            placeholder="Telefone *"
            value={telefone}
            onChange={(e: any) => setTelefone(e.target.value)}
            disabled={enviando}
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
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 140px',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <input
                  placeholder="Rua *"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  disabled={enviando}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: 14,
                    fontSize: 16,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                  }}
                />
                <input
                  placeholder="Número *"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  disabled={enviando}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: 14,
                    fontSize: 16,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                  }}
                />
              </div>
              <input
                placeholder="Bairro *"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={enviando}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: 12,
                  padding: 14,
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                }}
              />
            </>
          )}
          {(tipoEntrega === 'entrega' || tipoEntrega === 'retirada' || tipoEntrega === 'local') && (
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

              {formaPagamento === 'pix' && (
                <PixKeyDisplay
                  pixKey={PIX_CONFIG.key}
                  keyType={PIX_CONFIG.keyType}
                  recipientName={PIX_CONFIG.recipientName}
                  amount={total}
                />
              )}

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
            </>
          )}

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
            disabled={
              enviando ||
              !nome.trim() ||
              !telefone.trim() ||
              telefone.length < 10 ||
              items.length === 0 ||
              (tipoEntrega === 'entrega' && (!endereco.trim() || !numero.trim() || !bairro.trim()))
            }
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 10,
              border: 'none',
              background:
                enviando ||
                !nome.trim() ||
                !telefone.trim() ||
                telefone.length < 10 ||
                items.length === 0 ||
                (tipoEntrega === 'entrega' && (!endereco.trim() || !numero.trim() || !bairro.trim()))
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
      {/* Modal de customização só para categorias customizáveis */}
      {produtoSelecionado && CATEGORIAS_CUSTOMIZAVEIS.includes(produtoSelecionado.categoria) && (
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

      {/* Modal de customização: se categoria customizável, mostra tudo; senão, só observações */}
      {produtoSelecionado && (
        <ProductCustomizationModal
          isOpen={modalCustomizacaoAberto}
          produto={produtoSelecionado}
          extrasDisponiveis={CATEGORIAS_CUSTOMIZAVEIS.includes(produtoSelecionado.categoria) ? extrasDisponiveis : []}
          ingredientesRemoviveis={CATEGORIAS_CUSTOMIZAVEIS.includes(produtoSelecionado.categoria) ? ingredientesRemoviveisDisponiveis : []}
          ingredientesIndisponiveis={produtoSelecionado.ingredientes_indisponiveis || []}
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