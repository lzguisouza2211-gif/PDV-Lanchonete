import { useState } from 'react'
import { useStoreStatus } from '../../hooks/useStoreStatus'

export default function Header() {
  const { isOpen, loading, toggleStatus } = useStoreStatus()
  const [toggling, setToggling] = useState(false)
  const agora = new Date()
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleToggle = async () => {
    setToggling(true)
    await toggleStatus(!isOpen)
    setToggling(false)
  }

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* TÍTULO E DATA */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 4,
          }}
        >
          Painel Administrativo
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: '#666',
            textTransform: 'capitalize',
          }}
        >
          {dataFormatada}
        </p>
      </div>

      {/* AÇÕES */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {!loading && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 20,
                background: isOpen ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${isOpen ? '#bbf7d0' : '#fecaca'}`,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isOpen ? '#22c55e' : '#ef4444',
                  display: 'block',
                  animation: isOpen ? 'pulse 2s infinite' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: isOpen ? '#166534' : '#991b1b',
                  fontWeight: 600,
                }}
              >
                {isOpen ? 'Aberto' : 'Fechado'}
              </span>
            </div>

            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: 56,
                height: 30,
                cursor: toggling ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isOpen}
                onChange={handleToggle}
                disabled={toggling || loading}
                style={{
                  opacity: 0,
                  width: 0,
                  height: 0,
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: isOpen ? '#27ae60' : '#e74c3c',
                  borderRadius: 30,
                  transition: 'background 0.3s ease',
                  opacity: toggling ? 0.6 : 1,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    height: 24,
                    width: 24,
                    left: isOpen ? 28 : 3,
                    bottom: 3,
                    background: '#fff',
                    borderRadius: '50%',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </span>
            </label>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </header>
  )
}
