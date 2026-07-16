'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ClipboardCheck, ZoomIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Lightbox } from '@/components/ui/Lightbox';

interface CanhotoRow {
  id: string;
  numero: string;
  status: string;
  foto_path: string | null;
  observacoes: string | null;
  lojas: { nome: string } | null;
  profiles: { nome: string } | null;
}

const FILTROS = [
  { value: 'enviado', label: 'Enviados' },
  { value: 'divergente', label: 'Divergentes' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovado', label: 'Aprovados' },
];

export default function ConferenciaCanhotosPage() {
  const supabase = createClient();
  const [lista, setLista] = useState<CanhotoRow[]>([]);
  const [filtro, setFiltro] = useState('enviado');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('canhotos')
      .select('id, numero, status, foto_path, observacoes, lojas(nome), profiles(nome)')
      .order('created_at', { ascending: false });
    if (filtro) q = q.eq('status', filtro);
    const { data } = await q;
    setLista((data as unknown as CanhotoRow[]) ?? []);
    setLoading(false);
  }, [supabase, filtro]);

  useEffect(() => {
    load();
  }, [load]);

  const conferir = async (id: string, status: 'aprovado' | 'rejeitado' | 'divergente') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('canhotos').update({ status }).eq('id', id);
    await supabase.from('conferencias').insert({
      entidade_tipo: 'canhoto',
      entidade_id: id,
      conferido_por: user.id,
      status,
    });
    if (status === 'divergente') {
      const { data: conf } = await supabase
        .from('conferencias')
        .select('id')
        .eq('entidade_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (conf) {
        await supabase.from('divergencias').insert({
          conferencia_id: conf.id,
          motivo: 'Divergência identificada na administração',
        });
      }
    }
    toast.success(
      status === 'aprovado' ? 'Canhoto aprovado' : status === 'divergente' ? 'Divergência registrada' : 'Canhoto rejeitado'
    );
    load();
  };

  const fotoUrl = async (path: string) => {
    const { data } = await supabase.storage.from('canhotos-fotos').createSignedUrl(path, 3600);
    return data?.signedUrl;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conferência de canhotos"
        description="Revise e aprove canhotos enviados pelo app"
      />

      <SegmentedControl options={FILTROS} value={filtro} onChange={setFiltro} />

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 flex gap-4">
                <Skeleton className="h-40 w-40 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-64" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : lista.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Nenhum canhoto neste filtro"
            description="Altere o filtro acima para ver outros registros."
          />
        ) : (
          lista.map((c) => (
            <CanhotoCard key={c.id} item={c} onConferir={conferir} getFoto={fotoUrl} />
          ))
        )}
      </div>
    </div>
  );
}

function CanhotoCard({
  item,
  onConferir,
  getFoto,
}: {
  item: CanhotoRow;
  onConferir: (id: string, s: 'aprovado' | 'rejeitado' | 'divergente') => void;
  getFoto: (p: string) => Promise<string | undefined>;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loadingFoto, setLoadingFoto] = useState(!!item.foto_path);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!item.foto_path) return;
    setLoadingFoto(true);
    getFoto(item.foto_path).then((u) => {
      setUrl(u ?? null);
      setLoadingFoto(false);
    });
  }, [item.foto_path, getFoto]);

  const canConferir = item.status === 'enviado' || item.status === 'divergente';

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative shrink-0">
              {loadingFoto ? (
                <Skeleton className="h-40 w-full sm:w-48 rounded-xl" />
              ) : url ? (
                <button
                  onClick={() => setLightbox(true)}
                  className="group relative block overflow-hidden rounded-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Canhoto ${item.numero}`} className="h-40 w-full sm:w-48 object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-all group-hover:bg-slate-900/30">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ) : (
                <div className="flex h-40 w-full sm:w-48 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
                  Sem foto
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-slate-900">#{item.numero}</p>
                  <p className="text-sm text-slate-500">
                    {item.lojas?.nome} · {item.profiles?.nome}
                  </p>
                </div>
                <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
              </div>
              {item.observacoes && (
                <p className="mt-2 text-sm text-slate-600">{item.observacoes}</p>
              )}
              {canConferir && (
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button size="sm" variant="success" onClick={() => onConferir(item.id, 'aprovado')}>
                    Aprovar
                  </Button>
                  <Button size="sm" variant="warning" onClick={() => onConferir(item.id, 'divergente')}>
                    Divergência
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onConferir(item.id, 'rejeitado')}>
                    Rejeitar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {lightbox && url && (
        <Lightbox src={url} alt={`Canhoto ${item.numero}`} onClose={() => setLightbox(false)} />
      )}
    </>
  );
}
