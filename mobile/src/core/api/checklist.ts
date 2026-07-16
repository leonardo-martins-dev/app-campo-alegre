import { supabase, isSupabaseConfigured } from '../supabase/client';
import {
  getChecklistColab,
  setChecklistColab,
  type ChecklistColab,
} from '../storage/storage';

function todayLocalISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export type ChecklistDiarioUpdate = {
  canhotos?: boolean;
  procedimento?: boolean;
  quebra?: boolean;
  registrado?: boolean;
  registradoEm?: string | null;
};

/**
 * Carrega checklist do dia: prioriza banco; faz fallback/cache local.
 */
export async function fetchChecklistHoje(usuarioId: string): Promise<ChecklistColab | null> {
  const data = todayLocalISO();

  if (!isSupabaseConfigured) {
    return getChecklistColab();
  }

  const { data: row, error } = await supabase
    .from('checklist_diario')
    .select('data, canhotos, procedimento, quebra, registrado, registrado_em')
    .eq('usuario_id', usuarioId)
    .eq('data', data)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    const local = await getChecklistColab();
    return local;
  }

  const mapped: ChecklistColab = {
    data: row.data,
    canhotos: row.canhotos,
    procedimento: row.procedimento,
    quebra: row.quebra,
    registrado: row.registrado,
    registradoEm: row.registrado_em ?? undefined,
  };

  await setChecklistColab(mapped);
  return mapped;
}

/**
 * Upsert do checklist do dia no Supabase (+ cache local).
 */
export async function upsertChecklistHoje(
  usuarioId: string,
  lojaId: string | null | undefined,
  updates: ChecklistDiarioUpdate
): Promise<ChecklistColab> {
  const data = todayLocalISO();
  const local = await setChecklistColab({
    canhotos: updates.canhotos,
    procedimento: updates.procedimento,
    quebra: updates.quebra,
    registrado: updates.registrado,
    registradoEm: updates.registradoEm ?? undefined,
  });

  if (!isSupabaseConfigured) return local;

  const payload = {
    usuario_id: usuarioId,
    loja_id: lojaId ?? null,
    data,
    canhotos: local.canhotos,
    procedimento: local.procedimento,
    quebra: local.quebra,
    registrado: local.registrado ?? false,
    registrado_em: local.registrado ? (local.registradoEm ?? new Date().toISOString()) : null,
  };

  const { data: row, error } = await supabase
    .from('checklist_diario')
    .upsert(payload, { onConflict: 'usuario_id,data' })
    .select('data, canhotos, procedimento, quebra, registrado, registrado_em')
    .single();

  if (error) throw new Error(error.message);

  const mapped: ChecklistColab = {
    data: row.data,
    canhotos: row.canhotos,
    procedimento: row.procedimento,
    quebra: row.quebra,
    registrado: row.registrado,
    registradoEm: row.registrado_em ?? undefined,
  };
  await setChecklistColab(mapped);
  return mapped;
}

/** Contagem de checklists registrados hoje (métrica dashboard). */
export async function countChecklistsRegistradosHoje(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const data = todayLocalISO();
  const { count, error } = await supabase
    .from('checklist_diario')
    .select('id', { count: 'exact', head: true })
    .eq('data', data)
    .eq('registrado', true);
  if (error) throw new Error(error.message);
  return count ?? 0;
}
