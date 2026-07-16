import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Nivel = 'colaborador' | 'supervisor' | 'administracao' | 'admin';

type Body = {
  action: 'create' | 'update' | 'deactivate' | 'delete';
  user_id?: string;
  nome?: string;
  email?: string;
  telefone?: string | null;
  nivel_acesso?: Nivel;
  loja_ids?: string[];
  ativo?: boolean;
  password?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Não autorizado' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData, error: authErr } = await userClient.auth.getUser();
    if (authErr || !authData.user) return json({ error: 'Sessão inválida' }, 401);

    const { data: caller } = await admin
      .from('profiles')
      .select('nivel_acesso')
      .eq('id', authData.user.id)
      .single();

    if (!caller || !['admin', 'administracao'].includes(caller.nivel_acesso)) {
      return json({ error: 'Apenas administrador pode gerenciar usuários' }, 403);
    }

    const body = (await req.json()) as Body;
    const action = body.action;

    if (action === 'create') {
      const email = body.email?.trim().toLowerCase();
      const nome = body.nome?.trim();
      const telefone = body.telefone?.trim() || null;
      const nivel = body.nivel_acesso;
      const lojaIds = body.loja_ids ?? [];
      const password = body.password?.trim() || genPassword();

      if (!email || !nome || !nivel) {
        return json({ error: 'nome, email e nivel_acesso são obrigatórios' }, 400);
      }
      if (!['colaborador', 'supervisor', 'administracao'].includes(nivel)) {
        return json({ error: 'Nível inválido. Use colaborador, supervisor ou administracao' }, 400);
      }
      if (['colaborador', 'supervisor'].includes(nivel) && lojaIds.length === 0) {
        return json({ error: 'Selecione ao menos uma loja para colaborador/supervisor' }, 400);
      }

      const primaryLoja = lojaIds[0] ?? null;

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome },
        app_metadata: {
          nome,
          nivel_acesso: nivel,
          loja_id: primaryLoja ?? '',
          telefone: telefone ?? '',
        },
      });

      if (createErr || !created.user) {
        return json({ error: createErr?.message ?? 'Falha ao criar usuário' }, 400);
      }

      const userId = created.user.id;

      await admin.from('profiles').upsert({
        id: userId,
        nome,
        email,
        telefone,
        nivel_acesso: nivel,
        loja_id: primaryLoja,
        ativo: true,
      });

      if (lojaIds.length > 0) {
        await admin.from('usuario_lojas').delete().eq('usuario_id', userId);
        await admin.from('usuario_lojas').insert(
          lojaIds.map((loja_id) => ({ usuario_id: userId, loja_id }))
        );
      }

      return json({
        success: true,
        user_id: userId,
        email,
        temporary_password: password,
      });
    }

    if (action === 'update') {
      const userId = body.user_id;
      if (!userId) return json({ error: 'user_id obrigatório' }, 400);

      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.nome?.trim()) patch.nome = body.nome.trim();
      if (body.telefone !== undefined) patch.telefone = body.telefone?.trim() || null;
      if (body.nivel_acesso) patch.nivel_acesso = body.nivel_acesso;
      if (body.ativo !== undefined) patch.ativo = body.ativo;

      const lojaIds = body.loja_ids;
      if (lojaIds) {
        if (['colaborador', 'supervisor'].includes(String(body.nivel_acesso ?? '')) && lojaIds.length === 0) {
          return json({ error: 'Selecione ao menos uma loja' }, 400);
        }
        patch.loja_id = lojaIds[0] ?? null;
        await admin.from('usuario_lojas').delete().eq('usuario_id', userId);
        if (lojaIds.length > 0) {
          await admin.from('usuario_lojas').insert(
            lojaIds.map((loja_id) => ({ usuario_id: userId, loja_id }))
          );
        }
      }

      const { error } = await admin.from('profiles').update(patch).eq('id', userId);
      if (error) return json({ error: error.message }, 400);

      if (body.nivel_acesso || body.nome || lojaIds) {
        await admin.auth.admin.updateUserById(userId, {
          app_metadata: {
            nome: body.nome,
            nivel_acesso: body.nivel_acesso,
            loja_id: lojaIds?.[0] ?? '',
            telefone: body.telefone ?? '',
          },
        });
      }

      return json({ success: true });
    }

    if (action === 'deactivate') {
      const userId = body.user_id;
      if (!userId) return json({ error: 'user_id obrigatório' }, 400);
      if (userId === authData.user.id) return json({ error: 'Não é possível desativar a si mesmo' }, 400);

      const { error } = await admin.from('profiles').update({ ativo: false }).eq('id', userId);
      if (error) return json({ error: error.message }, 400);
      await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
      return json({ success: true });
    }

    if (action === 'delete') {
      const userId = body.user_id;
      if (!userId) return json({ error: 'user_id obrigatório' }, 400);
      if (userId === authData.user.id) return json({ error: 'Não é possível apagar a si mesmo' }, 400);

      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    return json({ error: 'action inválida' }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno' }, 500);
  }
});
