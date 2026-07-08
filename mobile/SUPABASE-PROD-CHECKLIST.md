# Checklist — Supabase em produção (pré-deploy iOS)

Execute na ordem antes do build EAS de produção.

## 1. Projeto Supabase

- [ ] Projeto criado em [supabase.com](https://supabase.com)
- [ ] Anotar **Project URL** e **anon public key** (Settings → API)
- [ ] Anotar **Project Ref** (para Edge Functions)

## 2. Migrations

Execute na ordem (SQL Editor ou `scripts/run-migrations-order.ps1`):

- [ ] `001` → `002` → `003` → `003b` → `004` → `005` → `006` → `007` → `008` → `009` → `010`
- [ ] Criar usuário admin no Auth → executar `010b_seed_admin_profile.sql` com o UUID
- [ ] Rodar `supabase/validate.sql` sem erros

## 3. Storage

- [ ] Bucket `canhotos-fotos` existe e políticas RLS ativas (migration `009`)
- [ ] Bucket `procedimentos-fotos` existe e políticas RLS ativas

## 4. Auth

- [ ] Redirect URLs de produção configuradas (ver [`web/DEPLOY.md`](../web/DEPLOY.md))
- [ ] Template **Invite user** em português

## 5. Edge Functions

```powershell
.\scripts\deploy-edge-functions.ps1 -ProjectRef SEU_PROJECT_REF
```

- [ ] `invite-user` deployada
- [ ] `upload-sistema` deployada
- [ ] Secret `INVITE_REDIRECT_URL` definido

## 6. Dados iniciais

- [ ] Pelo menos 1 loja ativa cadastrada (painel web)
- [ ] Checklist templates em `checklist_templates` (promotor + quebra)
- [ ] Canhotos sistema importados (painel web → Upload)

## 7. Usuários por perfil (teste RLS)

- [ ] Colaborador — vê só seus canhotos/procedimentos
- [ ] Supervisor — vê resumo por loja e pode aprovar/rejeitar
- [ ] Administração — conferência por loja, visualizações, gestão usuários (leitura)
- [ ] Admin — acesso completo no painel web

## 8. Conta demo Apple Review

- [ ] Criar colaborador via painel (convite `invite-user`)
- [ ] Confirmar login no app com credenciais reais
- [ ] Anotar e-mail/senha para App Store Connect → Notes for Review

## 9. EAS secrets (após checklist acima)

```bash
cd mobile
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

- [ ] Secrets criados no projeto EAS
- [ ] Testar login em build `preview` (TestFlight)
