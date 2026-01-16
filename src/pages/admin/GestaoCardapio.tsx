import { useState, useEffect } from 'react'
import { cardapioService, ItemCardapio } from '../../services/api/cardapio.service'

interface MenuItem {
  id: string
  nome: string
  categoria: string
  preco: number
  disponivel: boolean
  ingredientes?: string[]
}

export default function GestaoCardapio() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceDraft, setPriceDraft] = useState<Record<string, number>>({})
  const [ingredientesIndisponiveis, setIngredientesIndisponiveis] = useState<Record<string, string[]>>({})

  const carregarTodos = async () => {
    try {
      setLoading(true)
      const itens = await cardapioService.listAll()
      const indisponiveis = await cardapioService.listarIngredientesIndisponiveisHoje()
      
      const items = itens.map(item => ({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        preco: item.preco,
        disponivel: item.disponivel ?? true,
        ingredientes: item.ingredientes ?? [],
      }))
      
      setMenuItems(items)
      setIngredientesIndisponiveis(indisponiveis)
      const drafts: Record<string, number> = {}
      items.forEach(i => { drafts[i.id] = i.preco })
      setPriceDraft(drafts)
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error)
      alert('Erro ao carregar cardápio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarTodos()
  }, [])

  const handleToggleAvailability = async (id: string) => {
    try {
      setUpdating(id)
      // Atualização otimista - muda logo na UI
      setMenuItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, disponivel: !item.disponivel } : item
        )
      )
      // Depois sincroniza com banco
      await cardapioService.toggleDisponibilidade(id)
    } catch (error: any) {
      console.error('Erro ao atualizar disponibilidade:', error)
      // Recarrega se falhar
      await carregarTodos()
      alert(`Erro ao atualizar disponibilidade do produto:\n${error?.message}`)
    } finally {
      setUpdating(null)
    }
  }

  const handleSavePrice = async (id: string) => {
    try {
      setUpdating(id)
      const novoPreco = priceDraft[id]
      // Atualização otimista
      setMenuItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, preco: novoPreco } : item
        )
      )
      // Sincroniza com banco
      await cardapioService.atualizarPreco(id, novoPreco)
    } catch (error: any) {
      console.error('Erro ao atualizar preço:', error)
      await carregarTodos()
      alert(`Erro ao atualizar preço:\n${error?.message}`)
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleIngrediente = async (id: string, ingrediente: string) => {
    try {
      setUpdating(id)
      const lista = ingredientesIndisponiveis[id] || []
      const jaIndisponivel = lista.includes(ingrediente)
      
      // Atualização otimista
      setIngredientesIndisponiveis(prev => ({
        ...prev,
        [id]: jaIndisponivel
          ? prev[id].filter(ing => ing !== ingrediente)
          : [...(prev[id] || []), ingrediente]
      }))
      
      // Sincroniza com banco
      await cardapioService.definirIngredienteIndisponivel(id, ingrediente, !jaIndisponivel)
    } catch (error: any) {
      console.error('Erro ao atualizar ingrediente:', error)
      await carregarTodos()
      alert(`Erro ao atualizar ingrediente:\n${error?.message}`)
    } finally {
      setUpdating(null)
    }
  }

  const getCategoryIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      'Lanches': '🍔',
      'Bebidas Quentes': '☕',
      'Bebidas Frias': '🧊',
      'Sobremesas': '🍰',
      'Acompanhamentos': '🍟',
    }
    return icons[categoria] || '🍽️'
  }

  const categories = ['all', ...new Set(menuItems.map(item => item.categoria))]
  
  let filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.categoria === selectedCategory)
  
  if (searchTerm) {
    filteredItems = filteredItems.filter(item =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const disponiveisCount = menuItems.filter(i => i.disponivel).length
  const indisponivelCount = menuItems.filter(i => !i.disponivel).length

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', color: '#1a1a1a' }}>
          Gestão de Cardápio
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
          Gerencie a disponibilidade de produtos do seu cardápio em tempo real
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
          <p style={{ fontSize: 18, margin: 0 }}>Carregando cardápio...</p>
        </div>
      ) : (
        <>
          {/* Stats e Filtros */}
          <div style={{
            background: '#fff',
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                  {disponiveisCount}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>Disponíveis</div>
                  <div>produtos ativos</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>
                  {indisponivelCount}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>Indisponíveis</div>
                  <div>produtos ocultos</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>
                  {menuItems.length}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>Total</div>
                  <div>produtos cadastrados</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Buscar produto por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '12px',
            overflowX: 'auto',
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: selectedCategory === cat ? '#c0392b' : '#6b7280',
                  cursor: 'pointer',
                  borderBottom: selectedCategory === cat ? '2px solid #c0392b' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.color = '#374151'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.color = '#6b7280'
                  }
                }}
              >
                {cat === 'all' ? `Todos (${menuItems.length})` : `${cat} (${menuItems.filter(i => i.categoria === cat).length})`}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9ca3af',
              background: '#f9fafb',
              borderRadius: '12px',
            }}>
              <p style={{ fontSize: 16, margin: 0 }}>
                {searchTerm ? '❌ Nenhum produto encontrado' : '📭 Nenhum produto nesta categoria'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: item.disponivel ? '#fff' : '#f9fafb',
                    border: `1px solid ${item.disponivel ? '#e5e7eb' : '#d1d5db'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    opacity: item.disponivel ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    if (item.disponivel) {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '8px',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                      }}>
                        {getCategoryIcon(item.categoria)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '15px',
                          color: '#1a1a1a',
                          lineHeight: '1.3',
                        }}>
                          {item.nome}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                          {item.categoria}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preço */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={priceDraft[item.id] ?? item.preco}
                        onChange={(e) => setPriceDraft(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid #e5e7eb',
                          fontSize: 14,
                        }}
                      />
                      <button
                        onClick={() => handleSavePrice(item.id)}
                        disabled={updating === item.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#c0392b',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: updating === item.id ? 'wait' : 'pointer',
                          opacity: updating === item.id ? 0.7 : 1,
                        }}
                      >
                        {updating === item.id ? 'Salvando...' : 'Salvar preço'}
                      </button>
                    </div>

                    {/* Ingredientes indisponíveis hoje */}
                    {item.ingredientes && item.ingredientes.length > 0 && (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 8 }}>
                          Ingredientes indisponíveis (hoje)
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {item.ingredientes.map((ing) => {
                            const indispo = (ingredientesIndisponiveis[item.id] || []).includes(ing)
                            return (
                              <button
                                key={ing}
                                onClick={() => handleToggleIngrediente(item.id, ing)}
                                disabled={updating === item.id}
                                style={{
                                  border: '1px solid ' + (indispo ? '#ef4444' : '#e5e7eb'),
                                  background: indispo ? '#fee2e2' : '#fff',
                                  color: indispo ? '#991b1b' : '#374151',
                                  padding: '6px 10px',
                                  borderRadius: 16,
                                  fontSize: 12,
                                  cursor: updating === item.id ? 'wait' : 'pointer',
                                }}
                              >
                                {indispo ? '✗ ' : ''}{ing}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                  {/* Status Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: item.disponivel ? '#dcfce7' : '#fee2e2',
                    color: item.disponivel ? '#166534' : '#991b1b',
                    fontSize: '12px',
                    fontWeight: 600,
                    width: 'fit-content',
                  }}>
                    <span>{item.disponivel ? '✓' : '✗'}</span>
                    {item.disponivel ? 'Disponível' : 'Indisponível'}
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleAvailability(item.id)}
                    disabled={updating === item.id}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: updating === item.id ? 'wait' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: updating === item.id ? 0.6 : 1,
                      background: item.disponivel ? '#fee2e2' : '#dcfce7',
                      color: item.disponivel ? '#991b1b' : '#166534',
                    }}
                    onMouseEnter={(e) => {
                      if (updating !== item.id) {
                        e.currentTarget.style.opacity = '0.8'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = updating === item.id ? '0.6' : '1'
                    }}
                  >
                    {updating === item.id ? '⏳ Atualizando...' : (item.disponivel ? '❌ Desabilitar' : '✓ Habilitar')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
