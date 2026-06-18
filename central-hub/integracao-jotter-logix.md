# Integração Jotter-Logix (fase futura)

Placeholder para sincronização com o sistema legado **Jotter-Logix**.

## Opções

1. **Importação periódica** — CSV/planilha exportada do Jotter → `canhotos_sistema` via painel Upload
2. **API REST** — Edge Function que consulta endpoint do Jotter e faz upsert em `canhotos_sistema`
3. **Webhook** — Jotter notifica novos canhotos; Supabase Edge Function persiste

## Campos mapeados

| Jotter-Logix | Supabase `canhotos_sistema` |
|--------------|----------------------------|
| Número canhoto | `numero` |
| Data | `data` |
| NFe | `nfe` |
| Total | `total` |
| Loja | `loja_id` (via código/nome) |

Implementar quando houver especificação da API ou formato de exportação do Jotter.
