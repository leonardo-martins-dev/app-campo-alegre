# Build iOS — App Store (EAS)

Execute todos os comandos **nesta pasta** (`mobile/`). Não inclui o painel web.

## Documentação relacionada

| Documento | Conteúdo |
|-----------|----------|
| [SUPABASE-PROD-CHECKLIST.md](./SUPABASE-PROD-CHECKLIST.md) | Backend Supabase antes do build |
| [WEB-DEPLOY-CHECKLIST.md](./WEB-DEPLOY-CHECKLIST.md) | Painel web + URL de privacidade |
| [V1-SCOPE.md](./V1-SCOPE.md) | Funcionalidades incluídas/ocultas na v1 |
| [QA-TESTFLIGHT.md](./QA-TESTFLIGHT.md) | Checklist de testes em dispositivo |
| [APP-STORE-SUBMIT.md](./APP-STORE-SUBMIT.md) | Metadados e submissão |

## Pré-requisitos

- Conta [Apple Developer](https://developer.apple.com) ($99/ano)
- Conta [Expo](https://expo.dev)
- Supabase em produção ([SETUP-SUPABASE.md](./SETUP-SUPABASE.md))
- Painel web no ar com `/privacidade` ([WEB-DEPLOY-CHECKLIST.md](./WEB-DEPLOY-CHECKLIST.md))

## 1. Instalar EAS CLI

```bash
npm install -g eas-cli
eas login
```

## 2. Vincular projeto Expo

```bash
eas init
```

Atualize `app.json` → `extra.eas.projectId` com o ID gerado (substitui `SUBSTITUIR_EAS_PROJECT_ID`).

Atualize `extra.privacyPolicyUrl` com a URL real do painel (ex.: `https://admin.campoalegre.com/privacidade`).

## 3. Secrets de produção (Supabase)

Obrigatórios — o build `production` falha sem eles (`scripts/validate-production-env.js`):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://SEU-PROJETO.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "SUA_ANON_KEY"
```

Opcional:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_PRIVACY_POLICY_URL --value "https://admin.seu-dominio.com/privacidade"
```

## 4. Scripts npm

```bash
npm run typecheck              # Verificar TypeScript
npm run build:ios:preview      # TestFlight (interno)
npm run build:ios:production   # App Store
npm run submit:ios             # Enviar à App Store Connect
```

## 5. Build iOS

```bash
# TestFlight (interno)
npm run build:ios:preview

# App Store (valida env vars no servidor EAS)
npm run build:ios:production
```

## 6. Submit

Preencha credenciais reais em `eas.json` → `submit.production.ios`:

| Campo | Descrição |
|-------|-----------|
| `appleId` | Apple ID do responsável |
| `ascAppId` | App Store Connect → App → Apple ID |
| `appleTeamId` | developer.apple.com → Membership |

```bash
npm run submit:ios
```

Detalhes em [APP-STORE-SUBMIT.md](./APP-STORE-SUBMIT.md).

## 7. Segurança v1

- Builds de **produção** não permitem modo mock (login demo `123456`)
- Telas mock ocultas: Importador, Upload Sistema, Notificações — ver [V1-SCOPE.md](./V1-SCOPE.md)
- `.env` está no `.gitignore` — use EAS secrets para produção

## Configuração iOS já no projeto

- `app.json`: nome **Campo Alegre**, `bundleIdentifier` `com.campoalegre.hub`
- Permissões câmera/galeria (`NSCameraUsageDescription`, etc.)
- `eas.json`: profiles development, preview, production (`autoIncrement` + validação de env)

## Conta demo para Apple Review

Crie um usuário colaborador via painel admin (convite) e informe e-mail/senha nas notas de revisão do App Store Connect.
