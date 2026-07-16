/**
 * Edge Function opcional para processamento de planilhas XLSX no servidor.
 * O painel web também suporta upload CSV direto no cliente.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const rows = body.rows as Array<{
      numero: string;
      loja_id: string;
      nfe?: string;
      total?: number;
      nome_fantasia?: string;
    }>;

    if (!Array.isArray(rows)) {
      return new Response(JSON.stringify({ error: 'rows obrigatório' }), { status: 400, headers: corsHeaders });
    }

    const { error } = await admin.from('canhotos_sistema').upsert(
      rows.map((r) => ({
        numero: r.numero,
        loja_id: r.loja_id,
        data: new Date().toISOString().slice(0, 10),
        nfe: r.nfe ?? null,
        total: r.total ?? null,
        nome_fantasia: r.nome_fantasia ?? null,
        status: 'disponivel',
      })),
      { onConflict: 'numero,loja_id' }
    );

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, count: rows.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders });
  }
});
