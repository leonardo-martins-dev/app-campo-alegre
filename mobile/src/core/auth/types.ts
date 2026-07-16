/**
 * Níveis de acesso do app (Campo Alegre).
 * Ordem hierárquica: admin > administracao ≥ supervisor > colaborador
 */
export type NivelAcesso = 'colaborador' | 'supervisor' | 'administracao' | 'admin';

export interface User {
  id: string;
  nome: string;
  email: string;
  nivelAcesso: NivelAcesso;
  lojaId?: string;
  lojaIds?: string[];
  telefone?: string;
  ativo: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
