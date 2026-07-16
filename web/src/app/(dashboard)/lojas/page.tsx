'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Store } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

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
  const [confirmLoja, setConfirmLoja] = useState<Loja | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('lojas').select('*').order('nome');
    setLojas(data ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('lojas').insert({ nome, codigo, regiao, ativa: true });
    if (error) {
      toast.error('Erro ao cadastrar loja.');
      return;
    }
    toast.success('Loja cadastrada com sucesso');
    setNome('');
    setCodigo('');
    setRegiao('');
    load();
  };

  const toggleAtiva = async () => {
    if (!confirmLoja) return;
    await supabase.from('lojas').update({ ativa: !confirmLoja.ativa }).eq('id', confirmLoja.id);
    toast.success(confirmLoja.ativa ? 'Loja desativada' : 'Loja reativada');
    setConfirmLoja(null);
    load();
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Gestão de lojas" description="Cadastre e gerencie unidades" />

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Nova loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={criar} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regiao">Região</Label>
              <Input id="regiao" value={regiao} onChange={(e) => setRegiao(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Cadastrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {lojas.length === 0 ? (
        <EmptyState icon={Store} title="Nenhuma loja cadastrada" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Região</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lojas.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.nome}</TableCell>
                <TableCell>{l.codigo}</TableCell>
                <TableCell>{l.regiao || '—'}</TableCell>
                <TableCell>
                  <button onClick={() => setConfirmLoja(l)}>
                    <Badge variant={l.ativa ? 'success' : 'muted'}>
                      {l.ativa ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!confirmLoja}
        onClose={() => setConfirmLoja(null)}
        title={confirmLoja?.ativa ? 'Desativar loja?' : 'Reativar loja?'}
        description={
          confirmLoja?.ativa
            ? `${confirmLoja.nome} ficará indisponível para novos vínculos.`
            : `${confirmLoja?.nome} voltará a ficar disponível.`
        }
        confirmLabel={confirmLoja?.ativa ? 'Desativar' : 'Reativar'}
        confirmVariant={confirmLoja?.ativa ? 'destructive' : 'primary'}
        onConfirm={toggleAtiva}
      />
    </div>
  );
}
