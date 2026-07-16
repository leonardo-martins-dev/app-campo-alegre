import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-primary/5 text-primary border-primary/20',
};

export function Alert({ variant = 'info', children, className }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-sm',
        variants[variant],
        className
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
