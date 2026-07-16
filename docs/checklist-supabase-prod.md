# Checklist — Supabase em produção (pré-deploy iOS)

**Projeto:** Campo alegre - app (`yhdoradocardgedgrgzj`)  
**URL:** `https://yhdoradocardgedgrgzj.supabase.co`

Execute na ordem antes do build EAS de produção.

## 1. Projeto Supabase

- [x] Projeto criado em [supabase.com](https://supabase.com)
- [x] Anotar **Project URL** e **anon public key** (Settings → API)
- [x] Anotar **Project Ref** (`yhdoradocardgedgrgzj`)

## 2. Migrations

Execute na ordem (SQL Editor ou `scripts/run-migrations-order.ps1`):

- [x] `001` → `002` → `003` → `003b` → `004` → `005` → `006` → `007` → `008` → `009` → `010` → `010c`
- [x] Criar usuário admin no Auth → executar `010b_seed_admin_profile.sql` com o UUID
- [x] Rodar `supabase/validate.sql` sem erros (4 lojas, 5 canhotos sistema, 14 checklist templates)

## 3. Storage

- [x] Bucket `canhotos-fotos` existe e políticas RLS ativas (migration `009`)
- [x] Bucket `procedimentos-fotos` existe e políticas RLS ativas

## 4. Auth

- [ ] Redirect URLs de produção configuradas (ver [`web-deploy.md`](./web-deploy.md))
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
