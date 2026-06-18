'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CadastroPage() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: senha });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('nivel_acesso')
      .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .single();

    if (profile?.nivel_acesso === 'admin' || profile?.nivel_acesso === 'administracao') {
      router.push('/dashboard');
    } else {
      router.push('/login?msg=cadastro_ok');
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-4">
        <h1 className="text-xl font-bold">Definir senha</h1>
        <p className="text-sm text-slate-600">Você foi convidado para o Campo Alegre. Crie sua senha para continuar.</p>
        {!ready && (
          <p className="text-amber-600 text-sm">
            Abra este link pelo e-mail de convite. Se já estiver logado, defina a senha abaixo.
          </p>
        )}
        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white py-2 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Ativar conta'}
        </button>
      </form>
    </div>
  );
}
