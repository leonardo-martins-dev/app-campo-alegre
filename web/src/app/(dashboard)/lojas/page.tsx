'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Loja {
  id: string;
  nome: string;
  codigo: string;
  regiao: string;
  ativa: boolean;
}

export default function LojasPage() {
  const supabase = createClient();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [regiao, setRegiao] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('lojas').select('*').order('nome');
    setLojas(data ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('lojas').insert({ nome, codigo, regiao, ativa: true });
    setNome('');
    setCodigo('');
    setRegiao('');
    load();
  };

  const toggleAtiva = async (id: string, ativa: boolean) => {
    await supabase.from('lojas').update({ ativa: !ativa }).eq('id', id);
    load();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Gestão de lojas</h2>

      <form onSubmit={criar} className="bg-white border rounded-lg p-6 space-y-3 max-w-md">
        <h3 className="font-semibold">Nova loja</h3>
        <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border rounded px-3 py-2" required />
        <input placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-full border rounded px-3 py-2" required />
        <input placeholder="Região" value={regiao} onChange={(e) => setRegiao(e.target.value)} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-lg">Cadastrar</button>
      </form>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Região</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {lojas.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.nome}</td>
                <td className="p-3">{l.codigo}</td>
                <td className="p-3">{l.regiao}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleAtiva(l.id, l.ativa)}
                    className={`text-xs px-2 py-1 rounded ${l.ativa ? 'bg-emerald-100' : 'bg-slate-100'}`}
                  >
                    {l.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
