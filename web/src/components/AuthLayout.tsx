import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export function AuthLayout({
  children,
  title = 'Campo Alegre',
  subtitle = 'Painel de administração',
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-xl',
          'animate-in fade-in slide-in-from-bottom-4 duration-500'
        )}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-xl font-bold text-primary">CA</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
        {footer && (
          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function AuthFooter() {
  return (
    <p>
      Ao continuar, você concorda com a{' '}
      <Link href="/privacidade" className="text-primary hover:underline">
        Política de Privacidade
      </Link>
      .
    </p>
  );
}
