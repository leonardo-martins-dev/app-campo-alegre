import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  muted: 'bg-slate-50 text-slate-500',
};

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'aprovado':
    case 'conferido':
    case 'ativo':
    case 'ativa':
      return 'success';
    case 'pendente':
    case 'enviado':
      return 'warning';
    case 'divergente':
    case 'rejeitado':
      return 'danger';
    default:
      return 'muted';
  }
}
