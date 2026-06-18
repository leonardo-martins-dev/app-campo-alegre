# Supabase — Campo Alegre

Scripts SQL e Edge Functions para o backend compartilhado (mobile + painel web).

**App mobile:** [../mobile](../mobile) · **Setup completo:** [../mobile/SETUP-SUPABASE.md](../mobile/SETUP-SUPABASE.md)

## Executar migrations no SQL Editor

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Abra **SQL Editor** → **New query**
3. Execute os arquivos em `migrations/` **nesta ordem**:

| Ordem | Arquivo |
|-------|---------|
| 1 | `001_extensions_and_enums.sql` |
| 2 | `002_lojas.sql` |
| 3 | `003_profiles.sql` |
| 4 | `003b_convites.sql` |
| 5 | `004_canhotos.sql` |
| 6 | `005_procedimentos.sql` |
| 7 | `006_conferencias.sql` |
| 8 | `007_rls_helpers.sql` |
| 9 | `008_rls_policies.sql` |
| 10 | `009_storage_buckets.sql` |
| 11 | `010_seed.sql` |
| 12 | `010b_seed_admin_profile.sql` (após criar usuário admin no Auth) |

Opcional (fase avançada):

- `optional/011_importador_linker.sql`
- `optional/012_permissoes_dinamicas.sql`

## Primeiro admin

1. **Authentication → Users → Add user** com e-mail e senha
2. Copie o UUID do usuário
3. Edite e execute `010b_seed_admin_profile.sql` com o UUID

Ou use o painel web (após deploy) para convidar o primeiro admin manualmente via dashboard Supabase.

## Configuração manual no dashboard

| Item | Onde |
|------|------|
| Redirect URLs | Authentication → URL Configuration: `http://localhost:3000/auth/cadastro`, `http://localhost:3000/auth/callback` |
| Template de convite | Authentication → Email Templates → Invite user |
| Site URL | `http://localhost:3000` (dev) |

## Edge Function: invite-user

```bash
supabase functions deploy invite-user --project-ref SEU_PROJECT_REF
```

Variáveis (automáticas no Supabase): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`

Opcional: `INVITE_REDIRECT_URL=https://seu-dominio.com/auth/cadastro`

## Variáveis de ambiente (mobile e web)

```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Validação

Após executar as migrations, rode no SQL Editor:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT * FROM lojas;
SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public';
```
