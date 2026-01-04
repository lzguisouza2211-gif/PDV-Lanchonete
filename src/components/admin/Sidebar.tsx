import { NavLink } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

export default function Sidebar() {
  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '10px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? '#0d6efd' : '#333',
    background: isActive ? '#e7f1ff' : 'transparent',
  })

  return (
    <aside
      style={{
        width: 240,
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Logo / Perfil */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#e9ecef',
            margin: '0 auto 8px',
          }}
        />
        <strong style={{ fontSize: 14 }}>Administrador</strong>
        <div style={{ fontSize: 12, color: '#666' }}>
          Luizão Lanches
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <NavLink to="/admin/dashboard" style={linkStyle}>
          📊 Dashboard
        </NavLink>

        <NavLink to="/admin/pedidos" style={linkStyle}>
          🧾 Pedidos
        </NavLink>
      </nav>

      {/* Rodapé */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={sair}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: 'none',
            background: '#f1f3f5',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}