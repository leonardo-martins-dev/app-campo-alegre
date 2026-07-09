'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

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
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Entrar
      </Button>
    </form>
  );
}
