import React, { useState, useEffect, useMemo } from 'react'
import Select from '../ui/Select'
import { useSaboresRefrigerante } from '../../hooks/useSaboresRefrigerante'
import { useSaboresDelValle } from '../../hooks/useSaboresDelValle'

const PLACEHOLDER_POR_CATEGORIA: Record<string, string> = {
  Lanches: 'Ex: ponto da carne',
  Macarrão: 'Ex: Dividir ao meio',
  Porções: 'Ex: sem cebola, ponto da carne, retirar tomate',
  Omeletes: 'Ex: diminuir quantidade de ovos',
  Bebidas: 'Ex: sem gelo',
  Cervejas: 'Ex: gelada, sem gelo',
  Doce: 'Ex: sem canela, mais calda'
}

export type ExtraOption = {
  id: string
  nome: string
  preco: number
  tipo: 'add' | 'remove'
}

export type CustomizationData = {
  extras: ExtraOption[]
  observacoes: string
  ingredientes_indisponiveis?: string[]
}

type ProductCustomizationModalProps = {
  isOpen: boolean
  onClose: () => void
  produto: {
    id: number
    nome: string
    preco: number
    descricao?: string
  }
  extrasDisponiveis?: ExtraOption[]
  ingredientesRemoviveis?: string[]
  ingredientesIndisponiveis?: string[]
  onConfirm: (data: CustomizationData) => void
}

