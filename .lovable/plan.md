

## Melhorias para o Bot do Telegram

Analisei o código completo do bot e a imagem do menu atual. Aqui estão as melhorias possíveis:

### 1. Remover botão "Usar Saldo Antigo" (se migração não estiver ativa)
Atualmente o botão "Usar Saldo Antigo" aparece **sempre** no menu, mesmo quando a migração está desativada. Deveria ser condicional — só mostrar se `migration_message_enabled === "true"`.

**Arquivos:** `supabase/functions/telegram-bot/index.ts` — nas funções `sendMainMenu` e `menuKb` dentro de `handleCallback`.

### 2. Mensagem de boas-vindas mais rica
Adicionar o saldo atual do usuário direto na mensagem de boas-vindas do menu principal, evitando um clique extra:
```
👋 Olá, Segredo!
💰 Saldo: R$ 150,00

Escolha uma opção:
```

**Arquivos:** `sendMainMenu` e `handleCallback` (menu_main) — buscar saldo em paralelo e incluir na mensagem.

### 3. Botão "Abrir Web App" com URL dinâmica
O URL do Web App está hardcoded como `https://recargasbrasill.com/miniapp`. Deveria usar a URL real do projeto (`recargas-brasil-v2.lovable.app`) ou ser configurável via `system_config`.

### 4. Adicionar botão de "Ajuda / Suporte"
Incluir um botão de ajuda/suporte no menu principal para facilitar o contato.

### 5. Notificação de depósito confirmado mais visual
Quando o depósito é confirmado (via `sendPendingNotifications`), adicionar uma animação de "confetes" com emojis e mensagem mais celebratória.

---

### Resumo das alterações técnicas

Todas no arquivo `supabase/functions/telegram-bot/index.ts`:

1. **`sendMainMenu`** e **`menuKb`**: Tornar o botão "Usar Saldo Antigo" condicional (`migrationConfig.enabled`). Buscar saldo do usuário e exibir no texto de boas-vindas.
2. **`sendMainMenu`** e **`menuKb`**: Tornar o URL do Web App configurável via `system_config` (key `webAppUrl`) com fallback.
3. **`sendMainMenu`**: Adicionar linha de botão "❓ Ajuda" no menu.
4. **`sendPendingNotifications`**: Melhorar formatação da mensagem de confirmação.

