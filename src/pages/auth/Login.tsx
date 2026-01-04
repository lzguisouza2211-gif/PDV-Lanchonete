import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 1️⃣ Login via Supabase
    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

    if (authError || !data.user) {
      setError('Email ou senha inválidos')
      setLoading(false)
      return
    }

    // 2️⃣ Verifica se é admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', data.user.id)
      .eq('ativo', true)
      .maybeSingle()

    if (adminError || !admin) {
      await supabase.auth.signOut()
      setError('Acesso negado: usuário não é administrador')
      setLoading(false)
      return
    }

    // 3️⃣ Sucesso → admin
    navigate('/Admin')
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>Login do Administrador</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
