# Build iOS — App Store (EAS)

Execute todos os comandos **nesta pasta** (`campo-alegre-mobile`). Não inclui o painel web.

## Pré-requisitos

- Conta [Apple Developer](https://developer.apple.com) ($99/ano)
- Conta [Expo](https://expo.dev)
- Supabase configurado ([SETUP-SUPABASE.md](./SETUP-SUPABASE.md))

## 1. Instalar EAS CLI

```bash
npm install -g eas-cli
eas login
```

## 2. Vincular projeto Expo

```bash
eas init
```

Atualize `app.json` → `extra.eas.projectId` com o ID gerado.

## 3. Secrets de produção (Supabase)

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://SEU-PROJETO.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "SUA_ANON_KEY"
```

## 4. Build iOS

```bash
# TestFlight (interno)
eas build --platform ios --profile preview

# App Store
eas build --platform ios --profile production
```

## 5. Submit

Ajuste `eas.json` → `submit.production.ios` (Apple ID, ASC App ID, Team ID):

```bash
eas submit --platform ios --profile production
```

## 6. App Store Connect

- Política de privacidade: URL do painel `/privacidade` após deploy (ex. `https://admin.campoalegre.com/privacidade`)
- Conta de teste para revisão (login administração ou colaborador)
- Screenshots e descrição em português

## Configuração iOS já no projeto

- `app.json`: nome **Campo Alegre**, `bundleIdentifier` `com.campoalegre.hub`
- Permissões câmera/galeria (`NSCameraUsageDescription`, etc.)
- `eas.json`: profiles development, preview, production

## Conta demo para Apple Review

Crie um usuário colaborador via painel admin (convite) e informe e-mail/senha nas notas de revisão do App Store Connect.
