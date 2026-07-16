'use client';

import { Menu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  nome: string;
  nivel: string;
  onMenuClick?: () => void;
}

function initials(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const nivelLabels: Record<string, string> = {
  admin: 'Admin',
  administracao: 'Administração',
  supervisor: 'Supervisor',
  colaborador: 'Colaborador',
};

export function AppHeader({ nome, nivel, onMenuClick }: AppHeaderProps) {
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <p className="text-sm capitalize text-slate-500">{today}</p>
          <h2 className="text-lg font-semibold text-slate-900">Olá, {nome.split(' ')[0]}</h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="primary">{nivelLabels[nivel] ?? nivel}</Badge>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'
          )}
        >
          {initials(nome)}
        </div>
      </div>
    </header>
  );
}
