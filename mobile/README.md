# Campo Alegre — App Mobile

Aplicativo **Expo** (React Native) para publicação na **App Store / Play Store**.

Parte do monorepo. Painel web e SQL: [`../web`](../web), [`../supabase`](../supabase).

## Estrutura

- **`src/core`** — Auth, Supabase client, API, config
- **`src/features`** — Telas por fluxo de negócio
- **`src/shared`** — Tema, componentes
- **`src/app`** — Navegação

## Documentação

Índice: [../docs/README.md](../docs/README.md)

- Negócio: [../docs/negocio-central-hub.md](../docs/negocio-central-hub.md)
- Setup Supabase: [../docs/setup-supabase.md](../docs/setup-supabase.md)
- Build iOS: [../docs/eas-build.md](../docs/eas-build.md)
- Escopo v1: [../docs/v1-scope.md](../docs/v1-scope.md)
- Sync jotter: [../docs/integracao-jotter-logix.md](../docs/integracao-jotter-logix.md)
- Checklists: [supabase](../docs/checklist-supabase-prod.md), [web](../docs/checklist-web-deploy.md), [QA](../docs/checklist-qa-testflight.md), [App Store](../docs/app-store-submit.md)

## Backend do app

O app conecta diretamente ao **Supabase** (sem servidor no repositório).

```bash
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Sem `.env`, o app usa dados mock **apenas em desenvolvimento** (`__DEV__`). Builds de produção exigem Supabase configurado via EAS secrets.

## Como rodar

```bash
npm install
npx expo start
```

## Níveis e telas (v1)

- **Colaborador**: Lançamento canhoto, Conferência
- **Supervisor**: + Conferência por loja
- **Administração / Admin**: Conferência por loja, consulta de usuários/lojas (somente leitura — gestão no jotter), dashboard (admin)

Escopo completo: [../docs/v1-scope.md](../docs/v1-scope.md). Menus: `src/core/config/actionsConfig.ts`
