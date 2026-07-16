# Central Hub – Campo Alegre Mobile

Documentação de referência para o aplicativo mobile da empresa **Campo Alegre**, servindo como base para desenvolvimento futuro do hub central e integração com o painel web de gestão de acessos.

**App Expo:** [`../mobile`](../mobile) (mesmo repositório; build EAS só nesta pasta).

**Painel web + SQL:** [`../web/`](../web/), [`../supabase/`](../supabase/).

**Índice de docs:** [`README.md`](./README.md)

---

## 1. Visão geral

O **Central Hub** é a tela inicial após o login no app mobile. Ele funciona como um **hub de ações**: o usuário vê apenas as ações que pode executar de acordo com seu **nível de acesso**. A experiência é única por perfil (colaborador, supervisor, administração, admin), com menus e telas configuráveis de forma modular para, no futuro, serem definidos pelo painel web.

### Sistemas de referência

- **Jotter-Logix** (Central de Automação Campo Alegre): canhotos, procedimentos de promotores, procedimentos de quebra, conferência, gestão de usuários/lojas, upload de sistema. Níveis: Administrador, Operador, Supervisor, Colaborador.
- **Remix Campo Alegre Linker**: importador de pedidos (importar planilha → vincular SEQPRODUTO a COD_PRODUTO/COD_SUPER → exportar). Foco em vínculos por cliente/loja (ex.: Campo Alegre, São Vicente).

O app mobile unifica o acesso a esses fluxos em uma única experiência, com UI refinada e controle de acesso por nível.

---

## 2. Níveis de acesso

| Nível            | Código (interno) | Descrição breve |
|------------------|------------------|------------------|
| **Colaborador**  | `colaborador`    | Operação de campo: lançar canhotos, conferência, procedimentos promotores e quebra. |
| **Supervisor**   | `supervisor`     | Tudo do colaborador + visualização de canhotos/procedimentos, gestão de usuários (escopo limitado). |
| **Administração**| `administracao`  | Operador/gestão: visualizações, conferência, sem gestão global. (Pode ser fundido com supervisor conforme regra de negócio.) |
| **Admin**        | `admin`          | Acesso total: dashboard, gestão de usuários/lojas, upload sistema, todas as visualizações. |

### Hierarquia (para regras de permissão)

```
admin > administracao ≥ supervisor > colaborador
```

- **Colaborador**: apenas ações operacionais atribuídas a ele (canhotos, procedimentos, conferência).
- **Supervisor**: + visualização de canhotos e procedimentos (próprios e da equipe), gestão de usuários no escopo supervisionado.
- **Administração**: perfis de escritório/operador; ver definição exata no painel (ex.: só visualizações, sem gestão de usuários).
- **Admin**: todas as telas e funções, incluindo gestão de usuários/lojas e upload do sistema.

---

## 3. Lógica de negócio do Hub

### 3.1 Princípio do Hub

- Após login, a **Home** é sempre o **Central Hub**.
- O hub exibe **ações** (cards/botões) que levam a telas ou fluxos.
- Cada ação tem:
  - **id** (único, ex.: `lancamento-canhotos`, `importador-pedidos`).
  - **rótulo**, **descrição**, **ícone**, **cor/tema**.
  - **níveis permitidos**: lista de códigos de nível que podem ver essa ação (ex.: `['colaborador','supervisor','administracao','admin']`).
- **Menu de navegação** (drawer/tabs): itens também filtrados por nível de acesso.
- Objetivo futuro: **painel web** define quais ações e itens de menu cada nível enxerga (configurável), sem precisar alterar código do app.

### 3.2 Ações por sistema (referência Jotter-Logix + Linker)

| Ação / Tela                     | Colab | Superv | Adminção | Admin | Observação |
|---------------------------------|-------|--------|----------|-------|------------|
| Lançamento de canhoto           | ✓     | ✓      | ✓        | ✓     | Todos.     |
| Visualização de canhotos        | —     | ✓      | ✓        | ✓     |            |
| Conferência                     | ✓     | ✓      | ✓        | ✓     |            |
| Procedimentos promotores        | ✓     | —      | —        | ✓     | Colab + Admin. |
| Visualização procedimentos      | —     | ✓      | —        | ✓     |            |
| Procedimento quebra (colab.)    | ✓     | —      | —        | ✓     |            |
| Visualização proced. quebra     | —     | ✓      | —        | ✓     |            |
| Gestão de usuários              | —     | ✓      | —        | ✓     |            |
| Gestão de lojas                 | —     | —      | —        | ✓     | Apenas Admin. |
| Upload sistema                  | —     | —      | —        | ✓     | Apenas Admin. |
| Dashboard (métricas/visão geral)| —     | —      | —        | ✓     | Apenas Admin. |
| Importador de pedidos (Linker)  | —     | ✓      | ✓        | ✓     | Definir no painel quem acessa. |

*Nota: “Administração” pode ser ajustado (ex.: igualar a supervisor) conforme regras do painel.*

### 3.3 Fluxo pós-login

