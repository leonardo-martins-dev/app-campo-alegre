'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin'] },
  { href: '/conferencia/canhotos', label: 'Conferência Canhotos', roles: ['admin', 'administracao'] },
  { href: '/conferencia/procedimentos', label: 'Conferência Procedimentos', roles: ['admin', 'administracao'] },
  { href: '/usuarios', label: 'Usuários', roles: ['admin'] },
  { href: '/lojas', label: 'Lojas', roles: ['admin'] },
  { href: '/upload', label: 'Upload Sistema', roles: ['admin'] },
  { href: '/importador', label: 'Importador Pedidos', roles: ['admin', 'administracao'] },
];

export default function Sidebar({ nivel }: { nivel: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold">Campo Alegre</h1>
        <p className="text-xs text-slate-400">Painel de gestão</p>
      </div>
      <nav className="flex-1 space-y-1">
        {links
          .filter((l) => l.roles.includes(nivel))
          .map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2 rounded-md text-sm ${
                pathname.startsWith(l.href)
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {l.label}
            </Link>
          ))}
      </nav>
      <button
        onClick={logout}
        className="mt-4 text-sm text-slate-400 hover:text-white text-left px-3 py-2"
      >
        Sair
      </button>
    </aside>
  );
}
