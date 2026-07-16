import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MOCK_DASHBOARD } from '../../shared/mock/data';
import { countChecklistsRegistradosHoje } from './checklist';

function todayLocalISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function fetchDashboardMetrics() {
  if (!isSupabaseConfigured) return MOCK_DASHBOARD;

  const today = todayLocalISO();

  const [canhotosHoje, canhotosPendentes, procedimentosHoje, divergencias, usuariosAtivos, checklistsHoje] =
    await Promise.all([
      supabase.from('canhotos').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
      supabase.from('canhotos').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
      supabase.from('procedimentos').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
      supabase.from('canhotos').select('id', { count: 'exact', head: true }).eq('status', 'divergente'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('ativo', true),
      countChecklistsRegistradosHoje().catch(() => 0),
    ]);

  return {
    canhotosHoje: canhotosHoje.count ?? 0,
    canhotosPendentes: canhotosPendentes.count ?? 0,
    procedimentosHoje: procedimentosHoje.count ?? 0,
    divergenciasPendentes: divergencias.count ?? 0,
    usuariosAtivos: usuariosAtivos.count ?? 0,
    checklistsRegistradosHoje: checklistsHoje,
  };
}
