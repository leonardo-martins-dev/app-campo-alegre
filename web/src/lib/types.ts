export type NivelAcesso = 'colaborador' | 'supervisor' | 'administracao' | 'admin';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  nivel_acesso: NivelAcesso;
  loja_id: string | null;
  ativo: boolean;
}
