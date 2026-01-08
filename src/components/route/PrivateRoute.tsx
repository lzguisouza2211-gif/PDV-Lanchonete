import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

type Props = {
  children: JSX.Element
}

export default function PrivateRoute({ children }: Props) {
  const { loading, isAdmin } = useAdminAuth()

  if (loading) {
    return <p>Verificando acesso...</p>
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children

  return children
}
