

## Diagnóstico: Bot Token Compartilhado entre Painéis

### Problema Encontrado

O **AdminDashboard** (`/admin`) — usado tanto por admins quanto revendedores — salva o token do bot na tabela **`system_config`** (global/master). Isso significa que:

1. Quando um **revendedor** valida/salva seu token no `/admin`, ele **sobrescreve o token master** do sistema
2. O **Principal** (`/principal`) também lê/escreve de `system_config` — então ambos compartilham o mesmo token
3. O **RevendedorPainel** (`/painel`) salva corretamente em `profiles.telegram_bot_token` (isolado por usuário), mas o `/admin` não

### O que está errado

No `AdminDashboard.tsx`:
- `fetchConfig()` carrega tudo de `system_config` (linha 412)
- `saveConfig()` salva tudo de volta em `system_config` (linha 425)
- O botão "Validar" salva em `system_config` com key `telegramBotToken` (linha 2983)

Ou seja, **revendedores no `/admin` estão mexendo no bot master**.

### Plano de Correção

1. **No AdminDashboard (`/admin`) — aba Bot para revendedores**:
   - Quando `role === "revendedor"`, o token deve ser lido/salvo de `profiles.telegram_bot_token` (do próprio usuário), **não** de `system_config`
   - O botão "Validar" deve salvar em `profiles` quando for revendedor
   - O "Salvar Tudo" não deve incluir `telegramBotToken` no `system_config` quando for revendedor

2. **No AdminDashboard (`/admin`) — aba Bot para admin**:
   - Quando `role === "admin"`, mantém o comportamento atual (salva em `system_config` como token master)

3. **Ajustar `fetchConfig` e `saveConfig`**:
   - Para revendedor: ao carregar, buscar `telegram_bot_token` de `profiles` e injetar no `configData`
   - Para revendedor: ao salvar, enviar o token para `profiles.telegram_bot_token` em vez de `system_config`

4. **Webhook do revendedor**:
   - Ao resetar webhook de revendedor, deve usar o token individual (de `profiles`), não o `system_config`
   - A edge function `telegram-setup` já aceita `token` no body, então basta passar o token correto

### Resultado Esperado

- **Admin master** (`/principal`): gerencia o bot global via `system_config`
- **Admin** (`/admin` com role admin): mesma coisa, bot global
- **Revendedor** (`/admin` com role revendedor): gerencia **seu próprio bot** via `profiles.telegram_bot_token`
- Cada revendedor tem bot, usuarios e webhook isolados

