# Campo Alegre Mobile — Lançamento App Store e Infraestrutura

Documentação de referência com diagnóstico do estado atual do app, recomendações de banco de dados e backend, checklist para publicação na Apple App Store e roadmap sugerido.

**App Expo:** [`../mobile`](../mobile). Ver [`../mobile/README.md`](../mobile/README.md), [`doc.md`](./doc.md) e [`../mobile/EAS-BUILD.md`](../mobile/EAS-BUILD.md).

---

## 1. Estado atual do projeto

O app é um **Expo SDK 54 / React Native** em [`mobile/`](../mobile), integrado ao **Supabase** (Auth, PostgreSQL, Storage). Painel web Next.js em [`web/`](../web/).

| Área | Status |
|------|--------|
| Login | Supabase Auth (+ fallback mock sem `.env`) |
| Canhotos, procedimentos, conferência | API em `src/core/api/`, RLS no Postgres |
| Gestão / dashboard mobile | Integrado ao Supabase |
| Painel web | Usuários, lojas, conferência admin, upload CSV |
| Backend no repositório | **Supabase na nuvem** — SQL em `supabase/migrations/` |

**Próximo passo operacional:** criar projeto Supabase, rodar migrations, deploy do painel e build EAS — ver [`SETUP-SUPABASE.md`](../mobile/SETUP-SUPABASE.md) e [`EAS-BUILD.md`](../mobile/EAS-BUILD.md).

### Arquivos-chave

| Arquivo | Função |
|---------|--------|
| `src/core/auth/AuthContext.tsx` | Sessão Supabase |
| `src/core/supabase/client.ts` | Cliente HTTPS |
| `src/core/api/*` | Canhotos, procedimentos, conferência |
| `app.json` / `eas.json` | iOS App Store |

---

## 2. Precisa de backend?

**Sim**, para um app de produção. Não é viável lançar com credenciais mock e dados que somem ao fechar o app.

O que exige servidor:

1. **Autenticação real** (usuários, senhas, sessões)
2. **Persistência** de canhotos, procedimentos, conferências
3. **Upload de fotos** (câmera/galeria) para armazenamento na nuvem
4. **Permissões por nível** (colaborador, supervisor, administração, admin)
5. **Sincronização** entre dispositivos e supervisores
6. **Importador de planilhas** e **upload em massa** (processamento server-side)
7. **Dashboard** com agregações reais
8. Futuro **painel web** de gestão de acessos (já previsto em `doc.md`)

---

## 3. Qual banco de dados recomendar?

### Recomendação principal: Supabase (PostgreSQL + Auth + Storage)

Para o perfil deste projeto, Supabase oferece a melhor relação **velocidade × custo × funcionalidade**:

| Necessidade do app | Supabase |
|--------------------|----------|
| Usuários e login | Auth (e-mail/senha, JWT) |
| Dados estruturados | PostgreSQL |
| Fotos de canhotos/procedimentos | Storage (buckets) |
| Permissões por nível | Row Level Security (RLS) |
| API REST automática | PostgREST |
| Lógica extra (importar XLSX) | Edge Functions |
| Painel web futuro | Mesmo banco, mesma API |

### Modelo de dados sugerido (MVP)

```
lojas
usuarios (perfil ligado ao auth.users)
canhotos (numero, loja_id, usuario_id, foto_url, status, created_at)
canhotos_sistema (importados do ERP/planilha)
procedimentos (tipo: promotor|quebra, loja_id, usuario_id, status)
procedimento_itens (checklist com fotos)
conferencias / divergencias
niveis_acesso + permissoes (ou JSON de roles no perfil)
vinculos_produtos (importador Linker)
```

### Alternativas

| Opção | Quando usar |
|-------|-------------|
| **Firebase** | Se a equipe já domina Google Cloud; menos SQL, mais NoSQL |
| **Backend próprio** (Node/NestJS ou Python/FastAPI) + Postgres | Se precisar integrar com **Jotter-Logix** ou ERP legado com regras complexas |
| **Supabase + API leve** | Supabase para auth/dados/fotos + API só para Excel e integrações |

**Recomendação prática:** Supabase como núcleo + Edge Function ou microserviço apenas para importação de planilhas.

---

## 4. É possível lançar na App Store esta semana?

### Cenário A — App operacional para colaboradores reais

**Não é realista em 5–7 dias.** Só o backend mínimo viável costuma levar **2–3 semanas** com equipe focada:

- Schema + RLS + auth
- Integrar ~12 telas com API
- Upload de fotos
- Testes em dispositivos reais
- Build iOS + revisão Apple (1–3 dias, às vezes mais)

### Cenário B — Submeter esta semana como v1.0 limitada

**Possível**, se aceitarem um destes escopos:

1. **TestFlight (beta interna)** — app conectado ao backend em construção, poucos testadores
2. **v1.0 "demo corporativa"** — ainda com mock, só para validar UI (não recomendado para operação)
3. **MVP enxuto** — só login real + lançamento de canhoto + upload de foto (1 fluxo), resto "em breve"

Para operação real na loja, o caminho mais honesto é: **TestFlight esta semana + App Store pública em 2–3 semanas**.

---

## 5. Checklist completo para lançamento na Apple

### 5.1 Conta e build (bloqueadores atuais)

