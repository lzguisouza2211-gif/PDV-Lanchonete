import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import Header from '../../components/admin/Header'

export default function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex' }}>
      <Sidebar />

      <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', marginLeft: 250, flex: 1 }}>
        <Header />

        <main style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}