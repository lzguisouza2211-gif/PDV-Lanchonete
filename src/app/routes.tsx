import React from 'react'
import { BrowserRouter, Routes as R, Route } from 'react-router-dom'
import Cardapio from '../pages/pdv/Cardapio'
import Admin from '../pages/admin/Admin'
import PrivateRoute from '../components/route/PrivateRoute'
import Login from '../pages/auth/Login'


export default function Routes(): JSX.Element {
  return (
    <BrowserRouter>
      <R>
        <Route path='/' element={<Cardapio />} />
        <Route path='/admin/login' element={<Login />} />
        <Route
          path='/admin'
          element={<PrivateRoute><Admin /></PrivateRoute>}
        />
      </R>
    </BrowserRouter>
  )
}
