import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteBody {
  email: string;
  nome: string;
  nivel_acesso: 'colaborador' | 'supervisor' | 'administracao' | 'admin';
  loja_id?: string | null;
  redirect_to?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await adminClient
      .from('profiles')
      .select('nivel_acesso')
      .eq('id', userData.user.id)
      .single();

    if (!profile || profile.nivel_acesso !== 'admin') {
      return new Response(JSON.stringify({ error: 'Apenas admin pode enviar convites' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as InviteBody;
    const email = body.email?.trim().toLowerCase();
    const nome = body.nome?.trim();
    const nivel_acesso = body.nivel_acesso;
    const loja_id = body.loja_id ?? null;
    const redirectTo = body.redirect_to ?? Deno.env.get('INVITE_REDIRECT_URL');

    if (!email || !nome || !nivel_acesso) {
      return new Response(JSON.stringify({ error: 'email, nome e nivel_acesso são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (['colaborador', 'supervisor'].includes(nivel_acesso) && !loja_id) {
      return new Response(JSON.stringify({ error: 'loja_id obrigatório para colaborador e supervisor' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: conviteError } = await adminClient.from('convites').insert({
      email,
      nome,
      nivel_acesso,
      loja_id,
      convidado_por: userData.user.id,
      status: 'pendente',
    });

    if (conviteError) {
      return new Response(JSON.stringify({ error: conviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectTo ?? undefined,
        data: { nome },
      }
    );

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (inviteData.user) {
      await adminClient.auth.admin.updateUserById(inviteData.user.id, {
        app_metadata: {
          nivel_acesso,
          loja_id: loja_id ?? '',
          nome,
        },
      });
    }

    return new Response(JSON.stringify({ success: true, email }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
