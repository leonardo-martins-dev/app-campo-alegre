'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropzoneProps {
  accept?: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function Dropzone({
  accept,
  disabled,
  onFile,
  label = 'Arraste um arquivo ou clique para selecionar',
  hint,
  className,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [disabled, onFile]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-200',
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-primary/5',
        disabled && 'pointer-events-none opacity-60',
        className
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <Upload className="h-5 w-5 text-primary" />
      </div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  );
}
