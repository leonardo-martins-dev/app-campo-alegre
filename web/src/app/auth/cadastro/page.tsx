'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

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
    <AuthLayout title="Definir senha" subtitle="Complete seu cadastro no Campo Alegre">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-slate-600">
          Você foi convidado para o Campo Alegre. Crie sua senha para continuar.
        </p>
        {!ready && (
          <Alert variant="warning">
            Abra este link pelo e-mail de convite. Se já estiver logado, defina a senha abaixo.
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="senha">Nova senha</Label>
          <Input
            id="senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmar">Confirmar senha</Label>
          <Input
            id="confirmar"
            type="password"
            placeholder="Repita a senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Ativar conta
        </Button>
      </form>
    </AuthLayout>
  );
}
