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

## Backend do app

O app conecta diretamente ao **Supabase** (sem servidor no repositório).

```bash
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Sem `.env`, o app usa dados mock para desenvolvimento offline.

## Como rodar

```bash
npm install
npx expo start
```

## Níveis e telas

- **Colaborador**: Lançamento canhoto, Conferência, Procedimentos promotores, Procedimento quebra
- **Supervisor**: + Conferência por loja, visualizações
- **Admin**: Dashboard, gestão (mobile), todas as telas

Configuração de menus: `src/core/config/actionsConfig.ts`
