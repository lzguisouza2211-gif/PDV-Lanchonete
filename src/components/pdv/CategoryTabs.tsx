import React from 'react'

type CategoryTabsProps = {
  categorias: string[]
  categoriaAtiva: string | null
  onSelectCategoria: (categoria: string) => void
}

export default function CategoryTabs({
  categorias,
  categoriaAtiva,
  onSelectCategoria,
}: CategoryTabsProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 80,
        background: '#fff',
        padding: '16px 0',
        zIndex: 90,
        borderBottom: '2px solid #f3f4f6',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '0 24px',
          justifyContent: 'center',
        }}
      >
        {categorias.map((categoria) => {
          const isActive = categoriaAtiva === categoria
          return (
            <button
              key={categoria}
              onClick={() => onSelectCategoria(categoria)}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                background: isActive ? '#c0392b' : '#f3f4f6',
                color: isActive ? '#fff' : '#666',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive
                  ? '0 2px 8px rgba(192, 57, 43, 0.3)'
                  : 'none',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#e5e7eb'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f3f4f6'
                }
              }}
            >
              {categoria}
            </button>
          )
        })}
      </div>
    </div>
  )
}

