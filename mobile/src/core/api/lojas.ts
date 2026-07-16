import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MOCK_LOJAS, type Loja } from '../../shared/mock/data';

export async function fetchLojas(includeInactive = false): Promise<Loja[]> {
  if (!isSupabaseConfigured) {
    return includeInactive ? MOCK_LOJAS : MOCK_LOJAS.filter((l) => l.ativa);
  }

  let query = supabase.from('lojas').select('id, nome, codigo, regiao, ativa').order('nome');
  if (!includeInactive) query = query.eq('ativa', true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((l) => ({
    id: l.id,
    nome: l.nome,
    codigo: l.codigo,
    regiao: l.regiao,
    ativa: l.ativa,
  }));
}

/** @deprecated use fetchLojas() */
export async function fetchLojasAtivas(): Promise<Loja[]> {
  return fetchLojas(false);
}

export async function createLoja(input: {
  nome: string;
  codigo: string;
  regiao: string;
}): Promise<Loja> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');

  const { data, error } = await supabase
    .from('lojas')
    .insert({
      nome: input.nome.trim(),
      codigo: input.codigo.trim().toUpperCase(),
      regiao: input.regiao.trim(),
      ativa: true,
    })
    .select('id, nome, codigo, regiao, ativa')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateLoja(
  id: string,
  input: Partial<{ nome: string; codigo: string; regiao: string; ativa: boolean }>
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase não configurado');

  const patch: Record<string, unknown> = {};
  if (input.nome !== undefined) patch.nome = input.nome.trim();
  if (input.codigo !== undefined) patch.codigo = input.codigo.trim().toUpperCase();
  if (input.regiao !== undefined) patch.regiao = input.regiao.trim();
  if (input.ativa !== undefined) patch.ativa = input.ativa;

  const { error } = await supabase.from('lojas').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}
