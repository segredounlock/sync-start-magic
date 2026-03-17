

## Plano: Sistema de Suporte Telegram → Painel Admin

### Problema Atual
O botão "Ajuda / Suporte" no Telegram apenas exibe um menu estático com opções internas. Não há canal para o usuário enviar uma mensagem de suporte que chegue ao administrador principal.

### Solução

**1. Criar tabela `support_tickets` no banco**
- Campos: `id`, `user_id` (referência ao usuário), `telegram_chat_id`, `telegram_username`, `message` (texto do usuário), `status` (open/answered/closed), `admin_reply`, `replied_at`, `created_at`
- RLS: admin pode ler/atualizar tudo; usuário comum pode inserir

**2. Atualizar o bot Telegram (`telegram-bot/index.ts`)**
- Quando o usuário clica em "Ajuda / Suporte", em vez do menu estático, apresentar opção "Falar com Suporte"
- Ao clicar, entrar em modo de sessão `awaiting_support_message`
- A próxima mensagem de texto do usuário é salva na tabela `support_tickets`
- Bot confirma: "Sua mensagem foi enviada ao suporte! Aguarde resposta."

**3. Adicionar seção "Suporte" no Painel Principal (`Principal.tsx`)**
- Novo item no menu lateral: `{ key: "suporte", icon: Headphones, label: "Suporte", color: "text-orange-400" }` com badge de tickets abertos
- Nova view `"suporte"` que lista tickets pendentes com nome do usuário, mensagem e data
- Admin pode responder diretamente — a resposta é enviada de volta ao Telegram do usuário via API do bot
- Status muda para "answered" ao responder e "closed" ao finalizar

**4. Notificação ao admin**
- Quando um ticket é criado, enviar notificação via Telegram para o admin principal (chat ID 1901426549)
- Badge no menu lateral mostrando quantidade de tickets abertos

### Fluxo
```text
Usuário Telegram                    Admin Painel
     │                                   │
     ├─ Clica "Ajuda/Suporte"            │
     ├─ Clica "Falar com Suporte"        │
     ├─ Digita mensagem ──────────► support_tickets (DB)
     │                                   │
     │                              Badge atualiza
     │                              Admin abre "Suporte"
     │                              Lê mensagem
     │                              Digita resposta ──────► Bot envia msg ao user
     │  ◄─── Recebe resposta no Telegram  │
```

### Arquivos Modificados
- **Nova migração SQL**: criar tabela `support_tickets` com RLS
- **`supabase/functions/telegram-bot/index.ts`**: novo fluxo de sessão para suporte
- **`src/pages/Principal.tsx`**: novo menu item "Suporte" + view com lista de tickets e área de resposta
- **`src/types/index.ts`**: tipo `SupportTicket` (opcional)

