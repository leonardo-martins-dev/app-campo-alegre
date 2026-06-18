import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campo Alegre — Painel',
  description: 'Gestão e conferência Campo Alegre',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
