import { supabase, isSupabaseConfigured } from '../supabase/client';
import { uploadImage, getSignedImageUrl } from './storage';
import {
  MOCK_CANHOTOS,
  MOCK_CANHOTOS_LANCADOS,
  MOCK_CANHOTOS_SISTEMA,
  MOCK_NUMEROS_CANHOTO,
  type Canhoto,
  type CanhotoLancadoDetalhe,
  type CanhotoSistema,
} from '../../shared/mock/data';

export async function fetchNumerosCanhotoDisponiveis(lojaId?: string): Promise<string[]> {
  if (!isSupabaseConfigured) return MOCK_NUMEROS_CANHOTO;

  let query = supabase
    .from('canhotos_sistema')
    .select('numero')
    .eq('status', 'disponivel')
    .order('numero');

  if (lojaId) query = query.eq('loja_id', lojaId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.numero);
}

export async function registrarCanhoto(params: {
  numero: string;
  lojaId: string;
  usuarioId: string;
  /** 1 a 3 URIs locais */
  photoUris: string[];
  observacoes?: string;
}): Promise<void> {
  if (!isSupabaseConfigured) return;

  const uris = params.photoUris.filter(Boolean).slice(0, 3);
  if (uris.length === 0) throw new Error('Anexe pelo menos uma foto.');

  const draftId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const paths: string[] = [];
  for (let i = 0; i < uris.length; i++) {
    const path = await uploadImage(
      'canhotos-fotos',
      `${params.lojaId}/${draftId}/${i}`,
      uris[i]
    );
    if (!path) throw new Error('Falha no upload da imagem.');
    paths.push(path);
  }

  const { data: inserted, error } = await supabase
    .from('canhotos')
    .insert({
      numero: params.numero,
      loja_id: params.lojaId,
      usuario_id: params.usuarioId,
      foto_path: paths[0],
      status: 'enviado',
      observacoes: params.observacoes ?? null,
      enviado_em: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  if (!inserted?.id) throw new Error('Falha ao registrar canhoto.');

  const fotosRows = paths.map((storage_path, ordem) => ({
    canhoto_id: inserted.id,
    storage_path,
    ordem,
  }));

  const { error: fotosError } = await supabase.from('canhoto_fotos').insert(fotosRows);
  if (fotosError) throw new Error(fotosError.message);
}

/** Registra vários canhotos em sequência (até 3 fotos cada). */
export async function registrarCanhotos(
  items: Array<{
    numero: string;
    photoUris: string[];
    observacoes?: string;
  }>,
  ctx: { lojaId: string; usuarioId: string }
): Promise<void> {
  for (const item of items) {
    await registrarCanhoto({
      numero: item.numero,
      lojaId: ctx.lojaId,
      usuarioId: ctx.usuarioId,
      photoUris: item.photoUris,
      observacoes: item.observacoes,
    });
  }
}

export async function fetchCanhotos(usuarioId?: string, lojaId?: string): Promise<Canhoto[]> {
  if (!isSupabaseConfigured) return MOCK_CANHOTOS;

  let query = supabase
    .from('canhotos')
    .select('id, numero, loja_id, status, enviado_em, created_at, lojas(nome)')
    .order('created_at', { ascending: false });

  if (usuarioId) query = query.eq('usuario_id', usuarioId);
  if (lojaId) query = query.eq('loja_id', lojaId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => ({
    id: c.id,
    numero: c.numero,
    loja: (c.lojas as unknown as { nome: string } | null)?.nome ?? '',
    data: c.created_at?.slice(0, 10) ?? '',
    status: c.status as Canhoto['status'],
    enviadoEm: c.enviado_em
      ? new Date(c.enviado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : undefined,
  }));
}

/** Quantidade de canhotos enviados pelo usuário hoje (status enviado/aprovado). */
export async function countCanhotosEnviadosHoje(usuarioId: string): Promise<number> {
  const list = await fetchCanhotos(usuarioId);
  const now = new Date();
  const hoje = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return list.filter(
    (c) => (c.status === 'enviado' || c.status === 'aprovado') && c.data === hoje
  ).length;
}

export async function fetchCanhotosLancados(lojaId?: string): Promise<CanhotoLancadoDetalhe[]> {
  if (!isSupabaseConfigured) {
    return MOCK_CANHOTOS_LANCADOS.filter((c) => !lojaId || c.loja.includes(lojaId));
  }

  let query = supabase
    .from('canhotos')
    .select('id, numero, status, observacoes, foto_path, enviado_em, created_at, lojas(nome), profiles(nome)')
    .order('created_at', { ascending: false });

  if (lojaId) query = query.eq('loja_id', lojaId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const items: CanhotoLancadoDetalhe[] = [];
  for (const c of data ?? []) {
    let fotoUrl: string | undefined;
    if (c.foto_path) {
      fotoUrl = (await getSignedImageUrl('canhotos-fotos', c.foto_path)) ?? undefined;
    }
    items.push({
      id: c.id,
      numero: c.numero,
      loja: (c.lojas as unknown as { nome: string } | null)?.nome ?? '',
      data: c.created_at?.slice(0, 10) ?? '',
      status: c.status as CanhotoLancadoDetalhe['status'],
      enviadoEm: c.enviado_em
        ? new Date(c.enviado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : undefined,
      usuario: (c.profiles as unknown as { nome: string } | null)?.nome ?? '',
      fotoUrl,
      observacoes: c.observacoes ?? undefined,
    });
  }
  return items;
}

export async function fetchCanhotosSistema(lojaId?: string): Promise<CanhotoSistema[]> {
  if (!isSupabaseConfigured) return MOCK_CANHOTOS_SISTEMA;

  let query = supabase.from('canhotos_sistema').select('*').order('numero');
  if (lojaId) query = query.eq('loja_id', lojaId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => ({
    numero: c.numero,
    data: c.data,
    nfe: c.nfe,
    total: c.total,
    nome_fantasia: c.nome_fantasia,
    status: c.status,
  }));
}

type StatusConferenciaCanhoto = Canhoto['status'];

export async function atualizarStatusCanhoto(
  canhotoId: string,
  status: StatusConferenciaCanhoto,
  conferidoPor: string,
  observacao?: string
): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error: updateError } = await supabase
    .from('canhotos')
    .update({ status })
    .eq('id', canhotoId);

  if (updateError) throw new Error(updateError.message);

  const conferenciaStatus =
    status === 'aprovado'
      ? 'aprovado'
      : status === 'rejeitado'
        ? 'rejeitado'
        : status === 'divergente'
          ? 'divergente'
          : 'aprovado';

  const { error: confError } = await supabase.from('conferencias').insert({
    entidade_tipo: 'canhoto',
    entidade_id: canhotoId,
    conferido_por: conferidoPor,
    status: conferenciaStatus,
    observacao: observacao ?? null,
  });

  if (confError) throw new Error(confError.message);
}
