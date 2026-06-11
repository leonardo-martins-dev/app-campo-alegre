import { supabase, isSupabaseConfigured } from '../supabase/client';
import { uploadImage } from './storage';
import {
  MOCK_PROCEDIMENTOS_PROMOTORES,
  MOCK_PROCEDIMENTOS_QUEBRA,
  CHECKLIST_PROMOTOR_11,
  MOCK_CHECKLIST_QUEBRA,
  type Procedimento,
} from '../../shared/mock/data';
import type { TipoProcedimentoDb } from '../supabase/database.types';

interface ChecklistItemInput {
  id: string;
  label: string;
  concluido: boolean;
  requiresPhoto: boolean;
}

export async function fetchChecklistTemplate(tipo: TipoProcedimentoDb) {
  if (!isSupabaseConfigured) {
    return tipo === 'promotor'
      ? CHECKLIST_PROMOTOR_11
      : MOCK_CHECKLIST_QUEBRA.map((i) => ({ ...i, requiresPhoto: i.id === '3' }));
  }

  const { data, error } = await supabase
    .from('checklist_templates')
    .select('id, label, requires_photo, ordem')
    .eq('tipo', tipo)
    .order('ordem');

  if (error || !data?.length) {
    return tipo === 'promotor' ? CHECKLIST_PROMOTOR_11 : MOCK_CHECKLIST_QUEBRA.map((i) => ({
      id: i.id,
      label: i.label,
      requiresPhoto: i.id === '3',
    }));
  }

  return data.map((i) => ({
    id: i.id,
    label: i.label,
    requiresPhoto: i.requires_photo,
  }));
}

export async function enviarProcedimento(params: {
  tipo: TipoProcedimentoDb;
  lojaId: string;
  usuarioId: string;
  itens: ChecklistItemInput[];
  fotos: Record<string, string[]>;
}): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { data: proc, error: procError } = await supabase
    .from('procedimentos')
    .insert({
      tipo: params.tipo,
      loja_id: params.lojaId,
      usuario_id: params.usuarioId,
      status: 'enviado',
      enviado_em: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (procError || !proc) throw new Error(procError?.message ?? 'Erro ao criar procedimento');

  const itensPayload = params.itens.map((i) => ({
    procedimento_id: proc.id,
    item_id: i.id,
    label: i.label,
    concluido: i.concluido,
    requires_photo: i.requiresPhoto,
  }));

  const { error: itensError } = await supabase.from('procedimento_itens').insert(itensPayload);
  if (itensError) throw new Error(itensError.message);

  for (const [itemId, uris] of Object.entries(params.fotos)) {
    for (let idx = 0; idx < uris.length; idx++) {
      const path = await uploadImage(
        'procedimentos-fotos',
        `${proc.id}/${itemId}/${idx}`,
        uris[idx]
      );
      if (path) {
        await supabase.from('procedimento_fotos').insert({
          procedimento_id: proc.id,
          item_id: itemId,
          storage_path: path,
        });
      }
    }
  }
}

export async function fetchProcedimentos(tipo: TipoProcedimentoDb): Promise<Procedimento[]> {
  if (!isSupabaseConfigured) {
    return tipo === 'promotor' ? MOCK_PROCEDIMENTOS_PROMOTORES : MOCK_PROCEDIMENTOS_QUEBRA;
  }

  const { data, error } = await supabase
    .from('procedimentos')
    .select('id, status, enviado_em, created_at, lojas(nome), profiles(nome), procedimento_itens(concluido)')
    .eq('tipo', tipo)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const itens = (p.procedimento_itens as { concluido: boolean }[]) ?? [];
    const itensOk = itens.filter((i) => i.concluido).length;
    return {
      id: p.id,
      colaborador: (p.profiles as unknown as { nome: string } | null)?.nome ?? '',
      loja: (p.lojas as unknown as { nome: string } | null)?.nome ?? '',
      data: p.enviado_em
        ? new Date(p.enviado_em).toLocaleDateString('pt-BR')
        : new Date(p.created_at).toLocaleDateString('pt-BR'),
      tipo,
      itensOk,
      itensTotal: itens.length,
      status: p.status === 'enviado' || p.status === 'conferido' ? 'completo' : 'pendente',
    };
  });
}
