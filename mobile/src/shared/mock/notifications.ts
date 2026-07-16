/**
 * Notificações mockadas para o ícone do header.
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Canhoto enviado',
    message: 'O canhoto #1001 foi registrado com sucesso.',
    time: 'Há 10 min',
    read: false,
  },
  {
    id: '2',
    title: 'Conferência pendente',
    message: 'Há 2 canhotos pendentes de conferência na Loja Centro.',
    time: 'Há 1 h',
    read: false,
  },
  {
    id: '3',
    title: 'Procedimento aprovado',
    message: 'Seu procedimento de hoje foi registrado.',
    time: 'Ontem',
    read: true,
  },
];
