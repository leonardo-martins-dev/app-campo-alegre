# Campo Alegre — monorepo

Um repositório Git, três pastas principais:

| Pasta | Conteúdo | Publicação |
|-------|----------|------------|
| [`mobile/`](mobile/) | App Expo (React Native) | App Store / Play Store (EAS) |
| [`web/`](web/) | Painel Next.js (admin) | Vercel ou similar |
| [`supabase/`](supabase/) | Migrations SQL + Edge Functions | Supabase Cloud |

Documentação de negócio: [`central-hub/doc.md`](central-hub/doc.md)

## Backend

Não há servidor Node/Python no mobile. **Backend = Supabase na nuvem** (PostgreSQL + Auth + Storage + RLS). Mobile e painel usam o **mesmo projeto Supabase**.

Setup: [`mobile/SETUP-SUPABASE.md`](mobile/SETUP-SUPABASE.md) · Deploy: [`OPERATIONS.md`](OPERATIONS.md)

## Desenvolvimento

**App mobile**

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

**Painel web**

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

**Build iOS:** [`mobile/EAS-BUILD.md`](mobile/EAS-BUILD.md) — rode comandos EAS apenas dentro de `mobile/`.

## Estrutura

```
campo-alegre/
  mobile/        ← app de campo (vai na loja)
  web/           ← administração e conferência
  supabase/      ← schema, RLS, Edge Functions
  central-hub/   ← docs de negócio
  scripts/       ← helpers de deploy/migrations
```
