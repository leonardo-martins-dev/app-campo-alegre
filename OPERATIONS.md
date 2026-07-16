# Operações — deploy e produção

Checklist do monorepo. Credenciais ficam **fora** do Git (`.env`, EAS secrets, env da VPS).

## 1. Supabase (backend)

1. Criar projeto em [supabase.com](https://supabase.com)
2. Rodar migrations — ordem: [`scripts/run-migrations-order.ps1`](scripts/run-migrations-order.ps1) ou [`supabase/README.md`](supabase/README.md)
3. Primeiro admin: Auth → Add user → `010b_seed_admin_profile.sql`
4. Mobile: [`mobile/SETUP-SUPABASE.md`](mobile/SETUP-SUPABASE.md)

## 2. Painel web (VPS)

[`web/DEPLOY.md`](web/DEPLOY.md) — Node + Nginx/Caddy, variáveis `NEXT_PUBLIC_SUPABASE_*`, redirect URLs no Auth.

```bash
cd web
npm install && npm run build && npm start
```

## 3. Edge Functions

Já deployadas no projeto Campo Alegre (`invite-user`, `upload-sistema`). Redeploy:

```powershell
.\scripts\deploy-edge-functions.ps1 -ProjectRef yhdoradocardgedgrgzj
```

## 4. App iOS (EAS)

Somente em [`mobile/`](mobile/) — [`mobile/EAS-BUILD.md`](mobile/EAS-BUILD.md).

Checklists antes do build:

- [`mobile/SUPABASE-PROD-CHECKLIST.md`](mobile/SUPABASE-PROD-CHECKLIST.md)
- [`mobile/WEB-DEPLOY-CHECKLIST.md`](mobile/WEB-DEPLOY-CHECKLIST.md)
- [`mobile/QA-TESTFLIGHT.md`](mobile/QA-TESTFLIGHT.md)
- [`mobile/APP-STORE-SUBMIT.md`](mobile/APP-STORE-SUBMIT.md)
- Escopo v1: [`mobile/V1-SCOPE.md`](mobile/V1-SCOPE.md)

```bash
cd mobile
npm install -g eas-cli
eas login
eas init   # projectId já preenchido
# env vars já no EAS (preview/production/development)
npm run build:ios:preview      # distribuição interna / TestFlight
npm run build:ios:production   # App Store
```
