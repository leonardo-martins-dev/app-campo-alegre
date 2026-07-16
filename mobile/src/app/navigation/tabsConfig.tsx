import type { NivelAcesso } from '../../core/auth/types';

export type TabName = 'Inicio' | 'Canhotos' | 'Procedimentos' | 'Gestao' | 'Mais';

/** Quais abas cada nível vê (v1 — procedimentos ocultos) */
export const TABS_BY_ROLE: Record<NivelAcesso, TabName[]> = {
  colaborador: ['Inicio', 'Canhotos'],
  supervisor: ['Inicio', 'Canhotos', 'Gestao'],
  administracao: ['Inicio', 'Canhotos', 'Gestao'],
  admin: ['Inicio', 'Canhotos', 'Gestao'],
};

export const TAB_LABELS: Record<TabName, string> = {
  Inicio: 'Início',
  Canhotos: 'Canhotos',
  Procedimentos: 'Procedimentos',
  Gestao: 'Gestão',
  Mais: 'Mais',
};
