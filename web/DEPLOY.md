# Deploy — Painel Web

Deploy do Next.js em **Vercel** (recomendado). Na raiz do monorepo, use **Root Directory** = `web`.

## Vercel (CLI)

```bash
cd web
npm install
npm run build   # testar localmente
npx vercel
```

Na primeira vez, defina **Root Directory** = `web` se o repo incluir a pasta admin inteira.

## Variáveis de ambiente (Vercel)

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |

## Supabase Auth — URLs de produção

Após obter o domínio (ex. `https://campo-alegre.vercel.app`):

1. Authentication → URL Configuration
2. **Site URL:** `https://SEU-DOMINIO`
3. **Redirect URLs:**
   - `https://SEU-DOMINIO/auth/callback`
   - `https://SEU-DOMINIO/auth/cadastro`

## Edge Function `invite-user`

```bash
cd ../supabase
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy invite-user
```

Secret opcional no Supabase Dashboard → Edge Functions:

```
INVITE_REDIRECT_URL=https://SEU-DOMINIO/auth/cadastro
```

## Política de privacidade (App Store)

Após deploy, use:

```
https://SEU-DOMINIO/privacidade
```

Atualize `app.json` no mobile → `extra.privacyPolicyUrl` com essa URL antes do submit iOS.

## Deploy alternativo

Qualquer host Node.js com `npm run build && npm start` funciona; configure as mesmas variáveis `NEXT_PUBLIC_*`.
