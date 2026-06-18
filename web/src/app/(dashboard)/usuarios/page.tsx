'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { NivelAcesso } from '@/lib/types';

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
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
    setMsg('');
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
      setMsg(json.error ?? 'Erro ao enviar convite.');
    } else {
      setMsg(`Convite enviado para ${email}`);
      setEmail('');
      setNome('');
      load();
    }
    setLoading(false);
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    await supabase.from('profiles').update({ ativo: !ativo }).eq('id', id);
    load();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Gestão de usuários</h2>

      <form onSubmit={enviarConvite} className="bg-white rounded-lg shadow-sm border p-6 space-y-4 max-w-xl">
        <h3 className="font-semibold">Convidar usuário</h3>
        <p className="text-sm text-slate-600">O usuário receberá um e-mail com link para definir a senha.</p>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value as NivelAcesso)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="colaborador">Colaborador</option>
          <option value="supervisor">Supervisor</option>
          <option value="administracao">Administração</option>
          <option value="admin">Admin</option>
        </select>
        {['colaborador', 'supervisor'].includes(nivel) && (
          <select
            value={lojaId}
            onChange={(e) => setLojaId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Selecione a loja</option>
            {lojas.map((l) => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        )}
        {msg && <p className="text-sm text-sky-700">{msg}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar convite'}
        </button>
      </form>

      <div>
        <h3 className="font-semibold mb-3">Usuários cadastrados</h3>
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">E-mail</th>
                <th className="text-left p-3">Nível</th>
                <th className="text-left p-3">Loja</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.nome}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.nivel_acesso}</td>
                  <td className="p-3">{u.lojas?.nome ?? '—'}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleAtivo(u.id, u.ativo)}
                      className={`text-xs px-2 py-1 rounded ${u.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}
                    >
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Convites</h3>
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3">E-mail</th>
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Nível</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {convites.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.nome}</td>
                  <td className="p-3">{c.nivel_acesso}</td>
                  <td className="p-3">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
