# 🤖 Sistema Telegram

## Bot Telegram

### Configuração
| Config (bot_settings) | Descrição |
|----------------------|-----------|
| `botToken` | Token do bot do Telegram |
| `webhookSecret` | Secret para validar webhooks |

### Edge Functions
| Função | Descrição |
|--------|-----------|
| `telegram-bot` | Webhook principal do bot |
| `telegram-setup` | Configurar webhook URL |
| `telegram-notify` | Enviar notificação individual |

### Fluxo do Bot
```
1. Usuário envia /start → Bot registra em telegram_users
2. Bot oferece menu de opções
3. Sessão salva em telegram_sessions (step + data)
4. Usuário pode: cadastrar-se, ver saldo, fazer recarga
```

## Mini App Telegram

| Função | Descrição |
|--------|-----------|
| `telegram-miniapp` | API para o mini app embutido no Telegram |

Página: `TelegramMiniApp.tsx` — Interface web dentro do Telegram

## Broadcasts

### Fluxo de Envio
```
1. Admin cria notificação (título, mensagem, imagem, botões)
2. Clica em "Enviar Broadcast"
3. Edge function send-broadcast:
   a. Busca todos telegram_users não bloqueados
   b. Envia em lotes com delay
   c. Atualiza broadcast_progress em tempo real
4. Frontend mostra progresso em tempo real
```

### Tabelas Envolvidas
- `notifications` — Broadcast criado
- `broadcast_progress` — Progresso do envio (sent_count, failed_count, speed)
- `broadcast_messages` — Cada mensagem individual enviada
- `telegram_users` — Destinatários

### Cleanup
`cleanup-stuck-broadcasts` — Cancela broadcasts travados há >10 minutos
