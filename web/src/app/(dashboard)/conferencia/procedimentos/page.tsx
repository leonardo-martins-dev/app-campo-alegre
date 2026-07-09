'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface ProcedimentoRow {
  id: string;
  tipo: string;
  status: string;
  enviado_em: string | null;
  lojas: { nome: string } | null;
  profiles: { nome: string } | null;
  procedimento_itens: { item_id: string; label: string; concluido: boolean }[];
}

export default function ConferenciaProcedimentosPage() {
  const supabase = createClient();
  const [lista, setLista] = useState<ProcedimentoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('procedimentos')
      .select('id, tipo, status, enviado_em, lojas(nome), profiles(nome), procedimento_itens(item_id, label, concluido)')
      .eq('status', 'enviado')
      .order('enviado_em', { ascending: false });
    setLista((data as unknown as ProcedimentoRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const conferir = async (id: string, status: 'conferido' | 'divergente') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('procedimentos').update({ status }).eq('id', id);
    await supabase.from('conferencias').insert({
      entidade_tipo: 'procedimento',
      entidade_id: id,
      conferido_por: user.id,
      status: status === 'conferido' ? 'aprovado' : 'divergente',
    });
    toast.success(status === 'conferido' ? 'Procedimento aprovado' : 'Divergência registrada');
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conferência de procedimentos"
        description="Revise checklists enviados pelas lojas"
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lista.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum procedimento pendente"
          description="Todos os procedimentos enviados já foram conferidos."
        />
      ) : (
        <div className="space-y-4">
          {lista.map((p) => {
            const total = p.procedimento_itens?.length ?? 0;
            const done = p.procedimento_itens?.filter((i) => i.concluido).length ?? 0;
            return (
              <Card key={p.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold capitalize text-slate-900">{p.tipo}</p>
                      <p className="text-sm text-slate-500">
                        {p.lojas?.nome} · {p.profiles?.nome}
                      </p>
                    </div>
                    <Badge variant="warning">{done}/{total} itens</Badge>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {p.procedimento_itens?.map((i) => (
                      <li
                        key={i.item_id}
                        className={cn(
                          'flex items-center gap-2 text-sm',
                          i.concluido ? 'text-emerald-700' : 'text-slate-400'
                        )}
                      >
                        <CheckCircle2
                          className={cn('h-4 w-4 shrink-0', i.concluido ? 'text-emerald-500' : 'text-slate-300')}
                        />
                        {i.label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="success" onClick={() => conferir(p.id, 'conferido')}>
                      Aprovar
                    </Button>
                    <Button size="sm" variant="warning" onClick={() => conferir(p.id, 'divergente')}>
                      Divergência
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
