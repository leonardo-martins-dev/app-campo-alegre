import { createClient } from '@/lib/supabase/server';

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
    { label: 'Canhotos hoje', value: canhotosHoje.count ?? 0, color: 'border-sky-500' },
    { label: 'Canhotos pendentes', value: pendentes.count ?? 0, color: 'border-amber-500' },
    { label: 'Procedimentos hoje', value: procedimentosHoje.count ?? 0, color: 'border-violet-500' },
    { label: 'Divergências', value: divergencias.count ?? 0, color: 'border-red-500' },
    { label: 'Usuários ativos', value: usuarios.count ?? 0, color: 'border-emerald-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`bg-white rounded-lg border-l-4 ${c.color} p-5 shadow-sm`}>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-slate-600 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
