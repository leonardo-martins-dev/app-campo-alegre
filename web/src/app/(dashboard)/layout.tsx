import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nivel_acesso, nome, ativo')
    .eq('id', user.id)
    .single();

  if (!profile?.ativo) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar nivel={profile.nivel_acesso} />
      <main className="flex-1 p-6 md:p-8">
        <header className="mb-6">
          <p className="text-sm text-slate-500">Olá, {profile.nome}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