- [ ] **Apple Developer Program** ativo (US$ 99/ano)
- [ ] **EAS Build** configurado — não existe `eas.json` no projeto
- [ ] `bundleIdentifier` no `app.json` (ex.: `com.campoalegre.hub`)
- [ ] Nome do app (hoje está `"mobile"`)
- [ ] Ícone e splash (pasta `assets/` existe — revisar qualidade 1024×1024)
- [ ] Build de produção: `eas build --platform ios`

### 5.2 Permissões iOS (obrigatório — app usa câmera)

Falta no `app.json` hoje. Exemplo:

```json
"ios": {
  "bundleIdentifier": "com.campoalegre.hub",
  "infoPlist": {
    "NSCameraUsageDescription": "Para fotografar canhotos e procedimentos.",
    "NSPhotoLibraryUsageDescription": "Para anexar fotos da galeria."
  }
}
```

Sem isso, a Apple **rejeita** ou o app **crasha** ao abrir a câmera.

### 5.3 App Store Connect

- [ ] Nome, subtítulo, descrição em português
- [ ] **Política de privacidade** (URL obrigatória — app coleta fotos e dados de usuário)
- [ ] Categoria, classificação etária
- [ ] Screenshots (6.7", 6.5", 5.5" ou via TestFlight)
- [ ] Ícone 1024×1024
- [ ] Conta de teste para revisão (se login obrigatório)
- [ ] Texto para revisor explicando níveis de acesso

### 5.4 Backend e dados (para app operacional)

- [ ] Provisionar Supabase (ou outro backend)
- [ ] Migrar auth de `mockUsers.ts` → Supabase Auth
- [ ] CRUD de canhotos com upload para Storage
- [ ] CRUD de procedimentos + fotos por item do checklist
- [ ] Listagens de conferência/visualização com filtros por loja e perfil
- [ ] Gestão de usuários e lojas (admin)
- [ ] Remover senha `123456` e usuários demo da build de produção
- [ ] Variáveis de ambiente (`EXPO_PUBLIC_SUPABASE_URL`, etc.)
- [ ] Tratamento de erros e estados de loading

### 5.5 Segurança e compliance

- [ ] Remover hint "Demonstração: use qualquer usuário mock" da tela de login
- [ ] HTTPS em todas as chamadas
- [ ] RLS no banco (colaborador só vê sua loja/dados)
- [ ] Tokens seguros (AsyncStorage já existe em `storage.ts`)
- [ ] Política de retenção de fotos

### 5.6 Qualidade antes da submissão

- [ ] Testar em iPhone físico (não só Expo Go)
- [ ] Fluxo offline básico ou mensagem clara sem internet
- [ ] Botão "Registrar canhoto" hoje **não persiste** — precisa implementar
- [ ] Revisar permissões em `actionsConfig.ts` (ex.: gestão de usuários liberada para `colaborador` — provável erro de configuração)
- [ ] Versão e build number incrementados

### 5.7 Integrações de negócio (pós-MVP ou paralelo)

- [ ] Conexão com **Jotter-Logix** (canhotos do sistema, NFe, totais)
- [ ] **Importador Linker** (ler/escrever XLSX)
- [ ] **Upload sistema** (importação em massa)
- [ ] Painel web de permissões (futuro, já documentado em `doc.md`)

---

## 6. Roadmap sugerido

### Semana 1 (esta semana)

| Tarefa | Prioridade |
|--------|------------|
| EAS + `app.json` + permissões iOS | Alta |
| Supabase setup + schema MVP | Alta |
| Auth real + canhotos + fotos | Alta |

### Semana 2

| Tarefa | Prioridade |
|--------|------------|
| Procedimentos + conferência | Alta |
| Gestão + dashboard básico | Média |

### Semana 3

| Tarefa | Prioridade |
|--------|------------|
| TestFlight + correções | Alta |
| Submissão App Store | Alta |

### MVP mínimo para "operacional"

Prioridade para primeira versão utilizável em campo:

1. Login real
2. Lançamento de canhoto + foto + persistência
3. Lista de canhotos (supervisor/admin)
4. Procedimento promotor com checklist + fotos
5. Lojas e usuários básicos no banco

**Deixar para v1.1:** importador XLSX, upload em massa, dashboard avançado, painel web.

---

## 7. Resumo executivo

| Pergunta | Resposta |
|----------|----------|
| **Qual banco?** | **PostgreSQL via Supabase** (Auth + Storage inclusos) |
| **Precisa de backend?** | **Sim** — mínimo Supabase; funções extras para planilhas |
| **Lançar operacional esta semana?** | **Não**, a menos que reduzam drasticamente o escopo |
| **Submeter à Apple esta semana?** | **Sim**, como TestFlight ou v1 com 1 fluxo real + resto oculto |
| **Maior gap hoje?** | Zero persistência/API; tudo mock; sem config de build iOS |

---

## 8. Próximos passos sugeridos

1. **Montar schema Supabase** completo com migrations e RLS por nível de acesso
2. **Configurar EAS + `app.json`** prontos para build iOS
3. **Priorizar MVP de 1 semana** com escopo fechado (só canhotos + auth) para TestFlight

---

*Última atualização: junho/2026 — diagnóstico baseado no estado do repositório `mobile` e documentação em `central-hub/doc.md`.*
