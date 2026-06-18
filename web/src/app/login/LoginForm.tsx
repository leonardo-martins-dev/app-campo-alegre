'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === 'acesso_negado' ? 'Acesso restrito à administração.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (authError) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-4">
      <h1 className="text-2xl font-bold text-sky-700 text-center">Campo Alegre</h1>
      <p className="text-sm text-slate-500 text-center">Painel de administração</p>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white py-2 rounded-lg font-medium hover:bg-sky-700 disabled:opacity-60"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
