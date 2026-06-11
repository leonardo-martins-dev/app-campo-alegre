import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MOCK_LOJAS, type Loja } from '../../shared/mock/data';

export async function fetchLojasAtivas(): Promise<Loja[]> {
  if (!isSupabaseConfigured) {
    return MOCK_LOJAS.filter((l) => l.ativa);
  }

  const { data, error } = await supabase
    .from('lojas')
    .select('id, nome, codigo, regiao, ativa')
    .eq('ativa', true)
    .order('nome');

  if (error) throw new Error(error.message);

  return (data ?? []).map((l) => ({
    id: l.id,
    nome: l.nome,
    codigo: l.codigo,
    regiao: l.regiao,
    ativa: l.ativa,
  }));
}
