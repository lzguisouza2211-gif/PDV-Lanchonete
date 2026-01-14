import React from 'react'

type ProductCardProps = {
  id: number
  nome: string
  preco: number
  descricao?: string
  onAdd: () => void
  isAdding?: boolean
  lojaAberta?: boolean
  justAdded?: boolean
  ingredientesIndisponiveis?: string[]
}

export default function ProductCard({
  nome,
  preco,
  descricao,
  onAdd,
  isAdding = false,
  lojaAberta = true,
  justAdded = false,
  ingredientesIndisponiveis = [],
}: ProductCardProps) {
  const handleAdd = () => {
    if (lojaAberta) {
      onAdd()
    }
  }

  return (
    <div
      style={{
        background: justAdded ? '#f0fdf4' : '#fff',
        borderRadius: 16,
        padding: 20,
        boxShadow: justAdded
          ? '0 4px 16px rgba(39, 174, 96, 0.3)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: justAdded ? '2px solid #27ae60' : '1px solid transparent',
        position: 'relative',
        overflow: 'hidden',
        animation: justAdded ? 'pulse 0.5s ease' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!justAdded) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)'
        }
      }}
      onMouseLeave={(e) => {
        if (!justAdded) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* Ícone de checkmark quando adicionado */}
      {justAdded && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#27ae60',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'scaleIn 0.3s ease',
            zIndex: 10,
          }}
        >
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>✓</span>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <strong
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1a1a1a',
            display: 'block',
            marginBottom: 8,
          }}
        >
          {nome}
        </strong>
        {descricao && (
          <p
            style={{
              fontSize: 13,
              color: '#666',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {descricao}
          </p>
        )}
        {ingredientesIndisponiveis.length > 0 && (
          <div
            style={{
              marginTop: 8,
              padding: '8px 10px',
              borderRadius: 10,
              background: '#fff7ed',
              border: '1px dashed #f39c12',
              color: '#b35c00',
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            Hoje estamos sem: {ingredientesIndisponiveis.join(', ')}.
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#c0392b',
          }}
        >
          R$ {preco.toFixed(2)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation()
            handleAdd()
          }}
          disabled={isAdding || !lojaAberta || justAdded}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: !lojaAberta
              ? '#95a5a6'
              : justAdded
              ? '#27ae60'
              : isAdding
              ? '#95a5a6'
              : '#c0392b',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: isAdding || !lojaAberta || justAdded ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            minWidth: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            if (!isAdding && lojaAberta && !justAdded) {
              e.currentTarget.style.background = '#a93226'
            }
          }}
          onMouseLeave={(e) => {
            if (!isAdding && lojaAberta && !justAdded) {
              e.currentTarget.style.background = '#c0392b'
            }
          }}
        >
          {!lojaAberta
            ? 'Loja Fechada'
            : justAdded
            ? '✓ Adicionado!'
            : isAdding
            ? 'Adicionando...'
            : 'Adicionar'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

