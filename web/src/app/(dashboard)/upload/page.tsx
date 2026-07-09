'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dropzone } from '@/components/ui/Dropzone';
import { Alert } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';

export default function UploadSistemaPage() {
  const supabase = createClient();
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processar = async (file: File) => {
    setLoading(true);
    setMsg('');
    setProgress(10);
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      toast.error('Arquivo vazio ou sem dados.');
      setLoading(false);
      setProgress(0);
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
    const total = lines.length - 1;
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
      setProgress(10 + Math.round((i / total) * 90));
    }
    const result = `${inseridos} registros importados em canhotos_sistema.`;
    setMsg(result);
    toast.success(result);
    setLoading(false);
    setTimeout(() => setProgress(0), 1000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Upload do sistema"
        description="Importe canhotos do sistema via CSV"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-primary" />
            Importar arquivo
          </CardTitle>
          <CardDescription>
            CSV com colunas: numero, loja (nome), nfe (opcional), total (opcional).
            Para XLSX, exporte como CSV antes do upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dropzone
            accept=".csv,.txt"
            disabled={loading}
            onFile={processar}
            hint="Formatos aceitos: .csv, .txt"
          />
          {loading && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Processando...</p>
              <Progress value={progress} />
            </div>
          )}
          {msg && !loading && <Alert variant="success">{msg}</Alert>}
        </CardContent>
      </Card>
    </div>
  );
}
