import React from 'react'

// Stub de PrivateRoute — integra com store de usuário futuramente
type Props = { children: React.ReactNode; role?: string }

export default function PrivateRoute({ children }: Props) {
  // Nota: durante migração não há auth; este componente já define o ponto
  // onde integrar Supabase Auth/roles. Por enquanto, bloqueia por padrão.
  const allowed = false // mudar para checagem real com useUser() da store
  if (!allowed) {
    return <div>Acesso restrito — rota protegida</div>
  }
  return children as JSX.Element
}
