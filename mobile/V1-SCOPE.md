# Escopo v1 — App Store iOS

Funcionalidades **incluídas** na primeira versão publicada (integradas ao Supabase):

| Funcionalidade | Perfis |
|----------------|--------|
| Login / logout com sessão persistente | Todos |
| Lançamento de canhoto (foto + número) | colaborador, supervisor, admin |
| Conferência (enviados/pendentes) | colaborador |
| Conferência por loja (resumo + detalhe) | supervisor, administração, admin |
| Procedimentos promotores (checklist + fotos) | colaborador, admin |
| Procedimento de quebra | colaborador, admin |
| Visualização de procedimentos / quebra | supervisor, administração, admin |
| Gestão de usuários (leitura) | supervisor, administração |
| Gestão de lojas (leitura) | admin |
| Dashboard | admin |
| Visualização unificada de canhotos | admin |

## Ocultado na v1

| Funcionalidade | Motivo | Roadmap |
|----------------|--------|---------|
| **Importador de Pedidos** | UI mock, sem API no mobile | v2 — migration `011_importador_linker.sql` + API |
| **Upload do Sistema** (mobile) | UI mock; versão real no painel web | Manter apenas no painel web; mobile opcional em v2 via Edge Function `upload-sistema` |
| **Notificações** (sino no header) | Dados mock (`MOCK_NOTIFICATIONS`) | v2 — tabela `notificacoes` + push (`expo-notifications`) |

## Configuração aplicada

- Removido de `actionsConfig.ts` e `MENU_ITEMS`: Importador e Upload Sistema
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
