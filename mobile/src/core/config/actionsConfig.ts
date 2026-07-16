import { NivelAcesso } from '../auth/types';

export interface HubAction {
  id: string;
  label: string;
  description: string;
  screen: string;
  roles: NivelAcesso[];
  icon: string; // nome do ícone Lucide/compat
  color: string;
}

export interface MenuItem {
  id: string;
  label: string;
  screen: string;
  roles: NivelAcesso[];
  icon: string;
}

/**
 * Configuração de ações do Central Hub.
 * Futuro: pode vir da API (painel web).
 */
export const HUB_ACTIONS: HubAction[] = [
  {
    id: 'lancamento-canhotos',
    label: 'Lançamento de Canhoto',
    description: 'Registre canhotos com fotos e números',
    screen: 'LancamentoCanhoto',
    roles: ['colaborador', 'supervisor', 'admin'],
    icon: 'Upload',
    color: '#00AEEF',
  },
  {
    id: 'visualizacao-canhotos',
    label: 'Visualização de Canhotos',
    description: 'Visão unificada de canhotos (sistema e lançados)',
    screen: 'VisualizacaoCanhotos',
    roles: ['admin'],
    icon: 'Eye',
    color: '#0B4467',
  },
  {
    id: 'conferencia',
    label: 'Conferência',
    description: 'Acompanhe envios e divergências',
    screen: 'Conferencia',
    roles: ['colaborador', 'supervisor', 'administracao', 'admin'],
    icon: 'ClipboardCheck',
    color: '#059669',
  },
  {
    id: 'gestao-usuarios',
    label: 'Usuários (consulta)',
    description: 'Lista sincronizada do painel jotter (somente leitura)',
    screen: 'GestaoUsuarios',
    roles: ['administracao', 'admin'],
    icon: 'Users',
    color: '#0B4467',
  },
  {
    id: 'gestao-lojas',
    label: 'Lojas (consulta)',
    description: 'Lista sincronizada do painel jotter (somente leitura)',
    screen: 'GestaoLojas',
    roles: ['administracao', 'admin'],
    icon: 'Store',
    color: '#0090C5',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Métricas e visão geral',
    screen: 'Dashboard',
    roles: ['admin'],
    icon: 'BarChart3',
    color: '#00AEEF',
  },
];

/**
 * Itens do menu (drawer). Filtrados por nível no componente.
 */
export const MENU_ITEMS: MenuItem[] = [
  { id: 'hub', label: 'Início', screen: 'Hub', roles: ['colaborador', 'supervisor', 'administracao', 'admin'], icon: 'Home' },
  { id: 'lancamento', label: 'Lançamento Canhoto', screen: 'LancamentoCanhoto', roles: ['colaborador', 'supervisor', 'admin'], icon: 'Upload' },
  { id: 'conferencia', label: 'Conferência', screen: 'Conferencia', roles: ['colaborador', 'supervisor', 'administracao', 'admin'], icon: 'ClipboardCheck' },
  { id: 'visualizacao-canhotos', label: 'Ver Canhotos', screen: 'VisualizacaoCanhotos', roles: ['admin'], icon: 'Eye' },
  { id: 'gestao-usuarios', label: 'Usuários', screen: 'GestaoUsuarios', roles: ['administracao', 'admin'], icon: 'Users' },
  { id: 'gestao-lojas', label: 'Lojas', screen: 'GestaoLojas', roles: ['administracao', 'admin'], icon: 'Store' },
  { id: 'dashboard', label: 'Dashboard', screen: 'Dashboard', roles: ['admin'], icon: 'BarChart3' },
];

export function getActionsForRole(role: NivelAcesso): HubAction[] {
  return HUB_ACTIONS.filter((a) => a.roles.includes(role));
}

export function getMenuItemsForRole(role: NivelAcesso): MenuItem[] {
  return MENU_ITEMS.filter((m) => m.roles.includes(role));
}
