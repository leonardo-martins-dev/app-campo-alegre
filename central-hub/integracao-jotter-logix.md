# Integração Jotter-Logix → Supabase

O painel **jotter-logix** (Postgres na VPS) é a **fonte única da verdade** para:

- usuários (colaborador / supervisor / administrador)
- lojas (`supermercados`)
- canhotos do sistema (números para preenchimento)

O app mobile lê **somente** o Supabase Cloud. Canhotos lançados com foto no app **não** voltam ao Postgres do jotter.

## Arquitetura

```
Painel jotter → Express (backend-new) → Postgres VPS
                      │
                      ├─ hooks após CRUD
                      └─ cron reconcile (padrão 10 min)
                              │
                              ▼
                    Supabase (service_role)
                      │
                      ▼
                    App mobile
```

## Variáveis de ambiente (VPS / jotter `backend-new/.env`)

```env
SYNC_SUPABASE_ENABLED=true
SUPABASE_URL=https://yhdoradocardgedgrgzj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role do projeto>
SYNC_SUPABASE_INTERVAL_MS=600000
```

Nunca exponha a `service_role` no frontend.

## Mapeamento

| Jotter | Supabase |
|--------|----------|
| `supermercados.id` | `lojas.codigo = jotter:{id}` |
| `usuarios` + `usuario_supermercado` | `auth.users` + `profiles` + `usuario_lojas` |
| `canhotossistema` | `canhotos_sistema` (`numero` + `loja_id`) |
| cargo `Administrador` | `nivel_acesso = admin` |
| cargo `Supervisor` | `supervisor` |
| cargo `Colaborador` | `colaborador` |

Mapa local: tabela `sync_supabase_users (usuario_id → supabase_user_id)`.

## API

| Método | Rota | Quem |
|--------|------|------|
| `GET` | `/api/sync/supabase/status` | Administrador |
| `POST` | `/api/sync/supabase/full` | Administrador — carga inicial / recuperação |

## Runbook — carga inicial

1. No servidor do jotter, configure as envs acima.
2. Instale dependências e suba o backend:

```bash
cd backend-new
npm install
npm run migrate:sync-supabase   # cria sync_supabase_users
pm2 restart <nome-do-processo>
```

3. Com um token de Administrador, dispare a carga:

```bash
curl -X POST https://SEU-DOMINIO/api/sync/supabase/full \
  -H "Authorization: Bearer <JWT_ADMIN>" \
  -H "Content-Type: application/json"
```

4. No Supabase Dashboard, confira contagens de `lojas`, `profiles`, `canhotos_sistema`.
5. **Senhas na carga inicial:** usuários já existentes recebem senha temporária aleatória no Auth (o hash bcrypt do jotter não é portável). Opções:
   - alterar a senha no painel jotter (propaga para o Supabase via hook), ou
   - reset de senha no Supabase Auth para cada usuário que for usar o app.
6. Novos usuários criados no jotter **com senha** já ficam alinhados no app.
7. Teste login no app com um colaborador e confira números de canhoto disponíveis após upload no painel.

## Hooks automáticos

Após sucesso no jotter:

- criar/editar/excluir usuário
- alterar senha (`PUT /api/auth/change-password`)
- editar/ativar/inativar loja
- upload Excel de canhotos-sistema
- exclusão de canhotos-sistema

## App mobile

Telas de Usuários / Lojas são **somente leitura**. Gestão continua no painel jotter.

## Próxima fase (fora deste sync)

Painel jotter pode **consultar** canhotos lançados no app via API Supabase (sem copiar para o Postgres local).
