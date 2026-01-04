import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/route/PrivateRoute'
import AdminLayout from '../pages/admin/AdminLayout'
import AdminDashboard from '../pages/admin/Dashboard'
import AdminPedidos from '../pages/admin/Admin' // kanban
import Login from '../pages/auth/Login'
import Cardapio from '../pages/pdv/Cardapio'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cardapio />} />
        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="pedidos" element={<AdminPedidos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
