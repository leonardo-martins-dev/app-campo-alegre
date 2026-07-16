import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MOCK_USUARIOS, type Usuario } from '../../shared/mock/data';
import type { NivelAcesso } from '../auth/types';

const NIVEL_LABEL: Record<string, string> = {
  colaborador: 'Colaborador',
  supervisor: 'Supervisor',
  administracao: 'Administrador',
  admin: 'Admin',
};

export type UsuarioDetalhe = Usuario & {
  telefone?: string | null;
  nivelAcesso: NivelAcesso;
  lojaIds: string[];
  lojasNomes: string[];
};

async function callManageUser(body: Record<string, unknown>) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('Sessão expirada. Faça login novamente.');

  const { data, error } = await supabase.functions.invoke('manage-user', {
    body,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function fetchUsuarios(): Promise<UsuarioDetalhe[]> {
  if (!isSupabaseConfigured) {
    return MOCK_USUARIOS.map((u) => ({
      ...u,
      nivelAcesso: 'colaborador' as NivelAcesso,
      lojaIds: [],
      lojasNomes: u.loja ? [u.loja] : [],
    }));
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, telefone, nivel_acesso, ativo, loja_id, usuario_lojas(loja_id, lojas(nome))')
    .order('nome');

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const links = (p.usuario_lojas as unknown as Array<{
      loja_id: string;
      lojas: { nome: string } | null;
    }> | null) ?? [];

    const lojaIds = links.map((l) => l.loja_id);
    const lojasNomes = links.map((l) => l.lojas?.nome).filter(Boolean) as string[];

    return {
      id: p.id,
      nome: p.nome,
      email: p.email,
      telefone: p.telefone,
      nivel: NIVEL_LABEL[p.nivel_acesso] ?? p.nivel_acesso,
      nivelAcesso: p.nivel_acesso as NivelAcesso,
      loja: lojasNomes.join(', ') || undefined,
      lojaIds,
      lojasNomes,
      ativo: p.ativo,
    };
  });
}

export async function createUsuario(input: {
  nome: string;
  email: string;
  telefone?: string;
  nivel_acesso: 'colaborador' | 'supervisor' | 'administracao';
  loja_ids: string[];
  password?: string;
}): Promise<{ temporary_password: string; email: string }> {
  const data = await callManageUser({ action: 'create', ...input });
  return {
    temporary_password: data.temporary_password as string,
    email: data.email as string,
  };
}

export async function updateUsuario(input: {
  user_id: string;
  nome?: string;
  telefone?: string | null;
  nivel_acesso?: NivelAcesso;
  loja_ids?: string[];
  ativo?: boolean;
}): Promise<void> {
  await callManageUser({ action: 'update', ...input });
}

export async function deactivateUsuario(userId: string): Promise<void> {
  await callManageUser({ action: 'deactivate', user_id: userId });
}

export async function deleteUsuario(userId: string): Promise<void> {
  await callManageUser({ action: 'delete', user_id: userId });
}
