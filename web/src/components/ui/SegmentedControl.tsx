'use client';

import { cn } from '@/lib/utils';

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-slate-200/80 bg-slate-100/80 p-1',
        className
      )}
      role="tablist"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
            value === opt.value
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
