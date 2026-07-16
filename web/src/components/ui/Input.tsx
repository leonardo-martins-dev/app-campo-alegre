import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-900',
        'placeholder:text-slate-400 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
