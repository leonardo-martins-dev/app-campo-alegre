'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { AppHeader } from '@/components/AppHeader';

interface DashboardShellProps {
  nivel: string;
  nome: string;
  children: React.ReactNode;
}

export function DashboardShell({ nivel, nome, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/80">
      <Sidebar
        nivel={nivel}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <AppHeader
            nome={nome}
            nivel={nivel}
            onMenuClick={() => setMobileOpen(true)}
          />
          {children}
        </div>
      </main>
    </div>
  );
}
