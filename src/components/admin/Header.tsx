import { useState } from 'react'

export default function Header() {
  const [aberto, setAberto] = useState(true)

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* TÍTULO */}
      <strong style={{ fontSize: 18 }}>Painel Administrativo</strong>

      {/* AÇÕES */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span
          style={{
            fontSize: 14,
            color: aberto ? '#28a745' : '#dc3545',
            fontWeight: 600,
          }}
        >
          {aberto ? 'Aberto' : 'Fechado'}
        </span>

        <button
          onClick={() => setAberto(!aberto)}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            border: 'none',
            background: aberto ? '#28a745' : '#6c757d',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {aberto ? 'Fechar' : 'Abrir'}
        </button>
      </div>
    </header>
  )
}