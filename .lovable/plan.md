

## Plano: Mensagem de Migração no Bot do Telegram

### Conceito
Quando um usuário **não vinculado** inicia o bot (`/start`), antes de ir direto para o cadastro, o bot exibe uma mensagem informativa sobre a migração do sistema antigo para o novo, com dois botões inline:

1. **"🔄 Usar créditos do site antigo"** — abre o link do site antigo para o usuário consumir seus créditos restantes
2. **"▶️ Continuar para o bot"** — prossegue normalmente para o fluxo de vinculação de conta

Para usuários **já vinculados**, o bot funciona normalmente sem essa mensagem (eles já migraram).

### Configuração Dinâmica
O link do site antigo e a mensagem de migração serão configuráveis via `system_config` (chaves `migration_old_site_url` e `migration_message_enabled`), permitindo desativar a mensagem quando a migração terminar, sem precisar alterar código.

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/telegram-bot/index.ts` | Alterar o fluxo do `/start` para usuários não vinculados |

### Mudança no Fluxo (linhas ~371-388)

Quando `!linkedUser` no `/start`:

1. Buscar `migration_message_enabled` e `migration_old_site_url` em `system_config`
2. Se migração ativa, enviar mensagem com dois botões inline:
   - `callback_data: "migration_old_site"` → envia link do site antigo
   - `callback_data: "migration_continue"` → inicia o fluxo normal de vinculação
3. Se migração desativada, segue fluxo normal direto

### Novo Callback Handler

Adicionar no `handleCallback`:
- `migration_continue` → inicia o fluxo `awaiting_email` normalmente
- `migration_old_site` → envia mensagem com o link do site antigo + botão para voltar

### Detalhes Técnicos
- Duas novas chaves em `system_config`: `migration_message_enabled` (valor `"true"/"false"`) e `migration_old_site_url` (URL do site antigo)
- Cache do estado de migração no bot para evitar query repetida a cada `/start`
- Nenhuma tabela nova necessária — usa `system_config` existente

