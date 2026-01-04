import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Cardapio from '../pages/pdv/Cardapio'
import Admin from '../pages/admin/Admin'
import AdminLogin from '../pages/admin/AdminLogin'
import PrivateRoute from '../components/route/PrivateRoute'

console.log('AppRoutes loaded')

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cardapio />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
