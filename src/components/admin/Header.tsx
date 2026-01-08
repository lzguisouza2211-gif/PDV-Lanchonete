import { useState } from 'react'

export default function Header() {
  const [aberto, setAberto] = useState(true)
  const agora = new Date()
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 20,
            background: aberto ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${aberto ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: aberto ? '#22c55e' : '#ef4444',
              display: 'block',
              animation: aberto ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span
            style={{
              fontSize: 14,
              color: aberto ? '#166534' : '#991b1b',
              fontWeight: 600,
            }}
          >
            {aberto ? 'Aberto' : 'Fechado'}
          </span>
        </div>

        <button
          onClick={() => setAberto(!aberto)}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            border: 'none',
            background: aberto
              ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
              : 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: `0 2px 8px rgba(${aberto ? '220, 53, 69' : '40, 167, 69'}, 0.3)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = `0 4px 12px rgba(${aberto ? '220, 53, 69' : '40, 167, 69'}, 0.4)`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 2px 8px rgba(${aberto ? '220, 53, 69' : '40, 167, 69'}, 0.3)`
          }}
        >
          {aberto ? '🔴 Fechar' : '🟢 Abrir'}
        </button>
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
