
## Correção da URL do botão "Usar Saldo Antigo"

### Problema
A URL `https://unlocked.poeki.dev/` está escrita diretamente no código em **2 locais** do arquivo `supabase/functions/telegram-bot/index.ts` (linhas 799 e 1339), ignorando a configuração do banco de dados que aponta para `https://recargasbrasill.com`.

### Solução
Substituir a URL hardcoded nos dois pontos pelo valor dinâmico vindo da função `getMigrationConfig()`, que já busca a URL correta da tabela `system_config`.

### Alterações
**Arquivo:** `supabase/functions/telegram-bot/index.ts`

1. **Linha ~799** — No menu principal do bot, trocar:
   - `web_app: { url: "https://unlocked.poeki.dev/" }` → usar a URL da config de migração

2. **Linha ~1339** — No menu pós-vinculação, trocar:
   - `web_app: { url: "https://unlocked.poeki.dev/" }` → usar a URL da config de migração

Em ambos os casos, chamar `getMigrationConfig()` para obter a URL configurada no banco (`https://recargasbrasill.com`) e usá-la dinamicamente.

### Deploy
Re-deploy da Edge Function `telegram-bot`.
