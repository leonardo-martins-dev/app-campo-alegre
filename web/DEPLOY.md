# Deploy — Painel Web (VPS)

Deploy do Next.js em **VPS própria** (Node.js + reverse proxy).

## Pré-requisitos no servidor

- Node.js 20+ (LTS)
- Nginx ou Caddy (HTTPS)
- Domínio apontando para o IP da VPS (ex.: `https://admin.campoalegre.com`)

## Variáveis de ambiente

No servidor, crie `web/.env.local` (ou configure no process manager):

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yhdoradocardgedgrgzj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do projeto Supabase |

## Build e start

```bash
cd web
npm install
npm run build
npm start   # porta 3000 por padrão
```

Recomendado em produção: **PM2** ou systemd.

```bash
npm install -g pm2
pm2 start npm --name campo-alegre-web -- start
pm2 save
```

Nginx (exemplo):

```nginx
server {
  server_name admin.seu-dominio.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Depois: `certbot` (Let's Encrypt) para HTTPS.

## Supabase Auth — URLs de produção

Após o domínio estar no ar:

1. Supabase → Authentication → URL Configuration
2. **Site URL:** `https://SEU-DOMINIO`
3. **Redirect URLs:**
   - `https://SEU-DOMINIO/auth/callback`
   - `https://SEU-DOMINIO/auth/cadastro`

## Edge Function `invite-user`

Já deployada no projeto. Defina o secret:

```
INVITE_REDIRECT_URL=https://SEU-DOMINIO/auth/cadastro
```

(Dashboard → Edge Functions → Secrets)

## Política de privacidade (App Store)

Após deploy:

```
https://SEU-DOMINIO/privacidade
```

Atualize `mobile/app.json` → `extra.privacyPolicyUrl` com essa URL **antes** do submit iOS.
