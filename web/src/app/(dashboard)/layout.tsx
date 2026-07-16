import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/DashboardShell';
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
    <DashboardShell nivel={profile.nivel_acesso} nome={profile.nome}>
      {children}
    </DashboardShell>
  );
}
