import type { TabName } from './tabsConfig';

/** Para navegar do Hub (tab Inicio) para uma tela em outra aba */
export const SCREEN_TO_TAB: Record<string, { tab: TabName; screen: string }> = {
  Conferencia: { tab: 'Canhotos', screen: 'Conferencia' },
  LancamentoCanhoto: { tab: 'Canhotos', screen: 'LancamentoCanhoto' },
  VisualizacaoCanhotos: { tab: 'Canhotos', screen: 'VisualizacaoCanhotos' },
  ProcedimentosPromotores: { tab: 'Procedimentos', screen: 'ProcedimentosPromotores' },
  ProcedimentoQuebra: { tab: 'Procedimentos', screen: 'ProcedimentoQuebra' },
  VisualizacaoProcedimentos: { tab: 'Procedimentos', screen: 'VisualizacaoProcedimentos' },
  VisualizacaoQuebra: { tab: 'Procedimentos', screen: 'VisualizacaoQuebra' },
  GestaoUsuarios: { tab: 'Gestao', screen: 'GestaoUsuarios' },
  GestaoLojas: { tab: 'Gestao', screen: 'GestaoLojas' },
  UploadSistema: { tab: 'Gestao', screen: 'UploadSistema' },
  Dashboard: { tab: 'Gestao', screen: 'Dashboard' },
  ImportadorPedidos: { tab: 'Mais', screen: 'ImportadorPedidos' },
};
