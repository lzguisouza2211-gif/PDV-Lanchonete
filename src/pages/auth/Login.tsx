import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error || !data.user) {
      setError('Credenciais inválidas')
      setLoading(false)
      return
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', data.user.id)
      .eq('ativo', true)
      .maybeSingle()

    if (!admin) {
      await supabase.auth.signOut()
      setError('Usuário não autorizado')
      setLoading(false)
      return
    }

<<<<<<< HEAD
    // 3️⃣ Sucesso → admin
    navigate('/Admin/dashboard')
=======
    navigate('/admin/dashboard')
>>>>>>> 71a35be153a8df41a71499e0c723f0bab413268b
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f5f7',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 12,
          width: 360,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Área Administrativa</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12 }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12 }}
        />

        {error && (
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: 'none',
            background: '#c0392b',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}