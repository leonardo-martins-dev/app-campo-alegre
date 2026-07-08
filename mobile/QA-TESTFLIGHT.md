# QA — TestFlight (build preview)

Execute em **dispositivo físico iOS** com build `eas build --platform ios --profile preview`.

## Pré-requisitos

- [ ] Supabase em produção ([`SUPABASE-PROD-CHECKLIST.md`](./SUPABASE-PROD-CHECKLIST.md))
- [ ] EAS secrets configurados
- [ ] Usuários de teste criados (colaborador, supervisor, administração)

## Checklist por fluxo

| # | Fluxo | Perfil | Critério de aceite | OK |
|---|-------|--------|-------------------|-----|
| 1 | Login / logout | Todos | Sessão persiste após fechar e reabrir app | |
| 2 | Lançamento canhoto | colaborador | Foto sobe; número validado contra `canhotos_sistema` | |
| 3 | Conferência | colaborador | Lista enviados e pendentes reais | |
| 4 | Conferência por loja | supervisor | Resumo clicável; canhotos filtrados por loja | |
| 5 | Conferência por loja | administração | Mesmo que supervisor; sem botão "Enviar canhoto" | |
| 6 | Aprovar/rejeitar canhoto | supervisor | Status atualiza no Supabase | |
| 7 | Procedimentos promotores | colaborador | Checklist + fotos persistem | |
| 8 | Procedimento quebra | colaborador | Envio registrado | |
| 9 | Ver procedimentos / quebra | supervisor, administração | Listas reais | |
| 10 | Gestão usuários | supervisor, administração | Lista de profiles | |
| 11 | Permissões câmera/galeria | colaborador | Prompts em português | |
| 12 | Modo offline | Todos | Mensagem de erro (não tela vazia) | |
| 13 | Telas ocultas v1 | admin, administração | Sem Importador, Upload, notificações | |
| 14 | App sem Supabase | — | Tela "App não configurado" (build production) | |

## Regressão visual

- [ ] Splash e ícone corretos
- [ ] Header com logout (Hub) e sem sino de notificações
- [ ] Abas corretas por perfil (sem aba "Mais")

## Aprovação

- [ ] Todos os itens críticos (1–10) aprovados
- [ ] Bugs bloqueantes corrigidos antes do build `production`
