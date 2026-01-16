import React, { useState, useEffect, useMemo } from 'react'

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
  if (!isOpen) return null

  const [extrasSelecionados, setExtrasSelecionados] = useState<string[]>([])
  const [ingredientesRemovidos, setIngredientesRemovidos] = useState<string[]>([])
  const [observacoes, setObservacoes] = useState('')
  const [adicionarExpandido, setAdicionarExpandido] = useState(false)
  const [retirarExpandido, setRetirarExpandido] = useState(false)
  const [substituicoes, setSubstituicoes] = useState<Record<string, string>>({})

  // Resetar estados quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      setExtrasSelecionados([])
      setIngredientesRemovidos([])
      setObservacoes('')
      setAdicionarExpandido(false)
      setRetirarExpandido(false)
      setSubstituicoes({})
    }
  }, [isOpen])

  const { indisponiveisHoje, indisponiveisKey } = useMemo(() => {
    if (!Array.isArray(ingredientesIndisponiveis)) {
      return { indisponiveisHoje: [] as string[], indisponiveisKey: '' }
    }

    const list = ingredientesIndisponiveis
      .filter(Boolean)
      .map((i) => i.trim())

    return {
      indisponiveisHoje: list,
      indisponiveisKey: list.join('|'),
    }
  }, [ingredientesIndisponiveis])

  const indisponiveisSet = useMemo(
    () => new Set(indisponiveisHoje.map((i) => i.toLowerCase())),
    [indisponiveisHoje]
  )

  const extrasAdicionais = extrasDisponiveis.filter((e) => e.tipo === 'add')
  // Mapeia extras com flag de substituição para ingredientes indisponíveis
  const extrasComSubstituicao = extrasAdicionais.map((extra) => ({
    ...extra,
    isSubstituicao: indisponiveisSet.has(extra.nome.toLowerCase()),
  }))
  
  // Garantir que ingredientesRemoviveis seja array
  const ingredientesLista = Array.isArray(ingredientesRemoviveis) ? ingredientesRemoviveis : []

  useEffect(() => {
    if (!isOpen) return

    setIngredientesRemovidos((prev) => {
      const merged = new Set(prev)
      indisponiveisHoje.forEach((ing) => merged.add(ing))
      return Array.from(merged)
    })

    setSubstituicoes(
      indisponiveisHoje.reduce((acc, ing) => {
        acc[ing] = ''
        return acc
      }, {} as Record<string, string>)
    )

    if (indisponiveisHoje.length > 0) {
      setRetirarExpandido(true)
    }
  }, [isOpen, indisponiveisKey])

  const toggleExtra = (id: string) => {
    setExtrasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
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
    const precoBase = produto.preco

    // Número de ingredientes grátis = número de ingredientes faltando
    const qtdGratis = indisponiveisHoje.length

    // Extras selecionados (sem substituições - aquelas já são de substituição)
    const extras = extrasSelecionados.map((id) =>
      extrasDisponiveis.find((e) => e.id === id)
    ).filter((e): e is ExtraOption => !!e)

    // Ordena extras por preço descendente (mais caros primeiro ficam grátis)
    const extrasOrdenados = [...extras].sort((a, b) => b.preco - a.preco)

    // Primeiros N extras são grátis (onde N = qtd de indisponíveis)
    const precoExtras = extrasOrdenados.reduce((total, extra, index) => {
      const ehGratis = index < qtdGratis
      return total + (ehGratis ? 0 : extra.preco)
    }, 0)

    return precoBase + precoExtras
  }

  // Determina quais extras são grátis
  const extrasGratisMap = useMemo(() => {
    const qtdGratis = indisponiveisHoje.length
    const extras = extrasSelecionados.map((id) =>
      extrasDisponiveis.find((e) => e.id === id)
    ).filter((e): e is ExtraOption => !!e)

    const extrasOrdenados = [...extras].sort((a, b) => b.preco - a.preco)
    const gratis = new Set(extrasOrdenados.slice(0, qtdGratis).map((e) => e.id))
    return gratis
  }, [extrasSelecionados, indisponiveisHoje, extrasDisponiveis])

  const handleConfirm = () => {
    const removidosSet = new Set<string>([
      ...ingredientesRemovidos,
      ...indisponiveisHoje,
    ])

    const extrasSelecionadosObjs = extrasSelecionados
      .map((id) => extrasDisponiveis.find((e) => e.id === id))
      .filter((e): e is ExtraOption => !!e)

    const substituicoesExtras = Object.values(substituicoes)
      .filter((id) => !!id)
      .map((id) => extrasDisponiveis.find((e) => e.id === id))
      .filter((e): e is ExtraOption => !!e)

    const extrasMap = new Map<string, ExtraOption>()
    ;[...extrasSelecionadosObjs, ...substituicoesExtras].forEach((extra) => {
      extrasMap.set(extra.id, extra)
    })

    // Determina quais extras são grátis (por substituição)
    const qtdGratis = indisponiveisHoje.length
    const extras = Array.from(extrasMap.values())
    const extrasOrdenados = [...extras].sort((a, b) => b.preco - a.preco)
    const gratisSet = new Set(extrasOrdenados.slice(0, qtdGratis).map((e) => e.id))

    const extras_final: ExtraOption[] = [
      ...extrasMap.values(),
      ...Array.from(removidosSet).map((nome) => ({
        id: `remove-${nome}`,
        nome,
        preco: 0,
        tipo: 'remove' as const,
      })),
    ]

    // Marca os extras que são grátis por substituição
    const extrasComMarcacao = extras_final.map((e) => ({
      ...e,
      _isFreeSubstituicao: gratisSet.has(e.id),
    }))

    onConfirm({
      extras: extrasComMarcacao as ExtraOption[],
      observacoes: observacoes.trim(),
      ingredientes_indisponiveis: indisponiveisHoje,
    })
    
    // Reset
    setExtrasSelecionados([])
    setIngredientesRemovidos([])
    setObservacoes('')
    setAdicionarExpandido(false)
    setRetirarExpandido(false)
  }

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
            <div style={{ fontSize: 13, color: '#6b3b00', lineHeight: 1.4 }}>
              Você pode escolher outro ingrediente no lugar do que falta, sem custo adicional.
            </div>
          </div>
        )}

        {/* Seção Adicionar - Expansível */}
        {extrasComSubstituicao.length > 0 && (
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
                background: adicionarExpandido ? '#f0fdf4' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: adicionarExpandido ? 12 : 0,
              }}
              onMouseEnter={(e) => {
                if (!adicionarExpandido) {
                  e.currentTarget.style.background = '#f0fdf4'
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
            </button>

            {adicionarExpandido && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {extrasComSubstituicao.map((extra) => {
                  const isSelected = extrasSelecionados.includes(extra.id)
                  return (
                    <label
                      key={extra.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        border: `2px solid ${isSelected ? '#27ae60' : '#e0e0e0'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: isSelected ? '#f0fdf4' : '#fff',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#27ae60'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e0e0e0'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleExtra(extra.id)}
                          style={{
                            width: 20,
                            height: 20,
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{ fontSize: 15, fontWeight: 500 }}>
                          {extra.nome}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color:
                            extrasGratisMap.has(extra.id) && isSelected
                              ? '#f39c12'
                              : '#27ae60',
                        }}
                      >
                        {extrasGratisMap.has(extra.id) && isSelected
                          ? 'Grátis'
                          : `+ R$ ${extra.preco.toFixed(2)}`}
                      </span>
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
            placeholder="Ex: Bem passado..."
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

