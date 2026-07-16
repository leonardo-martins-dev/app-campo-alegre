# Campo Alegre — monorepo

Um repositório Git, três pastas principais:

| Pasta | Conteúdo | Publicação |
|-------|----------|------------|
| [`mobile/`](mobile/) | App Expo (React Native) | App Store / Play Store (EAS) |
| [`web/`](web/) | Painel Next.js (admin) | VPS (Node + Nginx/Caddy) |
| [`supabase/`](supabase/) | Migrations SQL + Edge Functions | Supabase Cloud |

**Documentação:** [`docs/`](docs/) — [índice](docs/README.md)

## Backend

Não há servidor Node/Python no mobile. **Backend = Supabase na nuvem** (PostgreSQL + Auth + Storage + RLS). Mobile e painel usam o **mesmo projeto Supabase**.

Usuários, lojas e canhotos do sistema são alimentados pelo painel **jotter-logix** (sync → Supabase). Ver [`docs/integracao-jotter-logix.md`](docs/integracao-jotter-logix.md).

Setup: [`docs/setup-supabase.md`](docs/setup-supabase.md) · Deploy: [`docs/operations.md`](docs/operations.md)

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

**Build iOS:** [`docs/eas-build.md`](docs/eas-build.md) — rode comandos EAS apenas dentro de `mobile/`.

## Estrutura

```
campo-alegre/
  mobile/        ← app de campo (vai na loja)
  web/           ← administração e conferência
  supabase/      ← schema, RLS, Edge Functions
  docs/          ← guias e checklists
  scripts/       ← helpers de deploy/migrations
```