export default function ProductCustomizationModal({
  isOpen,
  onClose,
  produto,
  extrasDisponiveis = [],
  ingredientesRemoviveis = [],
  ingredientesIndisponiveis = [],
  onConfirm,
}: ProductCustomizationModalProps) {
  const [extrasSelecionados, setExtrasSelecionados] = useState<string[]>([])
  // Dropdown de sabor de refrigerante ou del valle
  const isRefrigerante = produto.categoria?.toLowerCase?.() === 'refrigerante' || produto.nome?.toLowerCase?.().includes('refrigerante')
  const isDelValle = produto.categoria?.toLowerCase?.() === 'del valle' || produto.nome?.toLowerCase?.().includes('del valle')
  let tipoRefrigerante = produto.tipo || ''
  if (!tipoRefrigerante && isRefrigerante) {
    const nome = produto.nome?.toLowerCase?.() || ''
    if (nome.includes('2l')) tipoRefrigerante = '2l'
    else if (nome.includes('600')) tipoRefrigerante = '600ml'
    else if (nome.includes('lata')) tipoRefrigerante = 'lata'
    else tipoRefrigerante = 'lata'
  }
  const { sabores: saboresRefrigerante, loading: loadingSaboresRefrigerante } = useSaboresRefrigerante(tipoRefrigerante)
  const { sabores: saboresDelValle, loading: loadingSaboresDelValle } = useSaboresDelValle()
  const [saborSelecionado, setSaborSelecionado] = useState<string>('')
  const [ingredientesRemovidos, setIngredientesRemovidos] = useState<string[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [adicionarExpandido, setAdicionarExpandido] = useState(false)
  const [retirarExpandido, setRetirarExpandido] = useState(false)

  // Resetar estados quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      setExtrasSelecionados([])
      setIngredientesRemovidos([])
      setObservacoes('')
      setSaborSelecionado('')
    }
    if (isOpen) {
      setAdicionarExpandido(false)
      setRetirarExpandido(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  // Corrige bug: se todos ingredientesIndisponiveis vierem do banco como FALSE, não há indisponíveis reais
  const { indisponiveisHoje, indisponiveisKey } = useMemo(() => {
    if (!Array.isArray(ingredientesIndisponiveis)) {
      return { indisponiveisHoje: [] as string[], indisponiveisKey: '' }
    }

    // Se todos os ingredientesIndisponiveis são iguais aos removíveis ou ingredientes do produto, e todos estão como FALSE, não há indisponíveis reais
    // Então, só considera como indisponível se vier pelo menos um valor não vazio e diferente dos ingredientes do produto
    const list = ingredientesIndisponiveis
      .filter(Boolean)
      .map((i) => i.trim())

    // Se vier todos os ingredientes do produto, mas todos estão disponíveis, não mostra nada
    if (list.length === 0) {
      return { indisponiveisHoje: [], indisponiveisKey: '' }
    }

    return {
      indisponiveisHoje: list,
      indisponiveisKey: list.join('|'),
    }
  }, [ingredientesIndisponiveis])

  const indisponiveisSet = useMemo(
    () => new Set(indisponiveisHoje.map((i) => i.toLowerCase())),
    [indisponiveisHoje]
  )

  const extrasAddList = useMemo(
    () => (Array.isArray(extrasDisponiveis) ? extrasDisponiveis : []).filter((e) => e.tipo === 'add'),
    [extrasDisponiveis]
  )

  const extrasSelecionadosDetalhe = useMemo(
    () => extrasAddList.filter((extra) => extrasSelecionados.includes(extra.id)),
    [extrasAddList, extrasSelecionados]
  )

  // Troca grátis: se o produto tem N ingredientes indisponíveis, o usuário pode escolher N extras quaisquer para serem grátis (exceto contra-filé)
  const { priceById, totalExtrasAdicionados } = useMemo(() => {
    const order = extrasSelecionados
    const freeSlots = Array.isArray(ingredientesIndisponiveis) ? ingredientesIndisponiveis.filter(Boolean).length : 0
    let freeUsed = 0
    const priceMap: Record<string, number> = {}

    order.forEach((id) => {
      const extra = extrasAddList.find((e) => e.id === id)
      if (!extra) return
      const nome = (extra.nome || '').toLowerCase().trim()
      const isContraFile = /contra[- ]?file/.test(nome)
      if (!isContraFile && freeUsed < freeSlots) {
        priceMap[id] = 0
        freeUsed++
      } else {
        priceMap[id] = extra.preco
      }
    })

    const total = extrasSelecionadosDetalhe.reduce(
      (sum, extra) => sum + (priceMap[extra.id] ?? extra.preco),
      0
    )

    return { priceById: priceMap, totalExtrasAdicionados: total }
  }, [extrasSelecionados, extrasSelecionadosDetalhe, extrasAddList, ingredientesIndisponiveis])

  // Garantir que ingredientesRemoviveis seja array
  const ingredientesLista = Array.isArray(ingredientesRemoviveis) ? ingredientesRemoviveis : []

  // Removido: não abrir dropdown automaticamente

  const toggleExtra = (id: string) => {
    setExtrasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((extraId) => extraId !== id) : [...prev, id]
    )
  }

  const toggleIngrediente = (ingrediente: string) => {
    setIngredientesRemovidos((prev) =>
      prev.includes(ingrediente)
        ? prev.filter((i) => i !== ingrediente)
        : [...prev, ingrediente]
    )
  }

  const calcularPrecoTotal = () => {
    return produto.preco + totalExtrasAdicionados
  }

  const handleConfirm = () => {
    // Apenas ingredientes removidos pelo usuário (não incluir os indisponíveis aqui)
    const indisponiveisSet = new Set(indisponiveisHoje.map(i => i.toLowerCase()))
    const removidosSet = new Set<string>(
      ingredientesRemovidos.filter(ing => !indisponiveisSet.has(ing.toLowerCase()))
    )

    const extras_final: ExtraOption[] = [
      ...extrasSelecionadosDetalhe.map((extra) => ({
        ...extra,
        preco: priceById[extra.id] ?? extra.preco,
      })),
      ...Array.from(removidosSet).map((nome) => ({
        id: `remove-${nome}`,
        nome,
        preco: 0,
        tipo: 'remove' as const,
      })),
    ]

    let obs = observacoes.trim()
    if ((isRefrigerante || isDelValle) && saborSelecionado) {
      obs = `Sabor: ${saborSelecionado}` + (obs ? ` | ${obs}` : '')
    }
    onConfirm({
      extras: extras_final,
      observacoes: obs,
      ingredientes_indisponiveis: indisponiveisHoje,
    })
    
    // Reset
    setExtrasSelecionados([])
    setIngredientesRemovidos([])
    setObservacoes('')
    setAdicionarExpandido(false)
    setRetirarExpandido(false)
  }

  if (!isOpen) return null

  const placeholderObservacoes =
      PLACEHOLDER_POR_CATEGORIA[produto.categoria || ''] ||
      'Digite aqui alguma observação...'

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 3000,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal - Compacto */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          padding: 20,
          maxWidth: 400,
          width: '90%',
          maxHeight: '75vh',
          overflowY: 'auto',
          zIndex: 3001,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
            {produto.nome}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            ✕
          </button>
        </div>

        {/* Preço base - Compacto */}
        {/* Dropdown de sabor de refrigerante ou del valle */}
        {(isRefrigerante || isDelValle) && (
          <Select
            label="Escolha o sabor"
            value={saborSelecionado}
            onChange={e => setSaborSelecionado(e.target.value)}
            options={
              isRefrigerante
                ? saboresRefrigerante.map((s: any) => ({ value: s.sabor, label: s.sabor }))
                : saboresDelValle.map((s: any) => ({ value: s.sabor, label: s.sabor }))
            }
            loading={isRefrigerante ? loadingSaboresRefrigerante : loadingSaboresDelValle}
            disabled={
              (isRefrigerante && (loadingSaboresRefrigerante || saboresRefrigerante.length === 0)) ||
              (isDelValle && (loadingSaboresDelValle || saboresDelValle.length === 0))
            }
          />
        )}
        <div
          style={{
            padding: 8,
            background: '#f9f9f9',
            borderRadius: 8,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
            Base
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#c0392b' }}>
            R$ {produto.preco.toFixed(2)}
          </div>
        </div>

        {indisponiveisHoje.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background: '#fff7ed',
              border: '1px dashed #f39c12',
            }}
          >
            <div style={{ fontWeight: 700, color: '#b35c00', fontSize: 14, marginBottom: 4 }}>
              ⚠️ Hoje estamos sem: {indisponiveisHoje.join(', ')}
            </div>
          </div>
        )}

        {/* Seção Adicionar */}
        {extrasAddList.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setAdicionarExpandido(!adicionarExpandido)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                border: '2px solid #27ae60',
                borderRadius: 8,
                background: adicionarExpandido ? '#f2fff6' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: adicionarExpandido ? 12 : 0,
              }}
              onMouseEnter={(e) => {
                if (!adicionarExpandido) {
                  e.currentTarget.style.background = '#f2fff6'
                }
              }}
              onMouseLeave={(e) => {
                if (!adicionarExpandido) {
                  e.currentTarget.style.background = '#fff'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>➕</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
                  Adicionar ingredientes
                </span>
                {extrasSelecionados.length > 0 && (
                  <span
                    style={{
                      background: '#27ae60',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {extrasSelecionados.length}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {totalExtrasAdicionados > 0 && (
                  <span style={{ fontSize: 13, color: '#27ae60', fontWeight: 700 }}>
                    + R$ {totalExtrasAdicionados.toFixed(2)}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 18,
                    color: '#27ae60',
                    transform: adicionarExpandido ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  ▼
                </span>
              </div>
            </button>

            {adicionarExpandido && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                {extrasAddList.map((extra) => {
                  const checked = extrasSelecionados.includes(extra.id)
                  const nomeLower = extra.nome.toLowerCase()
                  const isContraFile = /contra[- ]?file/.test(nomeLower)
                  const adjustedPrice = priceById[extra.id] ?? extra.preco
                  const isGratis = checked && adjustedPrice === 0 && !isContraFile
                  return (
                    <label
                      key={extra.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 10,
                        border: `2px solid ${checked ? '#27ae60' : '#e0e0e0'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: checked ? '#f2fff6' : '#fff',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!checked) {
                          e.currentTarget.style.borderColor = '#27ae60'
                          e.currentTarget.style.background = '#f2fff6'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!checked) {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                          e.currentTarget.style.background = '#fff'
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExtra(extra.id)}
                        style={{
                          width: 18,
                          height: 18,
                          cursor: 'pointer',
                          accentColor: '#27ae60',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                          {extra.nome}
                        </span>
                        <span style={{ fontSize: 13, color: isGratis ? '#b35c00' : '#27ae60', fontWeight: 700 }}>
                          {isGratis ? 'Grátis (substituição)' : `+ R$ ${adjustedPrice.toFixed(2)}`}
                        </span>
                      </div>
                      {checked && <span style={{ fontSize: 16, color: '#27ae60', fontWeight: 700 }}>✓</span>}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Seção Retirar - Expansível */}
        {ingredientesLista.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setRetirarExpandido(!retirarExpandido)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                border: '2px solid #e74c3c',
                borderRadius: 8,
                background: retirarExpandido ? '#fff5f5' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: retirarExpandido ? 12 : 0,
              }}
              onMouseEnter={(e) => {
                if (!retirarExpandido) {
                  e.currentTarget.style.background = '#fff5f5'
                }
              }}
              onMouseLeave={(e) => {
                if (!retirarExpandido) {
                  e.currentTarget.style.background = '#fff'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>➖</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
                  Retirar ingredientes
                </span>
                {ingredientesRemovidos.length > 0 && (
                  <span
                    style={{
                      background: '#e74c3c',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {ingredientesRemovidos.length}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 18,
                  color: '#e74c3c',
                  transform: retirarExpandido ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                ▼
              </span>
            </button>

            {retirarExpandido && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
                {ingredientesLista.map((ingrediente) => {
                  const isRemoved = ingredientesRemovidos.includes(ingrediente)
                  const isIndisponivelHoje = indisponiveisSet.has(ingrediente.toLowerCase())
                  return (
                    <label
                      key={ingrediente}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: 10,
                        border: `2px solid ${isRemoved || isIndisponivelHoje ? '#e74c3c' : '#e0e0e0'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: isRemoved || isIndisponivelHoje ? '#fee' : '#fff',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isRemoved && !isIndisponivelHoje) {
                          e.currentTarget.style.borderColor = '#e74c3c'
                          e.currentTarget.style.background = '#fff5f5'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isRemoved && !isIndisponivelHoje) {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                          e.currentTarget.style.background = '#fff'
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isRemoved || isIndisponivelHoje}
                        onChange={() => !isIndisponivelHoje && toggleIngrediente(ingrediente)}
                        disabled={isIndisponivelHoje}
                        style={{
                          width: 18,
                          height: 18,
                          cursor: 'pointer',
                          accentColor: '#e74c3c',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: isRemoved || isIndisponivelHoje ? '#991b1b' : '#1a1a1a' }}>
                        Sem {ingrediente} {isIndisponivelHoje ? '(faltando hoje)' : ''}
                      </span>
                      {(isRemoved || isIndisponivelHoje) && (
                        <span style={{ fontSize: 16, color: '#e74c3c', fontWeight: 700 }}>
                          ✕
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 6,
              color: '#1a1a1a',
            }}
          >
            Observações
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder={placeholderObservacoes}
            rows={2}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 14,
              borderRadius: 8,
              border: '1px solid #ddd',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Total */}
        <div
          style={{
            padding: 12,
            background: '#f9f9f9',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Total:</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#c0392b' }}>
            R$ {calcularPrecoTotal().toFixed(2)}
          </span>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: '2px solid #ddd',
              background: '#fff',
              color: '#666',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999'
              e.currentTarget.style.background = '#f5f5f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd'
              e.currentTarget.style.background = '#fff'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              background: '#27ae60',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#229954'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#27ae60'
            }}
          >
            Adicionar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translate(-50%, -40%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          div[style*="maxWidth: 400"] {
            max-width: 95% !important;
            padding: 16px !important;
            max-height: 85vh !important;
          }
        }
      `}</style>
    </>
  )
}

