import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MOCK_USUARIOS, type Usuario } from '../../shared/mock/data';

export async function fetchUsuarios(): Promise<Usuario[]> {
  if (!isSupabaseConfigured) return MOCK_USUARIOS;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, nivel_acesso, ativo, lojas(nome)')
    .order('nome');

  if (error) throw new Error(error.message);

  const nivelLabel: Record<string, string> = {
    colaborador: 'Colaborador',
    supervisor: 'Supervisor',
    administracao: 'Administração',
    admin: 'Admin',
  };

  return (data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    email: p.email,
    nivel: nivelLabel[p.nivel_acesso] ?? p.nivel_acesso,
    loja: (p.lojas as unknown as { nome: string } | null)?.nome,
    ativo: p.ativo,
  }));
}
