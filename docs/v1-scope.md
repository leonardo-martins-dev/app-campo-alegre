# Escopo v1 — App Store iOS

Funcionalidades **incluídas** na primeira versão publicada (integradas ao Supabase):

| Funcionalidade | Perfis |
|----------------|--------|
| Login / logout com sessão persistente | Todos |
| Lançamento de canhoto (foto + número) | colaborador, supervisor, admin |
| Conferência (enviados/pendentes) | colaborador |
| Conferência por loja (resumo + detalhe) | supervisor, administração, admin |
| Gestão de usuários (leitura) | supervisor, administração |
| Gestão de lojas (leitura) | admin |
| Dashboard | admin |
| Visualização unificada de canhotos | admin |

## Ocultado na v1

| Funcionalidade | Motivo | Roadmap |
|----------------|--------|---------|
| **Procedimentos Promotores** | Fora do escopo da 1ª versão App Store | v2 — telas e API já existem no código |
| **Procedimento de Quebra** | Fora do escopo da 1ª versão App Store | v2 — telas e API já existem no código |
| **Visualização de Procedimentos** | Depende dos fluxos de procedimentos | v2 |
| **Visualização Quebra** | Depende dos fluxos de quebra | v2 |
| **Importador de Pedidos** | UI mock, sem API no mobile | v2 — migration `011_importador_linker.sql` + API |
| **Upload do Sistema** (mobile) | UI mock; versão real no painel web | Manter apenas no painel web; mobile opcional em v2 via Edge Function `upload-sistema` |
| **Notificações** (sino no header) | Dados mock (`MOCK_NOTIFICATIONS`) | v2 — tabela `notificacoes` + push (`expo-notifications`) |

## Configuração aplicada

- Removido de `actionsConfig.ts` e `MENU_ITEMS`: procedimentos, quebra, visualizações de procedimentos/quebra, Importador e Upload Sistema
- Aba **Procedimentos** removida de `TABS_BY_ROLE` para todos os perfis
- Aba **Mais** removida (ficava vazia após ocultar Importador)
- `HeaderNotification` oculto no `CustomHeader`
- Builds de produção bloqueiam modo mock (sem Supabase configurado)

## Fora do escopo v1 (planejado pós-lançamento)

- Android (Google Play)
- Crash reporting (Sentry)
- CI/CD automatizado
- OTA updates (`expo-updates`)
- Offline / fila de retry para uploads
- Gestão de usuários com escrita no mobile (convites permanecem no painel web)
