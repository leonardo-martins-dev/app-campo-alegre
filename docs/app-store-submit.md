# Submissão App Store — Campo Alegre iOS

Após QA aprovado em TestFlight ([`checklist-qa-testflight.md`](./checklist-qa-testflight.md)).

## 1. Build produção

```bash
cd mobile
npm run build:ios:production
```

- [ ] Build concluído sem erros no [expo.dev](https://expo.dev)
- [ ] `autoIncrement` atualizou build number

## 2. Submit

Preencher credenciais reais em `eas.json` → `submit.production.ios`:

| Campo | Onde obter |
|-------|------------|
| `appleId` | Apple ID do responsável |
| `ascAppId` | App Store Connect → App → General → Apple ID |
| `appleTeamId` | developer.apple.com → Membership |

```bash
npm run submit:ios
```

## 3. App Store Connect — metadados

| Campo | Valor sugerido |
|-------|----------------|
| Nome | Campo Alegre |
| Subtítulo | Operações de campo |
| Categoria primária | Business |
| Categoria secundária | Productivity |
| Idade | 4+ |
| URL privacidade | `extra.privacyPolicyUrl` do `app.json` |
| URL suporte | E-mail ou site da empresa |

### Descrição (PT-BR)

App operacional para equipes de campo: registro de canhotos com foto, checklists de procedimentos, conferência por loja e acompanhamento de envios.

### Screenshots obrigatórios

- [ ] iPhone 6.7" (1290 × 2796)
- [ ] iPhone 6.1" (1179 × 2556)
- Capturas: Login, Hub, Conferência, Lançamento canhoto, Procedimentos

### Permissões (alinhado ao `infoPlist`)

- Câmera: fotografar canhotos e procedimentos
- Galeria: anexar fotos nos envios operacionais

## 4. Revisão Apple

### Conta demo (obrigatório)

Em **App Review Information** → Notes:

```
Conta de teste:
E-mail: demo@campoalegre.com.br
Senha: [senha criada no Supabase]

O app requer login. Use a conta acima (perfil colaborador).
Funcionalidades: canhotos, procedimentos e conferência.
```

- [ ] Usuário demo criado e testado antes do submit
- [ ] Contato de revisão preenchido

## 5. Pós-submissão

- [ ] Monitorar status em App Store Connect
- [ ] Responder perguntas da revisão em até 24h
- [ ] Após aprovação: liberar para produção ou TestFlight externo

**Tempo médio de revisão:** 1–7 dias úteis.
