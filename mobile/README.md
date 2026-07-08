# Campo Alegre — App Mobile

Aplicativo **Expo** (React Native) para publicação na **App Store / Play Store**.

Parte do monorepo [`campo-alegre`](../). Painel web e SQL do backend ficam nas pastas irmãs [`../web`](../web) e [`../supabase`](../supabase).

## Estrutura

- **`src/core`** — Auth, Supabase client, API, config
- **`src/features`** — Telas por fluxo de negócio
- **`src/shared`** — Tema, componentes
- **`src/app`** — Navegação

## Documentação

- Negócio: [../central-hub/doc.md](../central-hub/doc.md)
- App Store: [../central-hub/lancamento-app-store.md](../central-hub/lancamento-app-store.md)
- Backend SQL: [../supabase/README.md](../supabase/README.md)
- Painel web: [../web/README.md](../web/README.md)
- Setup Supabase: [SETUP-SUPABASE.md](./SETUP-SUPABASE.md)
- Build iOS: [EAS-BUILD.md](./EAS-BUILD.md)
- Escopo v1: [V1-SCOPE.md](./V1-SCOPE.md)
- Checklists deploy: [SUPABASE-PROD-CHECKLIST.md](./SUPABASE-PROD-CHECKLIST.md), [WEB-DEPLOY-CHECKLIST.md](./WEB-DEPLOY-CHECKLIST.md), [QA-TESTFLIGHT.md](./QA-TESTFLIGHT.md), [APP-STORE-SUBMIT.md](./APP-STORE-SUBMIT.md)

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
- **Supervisor**: + Conferência por loja, Gestão de usuários (leitura)
- **Administração**: Conferência por loja, Gestão de usuários (leitura)
- **Admin**: Dashboard, Gestão de lojas, Visualização unificada de canhotos

Escopo completo: [V1-SCOPE.md](./V1-SCOPE.md). Configuração de menus: `src/core/config/actionsConfig.ts`
