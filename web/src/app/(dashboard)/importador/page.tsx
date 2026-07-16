'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Download, FileSpreadsheet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn } from '@/lib/utils';

interface Linha {
  seq_produto: string;
  desc: string;
  qtd: string;
  cod_produto: string;
  cod_super: string;
}

const STEPS = ['Importar CSV', 'Vincular códigos', 'Concluído'];

export default function ImportadorPage() {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

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
    toast.success(`${parsed.length} linhas importadas`);
  };

  const salvar = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

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
      toast.error('Execute optional/011_importador_linker.sql no Supabase para habilitar o importador.');
      setMsg('Execute optional/011_importador_linker.sql no Supabase para habilitar o importador.');
      setSaving(false);
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
    setMsg('Importação salva com sucesso.');
    toast.success('Importação salva');
    setStep(3);
    setSaving(false);
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
    toast.success('CSV exportado');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Importador de pedidos"
        description="Linker — importe e vincule códigos de produtos"
      />

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const active = step === num;
          const done = step > num;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <div className={cn('h-px w-8', done ? 'bg-primary' : 'bg-slate-200')} />}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                    active && 'bg-primary text-white',
                    done && 'bg-primary/10 text-primary',
                    !active && !done && 'bg-slate-100 text-slate-400'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : num}
                </div>
                <span className={cn('text-sm hidden sm:inline', active ? 'font-medium text-slate-900' : 'text-slate-500')}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Passo 1 — Importar CSV
            </CardTitle>
            <CardDescription>
              Colunas esperadas: NRO_EMPRESA, SEQPRODUTO, DESCCOMPLETA, QTD_SOLICITADA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone
              accept=".csv"
              onFile={importar}
              hint="Arraste o arquivo CSV do pedido"
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Passo 2 — Vincular códigos</CardTitle>
              <CardDescription>{linhas.length} itens para vincular</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SEQ</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>COD_PRODUTO</TableHead>
                      <TableHead>COD_SUPER</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linhas.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{l.seq_produto}</TableCell>
                        <TableCell className="max-w-xs truncate">{l.desc}</TableCell>
                        <TableCell>
                          <Input
                            className="h-8 w-28"
                            value={l.cod_produto}
                            onChange={(e) => {
                              const next = [...linhas];
                              next[i].cod_produto = e.target.value;
                              setLinhas(next);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8 w-28"
                            value={l.cod_super}
                            onChange={(e) => {
                              const next = [...linhas];
                              next[i].cod_super = e.target.value;
                              setLinhas(next);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Button onClick={salvar} loading={saving}>
            Salvar e continuar
          </Button>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Alert variant="success">{msg}</Alert>
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportarCsv}>
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="secondary" onClick={() => { setStep(1); setLinhas([]); setMsg(''); }}>
                Nova importação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
