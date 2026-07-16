import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Receipt,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [canhotosHoje, pendentes, procedimentosHoje, divergencias, usuarios] = await Promise.all([
    supabase.from('canhotos').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
    supabase.from('canhotos').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('procedimentos').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
    supabase.from('canhotos').select('id', { count: 'exact', head: true }).eq('status', 'divergente'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('ativo', true),
  ]);

  const cards = [
    {
      label: 'Canhotos hoje',
      value: canhotosHoje.count ?? 0,
      icon: Receipt,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      label: 'Canhotos pendentes',
      value: pendentes.count ?? 0,
      icon: AlertTriangle,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Procedimentos hoje',
      value: procedimentosHoje.count ?? 0,
      icon: ClipboardList,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Divergências',
      value: divergencias.count ?? 0,
      icon: AlertTriangle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      label: 'Usuários ativos',
      value: usuarios.count ?? 0,
      icon: Users,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral das operações do dia"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.label}
              className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-slate-900">{c.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{c.label}</p>
                  </div>
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', c.iconBg)}>
                    <Icon className={cn('h-5 w-5', c.iconColor)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Sistema operacional — dados atualizados em tempo real via Supabase.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
