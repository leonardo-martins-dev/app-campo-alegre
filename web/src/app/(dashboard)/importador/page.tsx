'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Linha {
  seq_produto: string;
  desc: string;
  qtd: string;
  cod_produto: string;
  cod_super: string;
}

export default function ImportadorPage() {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [msg, setMsg] = useState('');

  const importar = async (file: File) => {
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean).slice(1);
    const parsed = rows.map((r) => {
      const c = r.split(/[,;]/);
      return {
        seq_produto: c[1]?.trim() ?? '',
        desc: c[2]?.trim() ?? '',
        qtd: c[3]?.trim() ?? '',
        cod_produto: '',
        cod_super: '',
      };
    });
    setLinhas(parsed);
    setStep(2);
  };

  const salvar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: imp, error } = await supabase
      .from('importacoes_pedidos')
      .insert({
        nome_arquivo: 'importacao.csv',
        usuario_id: user.id,
        status: 'concluido',
        total_itens: linhas.length,
      })
      .select('id')
      .single();

    if (error) {
      setMsg('Execute optional/011_importador_linker.sql no Supabase para habilitar o importador.');
      return;
    }

    await supabase.from('vinculos_produtos').insert(
      linhas.map((l) => ({
        importacao_id: imp.id,
        seq_produto: l.seq_produto,
        desc_completa: l.desc,
        qtd_solicitada: parseFloat(l.qtd) || 0,
        cod_produto: l.cod_produto || null,
        cod_super: l.cod_super || null,
      }))
    );
    setMsg('Importação salva. Exporte os dados pela API ou adicione export CSV em versão futura.');
    setStep(3);
  };

  const exportarCsv = () => {
    const header = 'SEQPRODUTO,DESCCOMPLETA,QTD_SOLICITADA,COD_PRODUTO,COD_SUPER';
    const body = linhas
      .map((l) => `${l.seq_produto},${l.desc},${l.qtd},${l.cod_produto},${l.cod_super}`)
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pedidos_vinculados.csv';
    a.click();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Importador de pedidos (Linker)</h2>
      {step === 1 && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <p className="text-sm text-slate-600">Passo 1: importar CSV (NRO_EMPRESA, SEQPRODUTO, DESCCOMPLETA, QTD_SOLICITADA)</p>
          <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <p className="font-medium">Passo 2: vincular códigos</p>
          <div className="bg-white border rounded-lg overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="p-2 text-left">SEQ</th>
                  <th className="p-2 text-left">Descrição</th>
                  <th className="p-2 text-left">COD_PRODUTO</th>
                  <th className="p-2 text-left">COD_SUPER</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{l.seq_produto}</td>
                    <td className="p-2">{l.desc}</td>
                    <td className="p-2">
                      <input
                        className="border rounded px-1 w-24"
                        value={l.cod_produto}
                        onChange={(e) => {
                          const next = [...linhas];
                          next[i].cod_produto = e.target.value;
                          setLinhas(next);
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="border rounded px-1 w-24"
                        value={l.cod_super}
                        onChange={(e) => {
                          const next = [...linhas];
                          next[i].cod_super = e.target.value;
                          setLinhas(next);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={salvar} className="bg-sky-600 text-white px-4 py-2 rounded-lg">Salvar e continuar</button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-emerald-700">{msg}</p>
          <button onClick={exportarCsv} className="bg-sky-600 text-white px-4 py-2 rounded-lg">Exportar CSV</button>
          <button onClick={() => setStep(1)} className="text-sky-600 text-sm block">Nova importação</button>
        </div>
      )}
    </div>
  );
}
