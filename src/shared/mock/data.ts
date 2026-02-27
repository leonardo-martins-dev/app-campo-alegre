/**
 * Dados mockados para todas as telas do app.
 * Sem nível "operador" (apenas colaborador, supervisor, administração, admin).
 */

export interface Canhoto {
  id: string;
  numero: string;
  loja: string;
  data: string;
  status: 'enviado' | 'pendente' | 'divergente';
  enviadoEm?: string;
}

export interface ConferenciaItem {
  id: string;
  loja: string;
  canhotosEnviados: number;
  canhotosPendentes: number;
  divergencias: number;
  ultimaAtualizacao: string;
}

export interface Procedimento {
  id: string;
  colaborador: string;
  loja: string;
  data: string;
  tipo: 'promotor' | 'quebra';
  itensOk: number;
  itensTotal: number;
  status: 'completo' | 'pendente';
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  nivel: string;
  loja?: string;
  ativo: boolean;
}

export interface Loja {
  id: string;
  nome: string;
  codigo: string;
  regiao: string;
  ativa: boolean;
}

export const MOCK_CANHOTOS: Canhoto[] = [
  { id: '1', numero: '1001', loja: 'Loja Centro', data: '2025-02-24', status: 'enviado', enviadoEm: '24/02 08:32' },
  { id: '2', numero: '1002', loja: 'Loja Centro', data: '2025-02-24', status: 'pendente' },
  { id: '3', numero: '1003', loja: 'Loja Sul', data: '2025-02-23', status: 'enviado', enviadoEm: '23/02 09:15' },
  { id: '4', numero: '1004', loja: 'Loja Norte', data: '2025-02-23', status: 'divergente', enviadoEm: '23/02 14:00' },
  { id: '5', numero: '1005', loja: 'Loja Centro', data: '2025-02-22', status: 'enviado', enviadoEm: '22/02 08:45' },
];

/** Números de canhoto disponíveis para seleção no lançamento (mock). */
export const MOCK_NUMEROS_CANHOTO: string[] = Array.from({ length: 50 }, (_, i) => String(1001 + i));

export const MOCK_CONFERENCIA: ConferenciaItem[] = [
  { id: '1', loja: 'Loja Centro', canhotosEnviados: 12, canhotosPendentes: 2, divergencias: 0, ultimaAtualizacao: '24/02 09:00' },
  { id: '2', loja: 'Loja Sul', canhotosEnviados: 8, canhotosPendentes: 1, divergencias: 1, ultimaAtualizacao: '24/02 08:45' },
  { id: '3', loja: 'Loja Norte', canhotosEnviados: 10, canhotosPendentes: 0, divergencias: 0, ultimaAtualizacao: '23/02 18:30' },
];

export const MOCK_PROCEDIMENTOS_PROMOTORES: Procedimento[] = [
  { id: '1', colaborador: 'Maria Silva', loja: 'Loja Centro', data: '24/02/2025', tipo: 'promotor', itensOk: 12, itensTotal: 12, status: 'completo' },
  { id: '2', colaborador: 'João Santos', loja: 'Loja Sul', data: '24/02/2025', tipo: 'promotor', itensOk: 10, itensTotal: 12, status: 'pendente' },
  { id: '3', colaborador: 'Ana Costa', loja: 'Loja Norte', data: '23/02/2025', tipo: 'promotor', itensOk: 12, itensTotal: 12, status: 'completo' },
];

export const MOCK_PROCEDIMENTOS_QUEBRA: Procedimento[] = [
  { id: '1', colaborador: 'Maria Silva', loja: 'Loja Centro', data: '24/02/2025', tipo: 'quebra', itensOk: 5, itensTotal: 5, status: 'completo' },
  { id: '2', colaborador: 'Pedro Lima', loja: 'Loja Sul', data: '24/02/2025', tipo: 'quebra', itensOk: 3, itensTotal: 5, status: 'pendente' },
];

