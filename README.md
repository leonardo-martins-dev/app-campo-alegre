# Campo Alegre — App Mobile

Aplicativo **Expo** (React Native) da empresa Campo Alegre: hub central de ações com controle de acesso por nível (colaborador, supervisor, administração, admin).

## Estrutura

- **`src/core`** — Auth (context, tipos, mock users), config (ações e menus por nível), storage
- **`src/features`** — Login, Hub (central de ações), telas de funcionalidades (placeholders na v1)
- **`src/shared`** — Tema, ícones, componentes reutilizáveis
- **`src/app`** — Navegação (stack por nível)

Documentação de negócio e arquitetura: **[../central-hub/doc.md](../central-hub/doc.md)**.

## Login (dados mockados)

| E-mail | Senha  | Nível        |
|--------|--------|--------------|
| colaborador@campoalegre.com | 123456 | Colaborador  |
| supervisor@campoalegre.com | 123456 | Supervisor   |
| administracao@campoalegre.com | 123456 | Administração |
| admin@campoalegre.com | 123456 | Admin        |

## Como rodar

```bash
cd mobile
npm install
npx expo start
```

Depois abra no **Expo Go** (celular) ou use **npm run web** para web.

## Níveis e telas

- **Colaborador**: Lançamento canhoto, Conferência, Procedimentos promotores, Procedimento quebra
- **Supervisor**: + Visualização canhotos, Visualização procedimentos/quebra, Gestão usuários, Importador pedidos
- **Administração**: Como supervisor (ajustável no painel futuramente)
- **Admin**: Todas as telas, incluindo Dashboard, Gestão lojas, Upload sistema

Configuração de ações e menus: `src/core/config/actionsConfig.ts` (futuro: API do painel web).
