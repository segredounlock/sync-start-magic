

## Plano: Telegram Login Widget na página de autenticação

### Visão Geral

Adicionar o botão "Entrar com Telegram" na página `/login`, permitindo login rápido via Telegram Login Widget. O widget envia dados do usuário Telegram para uma edge function que valida, cria/vincula a conta no Supabase Auth e retorna uma sessão.

### Alterações

**1. Nova Edge Function `supabase/functions/telegram-login/index.ts`**
- Recebe os dados do Telegram Login Widget (id, first_name, username, auth_date, hash)
- Valida o hash usando HMAC-SHA256 com o bot token (obtido de `system_config.telegramBotToken`)
- Verifica se já existe um perfil com esse `telegram_id` na tabela `profiles`
  - Se sim: faz login via `signInWithPassword` ou gera um custom token
  - Se não: cria uma conta no Supabase Auth e vincula o `telegram_id` ao perfil
- Retorna o `access_token` e `refresh_token` para o frontend estabelecer a sessão

**2. Atualizar `src/pages/Auth.tsx`**
- Adicionar botão "Entrar com Telegram" abaixo do formulário
- Carregar o script do Telegram Login Widget (`https://telegram.org/js/telegram-widget.js`)
- Ao receber callback do widget, chamar a edge function `telegram-login`
- Com a sessão retornada, usar `supabase.auth.setSession()` para autenticar o usuário

**3. Atualizar `supabase/config.toml`**
- Adicionar entrada `[functions.telegram-login]` com `verify_jwt = false`

### Detalhes Técnicos

O Telegram Login Widget funciona assim:
1. O script do Telegram renderiza um botão no DOM
2. O usuário clica e autoriza via popup do Telegram
3. O Telegram retorna dados assinados (id, first_name, username, hash, auth_date)
4. O backend valida o hash: `HMAC_SHA256(SHA256(bot_token), data_check_string)`
5. Se válido, o backend cria/busca o usuário e gera tokens de sessão

O bot token já está armazenado em `system_config` (chave `telegramBotToken`). A tabela `profiles` já possui campos `telegram_id` e `telegram_username`.

Para criar sessões no Supabase Auth sem senha, a edge function usará `supabase.auth.admin.createUser()` com `email_confirm: true` e depois `supabase.auth.admin.generateLink()` ou criará o usuário com uma senha aleatória e fará login programaticamente.

