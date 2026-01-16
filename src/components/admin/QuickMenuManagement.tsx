import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cardapioService } from '../../services/api/cardapio.service'

interface MenuItem {
  id: string
  nome: string
  categoria: string
  preco: number
  disponivel: boolean
}

export default function QuickMenuManagement() {
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  const carregarTodos = async () => {
    try {
      setLoading(true)
      const itens = await cardapioService.listAll()
      
      const items = itens.map(item => ({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        preco: item.preco,
        disponivel: item.disponivel ?? true,
      }))
      
      setMenuItems(items)
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarTodos()
  }, [])

  const disponiveisCount = menuItems.filter(i => i.disponivel).length
  const indisponivelCount = menuItems.filter(i => !i.disponivel).length

  return (
    <div
      style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => navigate('/admin/gestao-cardapio')}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <h2 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
        Gestão de Cardápio
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <p style={{ fontSize: 12, margin: 0 }}>Carregando...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981', lineHeight: '1' }}>
              {disponiveisCount}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: '6px' }}>Disponíveis</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444', lineHeight: '1' }}>
              {indisponivelCount}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: '6px' }}>Indisponíveis</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6', lineHeight: '1' }}>
              {menuItems.length}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: '6px' }}>Total</div>
          </div>
        </div>
      )}
    </div>
  )
}
