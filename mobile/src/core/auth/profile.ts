import type { User, NivelAcesso } from './types';
import { supabase } from '../supabase/client';

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, telefone, nivel_acesso, loja_id, ativo, usuario_lojas(loja_id)')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  const lojaIds =
    ((data.usuario_lojas as unknown as Array<{ loja_id: string }> | null) ?? []).map(
      (l) => l.loja_id
    );

  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone ?? undefined,
    nivelAcesso: data.nivel_acesso as NivelAcesso,
    lojaId: data.loja_id ?? lojaIds[0] ?? undefined,
    lojaIds,
    ativo: data.ativo,
  };
}
