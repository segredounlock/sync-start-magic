

## Plano: Migrar GITHUB_PAT e TELEGRAM_BOT_TOKEN para system_config

### Situacao Atual

| Secret | system_config | Edge Functions |
|--------|--------------|----------------|
| `TELEGRAM_BOT_TOKEN` | Ja existe como `telegramBotToken` | `telegram-bot` e `telegram-notify` ja leem do DB. `telegram-setup` ainda usa so env. |
| `GITHUB_PAT` | Nao existe | `github-sync` usa so env |

### Alteracoes

**1. Inserir `githubPat` na tabela system_config**
- Inserir registro com key `githubPat` e valor vazio (o admin preenchera pelo painel)

**2. Atualizar `github-sync/index.ts`**
- Adicionar consulta a `system_config` com key `githubPat` antes de usar `Deno.env.get("GITHUB_PAT")`
- Fallback: DB primeiro, env depois

**3. Atualizar `telegram-setup/index.ts`**
- Adicionar consulta a `system_config` com key `telegramBotToken` antes de usar env
- Prioridade: token do body (payload) > DB > env

**4. Adicionar campos no painel Admin para gerenciar esses secrets**
- Na pagina `AdminDashboard.tsx`, adicionar inputs para `githubPat` e `telegramBotToken` na secao de configuracoes, salvando direto em `system_config`

### Detalhes Tecnicos

- As Edge Functions continuarao com fallback para `Deno.env.get()` caso o valor nao exista no DB, garantindo retrocompatibilidade
- Os secrets no Cloud podem ser removidos futuramente quando os valores estiverem persistidos no DB
- `telegram-bot` e `telegram-notify` ja estao corretos, nenhuma alteracao necessaria

### Arquivos Modificados
- `supabase/functions/github-sync/index.ts`
- `supabase/functions/telegram-setup/index.ts`  
- `src/pages/AdminDashboard.tsx` (adicionar campos de config)

