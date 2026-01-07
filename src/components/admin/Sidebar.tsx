import { NavLink } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

const linkStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  textDecoration: 'none',
  color: '#333',
  fontWeight: 500,
}

const activeStyle = {
  background: '#f4f5f7',
  fontWeight: 700,
}

export default function Sidebar() {
  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (
    <aside
      style={{
        width: 240,
        background: '#fff',
        borderRight: '1px solid #e5e5e5',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* LOGO / PERFIL */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#ddd',
            margin: '0 auto 8px',
          }}
        />
        <strong style={{ display: 'block' }}>Luizão Lanches</strong>
        <span style={{ fontSize: 12, color: '#777' }}>
          Administrador
        </span>
      </div>

      {/* NAVEGAÇÃO */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <NavLink
          to="/admin/dashboard"
          style={({ isActive }) =>
            isActive
              ? { ...linkStyle, ...activeStyle }
              : linkStyle
          }
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/admin/pedidos"
          style={({ isActive }) =>
            isActive
              ? { ...linkStyle, ...activeStyle }
              : linkStyle
          }
        >
          📦 Pedidos
        </NavLink>

        <NavLink
          to="/admin/financeiro"
          style={({ isActive }) =>
            isActive
              ? { ...linkStyle, ...activeStyle }
              : linkStyle
          }
        >
          💰 Financeiro
        </NavLink>
      </nav>

      {/* SAIR */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={sair}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 8,
            border: 'none',
            background: '#dc3545',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