1. Usuário faz login (credenciais mockadas ou futura API).
2. Backend (ou mock) retorna: `user` + `nivelAcesso` (ex.: `colaborador`).
3. App persiste sessão (ex.: contexto + AsyncStorage).
4. Navega para **Central Hub** (Home).
5. Hub monta lista de ações permitidas para `user.nivelAcesso` e exibe apenas esses cards.
6. Menu lateral/inferior mostra apenas rotas permitidas para esse nível.

---

## 4. Tecnologia e stack

- **Framework**: Expo (SDK atual, React Native).
- **Linguagem**: TypeScript.
- **Navegação**: React Navigation (stack + drawer ou tabs conforme UX).
- **Estado**: Context (auth, usuário, nível) + AsyncStorage para persistir sessão.
- **UI**: Componentes próprios ou lib (ex.: NativeWind/Tailwind, ou React Native Paper) para manter visual refinado e consistente.
- **Dados**: Mock (JSON/constantes) na v1; depois substituir por API REST.

---

## 5. Arquitetura do app (modular)

Estrutura pensada para correções e evolução simples, e para o painel web controlar “quem vê o quê”.

```
app/
├── src/
│   ├── core/                    # Núcleo compartilhado
│   │   ├── auth/                # Context de auth, tipos User, NivelAcesso
│   │   ├── config/              # Constantes, feature flags
│   │   ├── navigation/          # Tipos de rotas, guards por nível
│   │   └── storage/             # AsyncStorage (token, user)
│   ├── features/                # Módulos por funcionalidade
│   │   ├── hub/                 # Central Hub (lista de ações por nível)
│   │   ├── login/
│   │   ├── canhotos/            # Lançamento, visualização, conferência
│   │   ├── procedimentos/       # Promotores, quebra, visualizações
│   │   ├── gestao/              # Usuários, lojas (admin)
│   │   ├── upload-sistema/      # Admin
│   │   ├── dashboard/           # Admin
│   │   └── importador-pedidos/  # Linker (importar → vincular → exportar)
│   ├── shared/                  # UI e utils compartilhados
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── app/                     # Rotas raiz, tema, providers
├── assets/
└── app.json / package.json
```

### 5.1 Configuração de ações e menus (drive por dados)

- **Arquivo de configuração** (ex.: `core/config/actions.ts` ou `hub/actionsConfig.ts`):
  - Lista de **ações** do hub: `id`, `label`, `description`, `icon`, `screen`, `roles` (níveis permitidos).
  - Lista de **itens de menu**: `id`, `label`, `icon`, `screen`, `roles`.
- No hub: filtrar `actions.filter(a => a.roles.includes(user.nivelAcesso))`.
- No menu: filtrar itens pelo mesmo critério.
- **Futuro**: esse config pode vir da API (painel web) em vez de estático.

### 5.2 Rotas e guards

- Rotas nomeadas por tela (ex.: `Hub`, `LancamentoCanhoto`, `ImportadorPedidos`).
- **Guard de nível**: antes de renderizar uma tela, verificar se `user.nivelAcesso` está em `allowedRoles` da rota; se não, redirecionar para Hub ou tela de “Sem permissão”.
- Rotas registradas de forma centralizada (ex.: um mapa `screenName -> { component, allowedRoles }`) para facilitar adicionar novas telas e níveis.

---

## 6. Painel web (futuro)

- **Gestão de níveis de acesso**: CRUD de “níveis” (nome, código, hierarquia).
- **Atribuição de permissões**: por nível, selecionar quais **ações** e **itens de menu** estão visíveis.
- **Modelo de dados sugerido** (para o app consumir depois):
  - `Nivel`: `id`, `codigo`, `nome`, `ordem`.
  - `Acao`: `id`, `nome`, `rota`, `icone`, etc.
  - `NivelAcao`: `nivelId`, `acaoId` (many-to-many).
  - Endpoint ex.: `GET /api/me` retorna `user` + `nivel` + `permissoes` (lista de `acaoId` ou de rotas permitidas); o app monta hub e menu a partir disso.

Com isso, criar um novo nível de acesso ou mudar o que cada nível vê fica apenas na configuração do painel, sem redeploy do app (quando o app passar a consumir a API de permissões).

---

## 7. Resumo para desenvolvimento

1. **Login**: mock de usuários com `nivelAcesso` em `['colaborador','supervisor','administracao','admin']`.
2. **Home = Central Hub**: lista de ações filtrada por nível; cada ação navega para a tela correspondente.
3. **Menu**: itens filtrados por nível; mesmo critério do hub.
4. **Telas**: implementar de forma modular em `features/*`; rotas com guard por nível.
5. **Configuração**: um único lugar (config/API) que define ações e menus por nível para facilitar manutenção e futuro painel web.
6. **Documentação**: [`negocio-central-hub.md`](./negocio-central-hub.md) como referência de negócio, tecnologia e arquitetura do Central Hub e níveis de acesso.

---

*Última atualização: base para v1 do app mobile Campo Alegre e para evolução com painel web de gestão de acessos.*
