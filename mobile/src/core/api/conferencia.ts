import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MOCK_CONFERENCIA, type ConferenciaItem } from '../../shared/mock/data';

export async function fetchResumoConferenciaPorLoja(): Promise<ConferenciaItem[]> {
  if (!isSupabaseConfigured) return MOCK_CONFERENCIA;

  const { data: lojas, error: lojasError } = await supabase
    .from('lojas')
    .select('id, nome')
    .eq('ativa', true)
    .order('nome');

  if (lojasError) throw new Error(lojasError.message);

  const items: ConferenciaItem[] = [];

  for (const loja of lojas ?? []) {
    const { data: canhotos } = await supabase
      .from('canhotos')
      .select('status')
      .eq('loja_id', loja.id);

    const lista = canhotos ?? [];
    items.push({
      id: loja.id,
      loja: loja.nome,
      canhotosEnviados: lista.filter((c) => c.status === 'enviado' || c.status === 'aprovado').length,
      canhotosPendentes: lista.filter((c) => c.status === 'pendente').length,
      divergencias: lista.filter((c) => c.status === 'divergente').length,
      ultimaAtualizacao: new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }

  return items;
}
