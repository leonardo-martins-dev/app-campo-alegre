import type { NivelAcesso } from '../../core/auth/types';

export type TabName = 'Inicio' | 'Canhotos' | 'Procedimentos' | 'Gestao' | 'Mais';

/** Quais abas cada nível vê */
export const TABS_BY_ROLE: Record<NivelAcesso, TabName[]> = {
  colaborador: ['Inicio', 'Canhotos', 'Procedimentos'],
  supervisor: ['Inicio', 'Canhotos', 'Procedimentos', 'Gestao'],
  administracao: ['Inicio', 'Canhotos', 'Procedimentos', 'Gestao', 'Mais'],
  admin: ['Inicio', 'Canhotos', 'Procedimentos', 'Gestao', 'Mais'],
};

export const TAB_LABELS: Record<TabName, string> = {
  Inicio: 'Início',
  Canhotos: 'Canhotos',
  Procedimentos: 'Procedimentos',
  Gestao: 'Gestão',
  Mais: 'Mais',
};
