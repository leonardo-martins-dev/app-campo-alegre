'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UploadSistemaPage() {
  const supabase = createClient();
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const processar = async (file: File) => {
    setLoading(true);
    setMsg('');
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setMsg('Arquivo vazio ou sem dados.');
      setLoading(false);
      return;
    }
    const headers = lines[0].split(/[,;]/).map((h) => h.trim().toLowerCase());
    const numeroIdx = headers.findIndex((h) => h.includes('numero') || h === 'nro');
    const lojaIdx = headers.findIndex((h) => h.includes('loja'));
    const nfeIdx = headers.findIndex((h) => h.includes('nfe'));
    const totalIdx = headers.findIndex((h) => h.includes('total'));

    const { data: lojas } = await supabase.from('lojas').select('id, nome');
    const lojaMap = new Map((lojas ?? []).map((l) => [l.nome.toLowerCase(), l.id]));

    let inseridos = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;]/);
      const numero = cols[numeroIdx >= 0 ? numeroIdx : 0]?.trim();
      const lojaNome = cols[lojaIdx >= 0 ? lojaIdx : 1]?.trim().toLowerCase();
      const loja_id = lojaMap.get(lojaNome) ?? lojas?.[0]?.id;
      if (!numero || !loja_id) continue;

      const { error } = await supabase.from('canhotos_sistema').upsert(
        {
          numero,
          data: new Date().toISOString().slice(0, 10),
          nfe: nfeIdx >= 0 ? cols[nfeIdx]?.trim() : null,
          total: totalIdx >= 0 ? parseFloat(cols[totalIdx]) || null : null,
          nome_fantasia: lojaNome,
          loja_id,
          status: 'disponivel',
        },
        { onConflict: 'numero,loja_id' }
      );
      if (!error) inseridos++;
    }
    setMsg(`${inseridos} registros importados em canhotos_sistema.`);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-bold">Upload do sistema</h2>
      <p className="text-sm text-slate-600">
        Importe CSV com colunas: numero, loja (nome), nfe (opcional), total (opcional).
        Para XLSX, exporte como CSV antes do upload.
      </p>
      <input
        type="file"
        accept=".csv,.txt"
        onChange={(e) => e.target.files?.[0] && processar(e.target.files[0])}
        disabled={loading}
        className="block w-full text-sm"
      />
      {loading && <p>Processando...</p>}
      {msg && <p className="text-sky-700">{msg}</p>}
    </div>
  );
}
