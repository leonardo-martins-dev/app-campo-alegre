/**
 * Rotas do app. Nomes devem bater com actionsConfig.screen e MenuItem.screen.
 */
export type RootStackParamList = {
  Hub: undefined;
  LancamentoCanhoto: undefined;
  VisualizacaoCanhotos: undefined;
  Conferencia: undefined;
  ConferenciaPorLoja: { lojaId: string; lojaNome: string };
  ProcedimentosPromotores: undefined;
  VisualizacaoProcedimentos: undefined;
  ProcedimentoQuebra: undefined;
  VisualizacaoQuebra: undefined;
  GestaoUsuarios: undefined;
  GestaoLojas: undefined;
  UploadSistema: undefined;
  Dashboard: undefined;
  ImportadorPedidos: undefined;
};

/** Navegador raiz: Login (não autenticado) ou Main (tabs autenticado). */
export type RootNavigatorParamList = {
  Login: undefined;
  Main: undefined;
};

/** Abas inferiores (nomes). */
export type MainTabParamList = {
  Inicio: undefined;
  Canhotos: undefined;
  Procedimentos: undefined;
  Gestao: undefined;
  Mais: undefined;
};
