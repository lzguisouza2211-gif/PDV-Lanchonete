import React, { useState } from 'react'

type ProductCardProps = {
  id: number
  nome: string
  preco: number
  descricao?: string
  onAdd: () => void
  isAdding?: boolean
}

export default function ProductCard({
  nome,
  preco,
  descricao,
  onAdd,
  isAdding = false,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    onAdd()
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 600)
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
      {justAdded && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#27ae60',
            color: '#fff',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            animation: 'bounceIn 0.3s ease',
            zIndex: 10,
          }}
        >
          ✓
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
          disabled={isAdding || justAdded}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: justAdded
              ? '#27ae60'
              : isAdding
              ? '#95a5a6'
              : '#c0392b',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: isAdding || justAdded ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            minWidth: 100,
            transform: justAdded ? 'scale(0.95)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!justAdded && !isAdding) {
              e.currentTarget.style.background = '#a93226'
            }
          }}
          onMouseLeave={(e) => {
            if (!justAdded && !isAdding) {
              e.currentTarget.style.background = '#c0392b'
            }
          }}
        >
          {justAdded ? '✓ Adicionado!' : isAdding ? 'Adicionando...' : 'Adicionar'}
        </button>
      </div>

      <style>{`
        @keyframes bounceIn {
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

