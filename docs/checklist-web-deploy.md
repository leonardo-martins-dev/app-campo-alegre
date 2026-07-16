# Checklist — Painel web e privacidade (pré-deploy iOS)

O app iOS exige URL de política de privacidade válida no App Store Connect.

## 1. Deploy VPS

Seguir [`web-deploy.md`](./web-deploy.md):

```bash
cd web
npm install && npm run build
npm start   # atrás de Nginx/Caddy + HTTPS
```

- [ ] Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no servidor
- [ ] Build sem erros (`npm run build`)
- [ ] Domínio de produção definido (ex.: `admin.campoalegre.com`)

## 2. Página de privacidade

A página já existe em [`web/src/app/privacidade/page.tsx`](../web/src/app/privacidade/page.tsx).

- [ ] Acessível em `https://SEU-DOMINIO/privacidade`
- [ ] Conteúdo revisado (dados coletados, uso, armazenamento, contato)
- [ ] Atualizar `mobile/app.json` → `extra.privacyPolicyUrl` com a URL real

## 3. Auth redirect URLs (Supabase)

Em Authentication → URL Configuration, adicionar URLs de produção:

- [ ] `https://SEU-DOMINIO/auth/cadastro`
- [ ] `https://SEU-DOMINIO/auth/callback`
- [ ] Site URL: `https://SEU-DOMINIO`

## 4. Convites de usuário

- [x] Edge Function `invite-user` deployada
- [ ] `INVITE_REDIRECT_URL=https://SEU-DOMINIO/auth/cadastro` nos secrets Supabase
- [ ] Testar convite de colaborador pelo painel

## 5. Operação mínima no painel

- [ ] Admin consegue logar
- [ ] Cadastro de lojas funcional
- [ ] Upload de canhotos sistema (CSV)
- [ ] Convite de usuários para testes de campo
