'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

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

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('procedimentos')
      .select('id, tipo, status, enviado_em, lojas(nome), profiles(nome), procedimento_itens(item_id, label, concluido)')
      .eq('status', 'enviado')
      .order('enviado_em', { ascending: false });
    setLista((data as unknown as ProcedimentoRow[]) ?? []);
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
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Conferência de procedimentos</h2>
      {lista.map((p) => (
        <div key={p.id} className="bg-white border rounded-lg p-4">
          <p className="font-semibold capitalize">{p.tipo}</p>
          <p className="text-sm text-slate-600">{p.lojas?.nome} · {p.profiles?.nome}</p>
          <ul className="mt-3 text-sm space-y-1">
            {p.procedimento_itens?.map((i) => (
              <li key={i.item_id} className={i.concluido ? 'text-emerald-700' : 'text-slate-500'}>
                {i.concluido ? '✓' : '○'} {i.label}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-4">
            <button onClick={() => conferir(p.id, 'conferido')} className="bg-emerald-600 text-white text-sm px-3 py-1 rounded">Aprovar</button>
            <button onClick={() => conferir(p.id, 'divergente')} className="bg-amber-500 text-white text-sm px-3 py-1 rounded">Divergência</button>
          </div>
        </div>
      ))}
      {lista.length === 0 && <p className="text-slate-500">Nenhum procedimento pendente de conferência.</p>}
    </div>
  );
}
