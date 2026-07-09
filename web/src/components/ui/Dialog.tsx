'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'destructive';
  loading?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirmar',
  onConfirm,
  confirmVariant = 'primary',
  loading,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 pr-8">{title}</h2>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        {onConfirm && (
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
