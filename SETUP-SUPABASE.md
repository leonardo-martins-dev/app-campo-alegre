# Setup Supabase — Campo Alegre

Backend compartilhado pelo **app mobile** e **painel web**. Scripts SQL em [`../campo-alegre-admin/supabase/`](../campo-alegre-admin/supabase/).

## Checklist

### 1. Criar projeto

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Anote **Project URL** e **anon public key** (Settings → API)

### 2. Executar migrations

No **SQL Editor**, execute na ordem os arquivos em `campo-alegre-admin/supabase/migrations/`:

`001` → `002` → `003` → `003b` → `004` → `005` → `006` → `007` → `008` → `009` → `010` → `010b` (após criar usuário admin no Auth)

Validação: rode `campo-alegre-admin/supabase/validate.sql`

### 3. Primeiro admin

1. Authentication → Users → **Add user** (e-mail + senha)
2. Copie o UUID
3. Edite e execute `010b_seed_admin_profile.sql` com o UUID

### 4. Configurar Auth (painel + convites)

Em Authentication → URL Configuration:

| Ambiente | URLs |
|----------|------|
| Dev | `http://localhost:3000/auth/cadastro`, `http://localhost:3000/auth/callback` |
| Produção | `https://SEU-DOMINIO/auth/cadastro`, `https://SEU-DOMINIO/auth/callback` |

Personalize o template **Invite user** em português.

### 5. Edge Functions

Com [Supabase CLI](https://supabase.com/docs/guides/cli) instalado, na pasta `campo-alegre-admin/supabase`:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy invite-user
supabase functions deploy upload-sistema
```

Defina `INVITE_REDIRECT_URL=https://seu-dominio.com/auth/cadastro` nos secrets do projeto.

### 6. Variáveis no app mobile

Nesta pasta (`campo-alegre-mobile`):

```bash
cp .env.example .env
```

Preencha:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Para **build EAS de produção**, use secrets (ver [EAS-BUILD.md](./EAS-BUILD.md)):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

### 7. Variáveis no painel web

Em `campo-alegre-admin/web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Arquitetura

```
App Mobile (Expo) ──HTTPS──► Supabase Auth + DB + Storage
Painel Web (Next) ──HTTPS──► mesmo projeto Supabase
Admin convida user ──► Edge Function invite-user
```

O app **não** inclui código do painel web — só a URL e anon key do Supabase.
