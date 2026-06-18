import type { User, NivelAcesso } from './types';

export interface MockCredential {
  email: string;
  senha: string;
  nivelAcesso: NivelAcesso;
  nome: string;
}

/**
 * Usuários mockados para demonstração de níveis de acesso.
 * Senha para todos: 123456
 */
export const MOCK_USERS: MockCredential[] = [
  { email: 'colaborador@campoalegre.com', senha: '123456', nivelAcesso: 'colaborador', nome: 'Maria Colaboradora' },
  { email: 'supervisor@campoalegre.com', senha: '123456', nivelAcesso: 'supervisor', nome: 'João Supervisor' },
  { email: 'admin@campoalegre.com', senha: '123456', nivelAcesso: 'admin', nome: 'Admin Sistema' },
  { email: 'administracao@campoalegre.com', senha: '123456', nivelAcesso: 'administracao', nome: 'Ana Administração' },
];

export function findMockUser(email: string, senha: string): MockCredential | null {
  const normalizedEmail = email.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.email.toLowerCase() === normalizedEmail && u.senha === senha) ?? null;
}

export function mockUserToUser(cred: MockCredential): User {
  return {
    id: `mock-${cred.nivelAcesso}-${cred.email}`,
    nome: cred.nome,
    email: cred.email,
    nivelAcesso: cred.nivelAcesso,
    ativo: true,
  };
}
