'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Store,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  {
    href: '/conferencia/canhotos',
    label: 'Conferência Canhotos',
    icon: ClipboardCheck,
    roles: ['admin', 'administracao'],
  },
  {
    href: '/conferencia/procedimentos',
    label: 'Conferência Procedimentos',
    icon: ClipboardCheck,
    roles: ['admin', 'administracao'],
  },
  { href: '/usuarios', label: 'Usuários', icon: Users, roles: ['admin'] },
  { href: '/lojas', label: 'Lojas', icon: Store, roles: ['admin'] },
  { href: '/upload', label: 'Upload Sistema', icon: Upload, roles: ['admin'] },
  { href: '/importador', label: 'Importador Pedidos', icon: FileSpreadsheet, roles: ['admin', 'administracao'] },
];

interface SidebarProps {
  nivel: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ nivel, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const nav = (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary">CA</span>
            </div>
            <h1 className="text-base font-bold text-slate-900">Campo Alegre</h1>
          </div>
          <p className="mt-1 pl-10 text-xs text-slate-500">Painel de gestão</p>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1">
        {links
          .filter((l) => l.roles.includes(nivel))
          .map((l) => {
            const active = pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-slate-400')} />
                {l.label}
              </Link>
            );
          })}
      </nav>
      <button
        onClick={logout}
        className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </button>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen flex-col border-r border-slate-200/80 bg-white p-5">
        {nav}
      </aside>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white p-5 shadow-xl">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
