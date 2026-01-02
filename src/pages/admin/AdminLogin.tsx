import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        });

        if (error || !data.user) {
            setError('Falha no login. Verifique suas credenciais.');
            setLoading(false);
            return;
        }

        //verifica se é admin
        const { data: admin } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', data.user.id)
            .eq('ativo', true)
            .single();

        if (!admin) {
            await supabase.auth.signOut();
            setError('Acesso negado. Usuário não é administrador.');
            setLoading(false);
            return;
        }

        navigate('/admin');
    }

    return (
        <main>
            <h1>Login Administrador</h1>

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
    );
}