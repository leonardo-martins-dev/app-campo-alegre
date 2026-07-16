# Operações — deploy e produção

Checklist do monorepo. Credenciais ficam **fora** do Git (`.env`, EAS secrets, env da VPS).

## 1. Supabase (backend)

1. Criar projeto em [supabase.com](https://supabase.com)
2. Rodar migrations — ordem: [`../scripts/run-migrations-order.ps1`](../scripts/run-migrations-order.ps1) ou [`../supabase/README.md`](../supabase/README.md)
3. Primeiro admin: Auth → Add user → `010b_seed_admin_profile.sql`
4. Guia: [`setup-supabase.md`](./setup-supabase.md)

## 2. Painel web (VPS)

[`web-deploy.md`](./web-deploy.md) — Node + Nginx/Caddy, variáveis `NEXT_PUBLIC_SUPABASE_*`, redirect URLs no Auth.

```bash
cd web
npm install && npm run build && npm start
```

## 3. Edge Functions

Já deployadas no projeto Campo Alegre (`invite-user`, `upload-sistema`, `manage-user`). Redeploy:

```powershell
.\scripts\deploy-edge-functions.ps1 -ProjectRef yhdoradocardgedgrgzj
```

## 4. Sync jotter → Supabase

Fonte da verdade de usuários/lojas/canhotos-sistema: painel jotter na VPS.  
Ver [`integracao-jotter-logix.md`](./integracao-jotter-logix.md).

## 5. App iOS (EAS)

Comandos somente em [`../mobile/`](../mobile/) — [`eas-build.md`](./eas-build.md).

Checklists antes do build:

- [`checklist-supabase-prod.md`](./checklist-supabase-prod.md)
- [`checklist-web-deploy.md`](./checklist-web-deploy.md)
- [`checklist-qa-testflight.md`](./checklist-qa-testflight.md)
- [`app-store-submit.md`](./app-store-submit.md)
- Escopo v1: [`v1-scope.md`](./v1-scope.md)

```bash
cd mobile
npm install -g eas-cli
eas login
eas init   # projectId já preenchido
npm run build:ios:preview      # distribuição interna / TestFlight
npm run build:ios:production   # App Store
```
