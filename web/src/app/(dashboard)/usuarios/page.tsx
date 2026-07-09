'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { NivelAcesso } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

interface UsuarioRow {
  id: string;
  nome: string;
  email: string;
  nivel_acesso: NivelAcesso;
  ativo: boolean;
  lojas: { nome: string } | null;
}

interface ConviteRow {
  id: string;
  email: string;
  nome: string;
  nivel_acesso: string;
  status: string;
  created_at: string;
}

interface LojaOption {
  id: string;
  nome: string;
}

export default function UsuariosPage() {
  const supabase = createClient();
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [convites, setConvites] = useState<ConviteRow[]>([]);
  const [lojas, setLojas] = useState<LojaOption[]>([]);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState<NivelAcesso>('colaborador');
  const [lojaId, setLojaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmUser, setConfirmUser] = useState<UsuarioRow | null>(null);

  const load = useCallback(async () => {
    const [u, c, l] = await Promise.all([
      supabase.from('profiles').select('id, nome, email, nivel_acesso, ativo, lojas(nome)').order('nome'),
      supabase.from('convites').select('*').order('created_at', { ascending: false }),
      supabase.from('lojas').select('id, nome').eq('ativa', true).order('nome'),
    ]);
    setUsuarios((u.data as unknown as UsuarioRow[]) ?? []);
    setConvites((c.data as unknown as ConviteRow[]) ?? []);
    setLojas(l.data ?? []);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const enviarConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        email,
        nome,
        nivel_acesso: nivel,
        loja_id: lojaId || null,
        redirect_to: `${window.location.origin}/auth/cadastro`,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? 'Erro ao enviar convite.');
    } else {
      toast.success(`Convite enviado para ${email}`);
      setEmail('');
      setNome('');
      load();
    }
    setLoading(false);
  };

  const toggleAtivo = async () => {
    if (!confirmUser) return;
    await supabase.from('profiles').update({ ativo: !confirmUser.ativo }).eq('id', confirmUser.id);
    toast.success(confirmUser.ativo ? 'Usuário desativado' : 'Usuário reativado');
    setConfirmUser(null);
    load();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gestão de usuários"
        description="Convide novos membros e gerencie acessos"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            Convidar usuário
          </CardTitle>
          <CardDescription>
            O usuário receberá um e-mail com link para definir a senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviarConvite} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivel">Nível de acesso</Label>
              <Select id="nivel" value={nivel} onChange={(e) => setNivel(e.target.value as NivelAcesso)}>
                <option value="colaborador">Colaborador</option>
                <option value="supervisor">Supervisor</option>
                <option value="administracao">Administração</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            {['colaborador', 'supervisor'].includes(nivel) && (
              <div className="space-y-2">
                <Label htmlFor="loja">Loja</Label>
                <Select id="loja" value={lojaId} onChange={(e) => setLojaId(e.target.value)} required>
                  <option value="">Selecione a loja</option>
                  {lojas.map((l) => (
                    <option key={l.id} value={l.id}>{l.nome}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="sm:col-span-2">
              <Button type="submit" loading={loading}>
                Enviar convite
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Usuários cadastrados</h3>
        {usuarios.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum usuário cadastrado" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="primary">{u.nivel_acesso}</Badge>
                  </TableCell>
                  <TableCell>{u.lojas?.nome ?? '—'}</TableCell>
                  <TableCell>
                    <button onClick={() => setConfirmUser(u)}>
                      <Badge variant={u.ativo ? 'success' : 'muted'}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Convites</h3>
        {convites.length === 0 ? (
          <EmptyState icon={UserPlus} title="Nenhum convite pendente" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {convites.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.nome}</TableCell>
                  <TableCell>{c.nivel_acesso}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        title={confirmUser?.ativo ? 'Desativar usuário?' : 'Reativar usuário?'}
        description={
          confirmUser?.ativo
            ? `${confirmUser.nome} perderá acesso ao sistema.`
            : `${confirmUser?.nome} voltará a ter acesso ao sistema.`
        }
        confirmLabel={confirmUser?.ativo ? 'Desativar' : 'Reativar'}
        confirmVariant={confirmUser?.ativo ? 'destructive' : 'primary'}
        onConfirm={toggleAtivo}
      />
    </div>
  );
}
