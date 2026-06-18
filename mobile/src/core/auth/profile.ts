import type { User, NivelAcesso } from './types';
import { supabase } from '../supabase/client';

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, nivel_acesso, loja_id, ativo')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    nivelAcesso: data.nivel_acesso as NivelAcesso,
    lojaId: data.loja_id ?? undefined,
    ativo: data.ativo,
  };
}
