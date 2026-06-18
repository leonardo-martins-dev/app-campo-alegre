'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CanhotoRow {
  id: string;
  numero: string;
  status: string;
  foto_path: string | null;
  observacoes: string | null;
  lojas: { nome: string } | null;
  profiles: { nome: string } | null;
}

export default function ConferenciaCanhotosPage() {
  const supabase = createClient();
  const [lista, setLista] = useState<CanhotoRow[]>([]);
  const [filtro, setFiltro] = useState('enviado');

  const load = useCallback(async () => {
    let q = supabase
      .from('canhotos')
      .select('id, numero, status, foto_path, observacoes, lojas(nome), profiles(nome)')
      .order('created_at', { ascending: false });
    if (filtro) q = q.eq('status', filtro);
    const { data } = await q;
    setLista((data as unknown as CanhotoRow[]) ?? []);
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
    load();
  };

  const fotoUrl = async (path: string) => {
    const { data } = await supabase.storage.from('canhotos-fotos').createSignedUrl(path, 3600);
    return data?.signedUrl;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Conferência de canhotos</h2>
      <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="border rounded px-3 py-2">
        <option value="enviado">Enviados</option>
        <option value="divergente">Divergentes</option>
        <option value="pendente">Pendentes</option>
        <option value="aprovado">Aprovados</option>
      </select>
      <div className="space-y-4">
        {lista.map((c) => (
          <CanhotoCard key={c.id} item={c} onConferir={conferir} getFoto={fotoUrl} />
        ))}
        {lista.length === 0 && <p className="text-slate-500">Nenhum canhoto neste filtro.</p>}
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
  useEffect(() => {
    if (item.foto_path) getFoto(item.foto_path).then((u) => setUrl(u ?? null));
  }, [item.foto_path, getFoto]);

  return (
    <div className="bg-white border rounded-lg p-4 flex gap-4">
      {url && <img src={url} alt="Canhoto" className="w-32 h-32 object-cover rounded" />}
      <div className="flex-1">
        <p className="font-semibold">#{item.numero}</p>
        <p className="text-sm text-slate-600">{item.lojas?.nome} · {item.profiles?.nome}</p>
        <p className="text-sm">Status: {item.status}</p>
        {item.status === 'enviado' || item.status === 'divergente' ? (
          <div className="flex gap-2 mt-3">
            <button onClick={() => onConferir(item.id, 'aprovado')} className="bg-emerald-600 text-white text-sm px-3 py-1 rounded">Aprovar</button>
            <button onClick={() => onConferir(item.id, 'divergente')} className="bg-amber-500 text-white text-sm px-3 py-1 rounded">Divergência</button>
            <button onClick={() => onConferir(item.id, 'rejeitado')} className="bg-red-600 text-white text-sm px-3 py-1 rounded">Rejeitar</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
