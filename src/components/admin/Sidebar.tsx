import { NavLink } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

export default function Sidebar() {
  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  return (

      <aside
        className="admin-sidebar"
        style={{
          width: 200,
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          padding: '24px 24px 150px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          boxShadow: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1000,
        }}
      >
      {/* LOGO / PERFIL */}
      <div
        style={{
          textAlign: 'center',
          paddingBottom: 24,
          borderBottom: '2px solid #f3f4f6',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            boxShadow: '0 4px 12px rgba(192, 57, 43, 0.3)',
          }}
        >
          🍔
        </div>
        <strong
          style={{
            display: 'block',
            fontSize: 18,
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 4,
          }}
        >
          Luizão Lanches
        </strong>
        <span
          style={{
            fontSize: 13,
            color: '#666',
            background: '#f3f4f6',
            padding: '4px 12px',
            borderRadius: 12,
            display: 'inline-block',
          }}
        >
          Administrador
        </span>
      </div>

      {/* NAVEGAÇÃO */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NavLink
          to="/admin/dashboard"
          style={({ isActive }) => ({
            padding: '14px 16px',
            borderRadius: 12,
            textDecoration: 'none',
            color: isActive ? '#c0392b' : '#666',
            fontWeight: isActive ? 700 : 500,
            background: isActive ? '#fef2f2' : 'transparent',
            borderLeft: isActive ? '4px solid #c0392b' : '4px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 15,
            transition: 'all 0.2s ease',
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = '#f9fafb'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: 20 }}>📊</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/pedidos"
          style={({ isActive }) => ({
            padding: '14px 16px',
            borderRadius: 12,
            textDecoration: 'none',
            color: isActive ? '#c0392b' : '#666',
            fontWeight: isActive ? 700 : 500,
            background: isActive ? '#fef2f2' : 'transparent',
            borderLeft: isActive ? '4px solid #c0392b' : '4px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 15,
            transition: 'all 0.2s ease',
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = '#f9fafb'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: 20 }}>📦</span>
          Pedidos
        </NavLink>

        <NavLink
          to="/admin/financeiro"
          style={({ isActive }) => ({
            padding: '14px 16px',
            borderRadius: 12,
            textDecoration: 'none',
            color: isActive ? '#c0392b' : '#666',
            fontWeight: isActive ? 700 : 500,
            background: isActive ? '#fef2f2' : 'transparent',
            borderLeft: isActive ? '4px solid #c0392b' : '4px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 15,
            transition: 'all 0.2s ease',
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = '#f9fafb'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: 20 }}>💰</span>
          Financeiro
        </NavLink>

        <NavLink
          to="/admin/gestao-cardapio"
          style={({ isActive }) => ({
            padding: '14px 16px',
            borderRadius: 12,
            textDecoration: 'none',
            color: isActive ? '#c0392b' : '#666',
            fontWeight: isActive ? 700 : 500,
            background: isActive ? '#fef2f2' : 'transparent',
            borderLeft: isActive ? '4px solid #c0392b' : '4px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 15,
            transition: 'all 0.2s ease',
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = '#f9fafb'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.style.background.includes('fef2f2')) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: 20 }}>🍽️</span>
          Cardápio
        </NavLink>
      </nav>

      {/* SAIR */}
      <div style={{ marginTop: 'auto', paddingTop: 24, paddingBottom: 48, borderTop: '2px solid #f3f4f6' }}>
        <button
          onClick={sair}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)'
          }}
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}
