import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import Header from '../../components/admin/Header'

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f5f7' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}