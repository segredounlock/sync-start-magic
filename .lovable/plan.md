

## Plano: Criar tabelas e bucket para o sistema de Broadcast

As tabelas necessárias (`telegram_users`, `notifications`, `broadcast_progress`, `bot_settings`) e o storage bucket (`broadcast-images`) **não foram criados** — só o código frontend/edge functions existe.

### O que será feito

Uma única migração SQL criando:

1. **`telegram_users`** — usuários do Telegram (chat_id, username, first_name, blocked, created_at)
2. **`notifications`** — mensagens de broadcast (title, message, image_url, buttons, status, sent/failed counts)
3. **`broadcast_progress`** — progresso em tempo real (sent_count, failed_count, speed, batches, status)
4. **`bot_settings`** — configurações do bot (key/value)
5. **Storage bucket `broadcast-images`** — público, para upload de imagens de broadcast
6. **RLS policies** — habilitadas com acesso para usuários autenticados
7. **Realtime** habilitado para `broadcast_progress` (necessário para o componente de progresso)

### Detalhes técnicos

- Todas as tabelas usam `uuid` com `gen_random_uuid()` como PK
- `telegram_users.chat_id` é `bigint unique` (IDs do Telegram)
- `broadcast_progress` referencia `notifications` via FK
- Timestamps com `now()` como default
- Bucket público para que as imagens sejam acessíveis pela API do Telegram

