export default function Header() {
  const aberto = true // depois ligamos isso ao banco

  return (
    <header
      style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Esquerda */}
      <div>
        <h2 style={{ margin: 0, fontSize: 18 }}>Luizão Lanches</h2>
        <span style={{ fontSize: 12, color: '#666' }}>
          Painel Administrativo
        </span>
      </div>

      {/* Direita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            background: aberto ? '#e6f4ea' : '#fdecea',
            color: aberto ? '#1e7e34' : '#a71d2a',
          }}
        >
          {aberto ? 'Aberto' : 'Fechado'}
        </div>

        <button
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: aberto ? '#dc3545' : '#28a745',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {aberto ? 'Fechar' : 'Abrir'}
        </button>
      </div>
    </header>
  )
}