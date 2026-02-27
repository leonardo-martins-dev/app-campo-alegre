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
    roles: ['colaborador', 'supervisor', 'administracao', 'admin'],
    icon: 'Upload',
    color: '#0ea5e9',
  },
  {
    id: 'visualizacao-canhotos',
    label: 'Visualização de Canhotos',
    description: 'Consulte todos os canhotos lançados',
    screen: 'VisualizacaoCanhotos',
    roles: ['supervisor', 'administracao', 'admin'],
    icon: 'Eye',
    color: '#8b5cf6',
  },
  {
    id: 'conferencia',
    label: 'Conferência',
    description: 'Acompanhe envios e divergências',
    screen: 'Conferencia',
    roles: ['colaborador', 'supervisor', 'administracao', 'admin'],
    icon: 'ClipboardCheck',
    color: '#10b981',
  },
  {
    id: 'procedimentos-promotores',
    label: 'Procedimentos Promotores',
    description: 'Checklist de procedimentos e foto',
    screen: 'ProcedimentosPromotores',
    roles: ['colaborador', 'admin'],
    icon: 'CheckSquare',
    color: '#f59e0b',
  },
  {
    id: 'visualizacao-procedimentos',
    label: 'Visualização de Procedimentos',
    description: 'Procedimentos enviados pelos colaboradores',
    screen: 'VisualizacaoProcedimentos',
    roles: ['supervisor', 'admin'],
    icon: 'FileCheck',
    color: '#06b6d4',
  },
  {
    id: 'procedimento-quebra',
    label: 'Procedimento de Quebra',
    description: 'Registre quebras e notas de devolução',
    screen: 'ProcedimentoQuebra',
    roles: ['colaborador', 'admin'],
    icon: 'AlertTriangle',
    color: '#ef4444',
  },
  {
    id: 'visualizacao-quebra',
    label: 'Visualização Quebra',
    description: 'Procedimentos de quebra enviados',
    screen: 'VisualizacaoQuebra',
    roles: ['supervisor', 'admin'],
    icon: 'AlertTriangle',
    color: '#dc2626',
  },
  {
    id: 'gestao-usuarios',
    label: 'Gestão de Usuários',
    description: 'Gerencie usuários e colaboradores',
    screen: 'GestaoUsuarios',
    roles: ['supervisor', 'admin'],
    icon: 'Users',
    color: '#6366f1',
  },
  {
    id: 'gestao-lojas',
    label: 'Gestão de Lojas',
    description: 'Cadastro e configuração de lojas',
    screen: 'GestaoLojas',
    roles: ['admin'],
    icon: 'Store',
    color: '#ec4899',
  },
  {
    id: 'upload-sistema',
    label: 'Upload do Sistema',
    description: 'Importação em massa de dados',
    screen: 'UploadSistema',
    roles: ['admin'],
    icon: 'FileSpreadsheet',
    color: '#14b8a6',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Métricas e visão geral',
    screen: 'Dashboard',
    roles: ['admin'],
    icon: 'BarChart3',
    color: '#0d9488',
  },
  {
    id: 'importador-pedidos',
    label: 'Importador de Pedidos',
    description: 'Importar, vincular e exportar planilhas',
    screen: 'ImportadorPedidos',
    roles: ['supervisor', 'administracao', 'admin'],
    icon: 'FileText',
    color: '#059669',
  },
];

/**
 * Itens do menu (drawer). Filtrados por nível no componente.
 */
export const MENU_ITEMS: MenuItem[] = [
  { id: 'hub', label: 'Início', screen: 'Hub', roles: ['colaborador', 'supervisor', 'administracao', 'admin'], icon: 'Home' },
  { id: 'lancamento', label: 'Lançamento Canhoto', screen: 'LancamentoCanhoto', roles: ['colaborador', 'supervisor', 'administracao', 'admin'], icon: 'Upload' },
  { id: 'conferencia', label: 'Conferência', screen: 'Conferencia', roles: ['colaborador', 'supervisor', 'administracao', 'admin'], icon: 'ClipboardCheck' },
  { id: 'visualizacao-canhotos', label: 'Ver Canhotos', screen: 'VisualizacaoCanhotos', roles: ['supervisor', 'administracao', 'admin'], icon: 'Eye' },
  { id: 'procedimentos', label: 'Procedimentos', screen: 'ProcedimentosPromotores', roles: ['colaborador', 'admin'], icon: 'CheckSquare' },
  { id: 'quebra', label: 'Quebra', screen: 'ProcedimentoQuebra', roles: ['colaborador', 'admin'], icon: 'AlertTriangle' },
  { id: 'ver-procedimentos', label: 'Ver Procedimentos', screen: 'VisualizacaoProcedimentos', roles: ['supervisor', 'admin'], icon: 'FileCheck' },
  { id: 'gestao-usuarios', label: 'Usuários', screen: 'GestaoUsuarios', roles: ['supervisor', 'admin'], icon: 'Users' },
  { id: 'gestao-lojas', label: 'Lojas', screen: 'GestaoLojas', roles: ['admin'], icon: 'Store' },
  { id: 'upload', label: 'Upload Sistema', screen: 'UploadSistema', roles: ['admin'], icon: 'FileSpreadsheet' },
  { id: 'dashboard', label: 'Dashboard', screen: 'Dashboard', roles: ['admin'], icon: 'BarChart3' },
  { id: 'importador', label: 'Importador Pedidos', screen: 'ImportadorPedidos', roles: ['supervisor', 'administracao', 'admin'], icon: 'FileText' },
];

export function getActionsForRole(role: NivelAcesso): HubAction[] {
  return HUB_ACTIONS.filter((a) => a.roles.includes(role));
}

export function getMenuItemsForRole(role: NivelAcesso): MenuItem[] {
  return MENU_ITEMS.filter((m) => m.roles.includes(role));
}
