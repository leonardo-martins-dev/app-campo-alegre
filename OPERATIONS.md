# Operações — deploy e produção

Checklist do monorepo. Credenciais ficam **fora** do Git (`.env`, Vercel, EAS secrets).

## 1. Supabase (backend)

1. Criar projeto em [supabase.com](https://supabase.com)
2. Rodar migrations — ordem: [`scripts/run-migrations-order.ps1`](scripts/run-migrations-order.ps1) ou [`supabase/README.md`](supabase/README.md)
3. Primeiro admin: Auth → Add user → `010b_seed_admin_profile.sql`
4. Mobile: [`mobile/SETUP-SUPABASE.md`](mobile/SETUP-SUPABASE.md)

## 2. Painel web (Vercel)

[`web/DEPLOY.md`](web/DEPLOY.md) — variáveis `NEXT_PUBLIC_SUPABASE_*`, redirect URLs no Auth.

```bash
cd web
npm install && npm run build
npx vercel
```

## 3. Edge Functions

Com [Supabase CLI](https://supabase.com/docs/guides/cli):

```powershell
.\scripts\deploy-edge-functions.ps1 -ProjectRef SEU_PROJECT_REF
```

## 4. App iOS (EAS)

Somente em [`mobile/`](mobile/) — [`mobile/EAS-BUILD.md`](mobile/EAS-BUILD.md).

```bash
cd mobile
npm install -g eas-cli
eas login
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
eas build --platform ios --profile production
```