export const MOCK_USUARIOS: Usuario[] = [
  { id: '1', nome: 'Admin Sistema', email: 'admin@campoalegre.com', nivel: 'Admin', ativo: true },
  { id: '2', nome: 'João Supervisor', email: 'supervisor@campoalegre.com', nivel: 'Supervisor', loja: 'Loja Centro', ativo: true },
  { id: '3', nome: 'Maria Silva', email: 'maria@campoalegre.com', nivel: 'Colaborador', loja: 'Loja Centro', ativo: true },
  { id: '4', nome: 'Ana Costa', email: 'ana@campoalegre.com', nivel: 'Colaborador', loja: 'Loja Norte', ativo: true },
  { id: '5', nome: 'Pedro Lima', email: 'pedro@campoalegre.com', nivel: 'Colaborador', loja: 'Loja Sul', ativo: false },
];

export const MOCK_LOJAS: Loja[] = [
  { id: '1', nome: 'Loja Centro', codigo: 'LC-01', regiao: 'Centro', ativa: true },
  { id: '2', nome: 'Loja Sul', codigo: 'LS-02', regiao: 'Sul', ativa: true },
  { id: '3', nome: 'Loja Norte', codigo: 'LN-03', regiao: 'Norte', ativa: true },
  { id: '4', nome: 'Loja Leste', codigo: 'LL-04', regiao: 'Leste', ativa: false },
];

export const MOCK_DASHBOARD = {
  canhotosHoje: 15,
  canhotosPendentes: 3,
  procedimentosHoje: 8,
  divergenciasPendentes: 1,
  usuariosAtivos: 12,
};

export const MOCK_CHECKLIST_PROMOTOR = [
  { id: '1', label: 'Organização do ponto', concluido: true },
  { id: '2', label: 'Preço e etiquetagem', concluido: true },
  { id: '3', label: 'Limpeza e validade', concluido: true },
  { id: '4', label: 'Fotos do ponto', concluido: false },
];

/** Checklist procedimento promotor: 11 itens; requiresPhoto = exige pelo menos uma foto (galeria ou câmera). */
export interface ChecklistPromotorItem {
  id: string;
  label: string;
  requiresPhoto: boolean;
}

export const CHECKLIST_PROMOTOR_11: ChecklistPromotorItem[] = [
  { id: 'higienizacao', label: 'Tirar produtos sobrados para reforma e fazer a higienização do ponto de venda, sendo que ao menos uma vez por semana lava-se o ponto para uma limpeza mais ampla', requiresPhoto: false },
  { id: 'abertura', label: 'Abertura com produtos frescos do dia (molhar produto na área de venda e tirar foto)', requiresPhoto: true },
  { id: 'precificacao', label: 'Precificação: logo em seguida é organizado e atualizado os preços dos produtos', requiresPhoto: false },
  { id: 'camara', label: 'Guardar produtos do dia na câmara fria', requiresPhoto: false },
  { id: 'reforma', label: 'Fazer reforma e abastece-las em seguida', requiresPhoto: false },
  { id: 'pedido', label: '(Pedido): Fazer pedido sugestão juntamente com o encarregado e enviar para responsável pelos pedidos da Empresa C.A.', requiresPhoto: false },
  { id: 'almoco', label: 'Almoço', requiresPhoto: false },
  { id: 'reabertura', label: '(Reabertura): Logo após o almoço inicia-se o processo de reabertura aonde são retiradas as folhas não apropriadas para consumo, os talos são cortados e os produtos molhados se necessário, "Segunda reforma"', requiresPhoto: true },
  { id: 'manter', label: 'Manter o ponto de venda abastecido e molhado ao menos a cada hora e antes de ir embora apresentar ao responsável pelo setor do mercado.', requiresPhoto: true },
  { id: 'quebras', label: 'Fazer quebras diariamente logo após a reforma junto com responsável da prevenção da loja, lançar e tirar copia do lançamento com assinatura do promotor juntamente com o responsável de prevenção da loja', requiresPhoto: false },
  { id: 'nota', label: 'Nota de devolução: São lavradas toda quarta-feira e Sexta feira (Conferir com relatório de quebras assinado por ambos se batem), ou sempre que necessário no caso de falta do produto ou qualidade impropria para venda.', requiresPhoto: false },
];

export const MOCK_CHECKLIST_QUEBRA = [
  { id: '1', label: 'Registro de quebras', concluido: true },
  { id: '2', label: 'Nota de devolução', concluido: true },
  { id: '3', label: 'Fotos obrigatórias', concluido: false },
];
