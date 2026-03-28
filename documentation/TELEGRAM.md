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

### Via Painel Web (React)
```
1. Admin cria notificação (título, mensagem, imagem, botões)
2. Clica em "Enviar Broadcast"
3. Edge function send-broadcast:
   a. Busca todos telegram_users não bloqueados
   b. Envia em lotes com delay
   c. Atualiza broadcast_progress em tempo real
4. Frontend mostra progresso em tempo real
```

### Via Bot Telegram (Admin)
```
1. Admin envia /broadcast no bot
2. Seleciona audiência: Todos / Apenas Registrados
3. Bot salva estado "awaiting_broadcast_message"
4. Admin envia mídia (foto/vídeo/áudio/GIF/doc) ou texto
5. Bot detecta estado broadcast ativo
6. executeTelegramBroadcast() é chamada:
   a. Mídia → copyMessage (copia original sem re-upload)
   b. Texto → sendMessage com HTML
   c. Rate limit: pausa 1.1s a cada 25 mensagens
   d. Progresso em tempo real via editMessageText
7. Resumo final com estatísticas (enviados/falhas/bloqueados/tempo)
```

### Tipos de Mídia Suportados (Bot)
| Tipo | Método |
|------|--------|
| Foto, Vídeo, Áudio, Voz, GIF, Documento, Sticker, Vídeo Circular | `copyMessage` |
| Texto | `sendMessage` |

### Tabelas Envolvidas
- `notifications` — Broadcast criado (painel web)
- `broadcast_progress` — Progresso do envio (painel web)
- `broadcast_messages` — Cada mensagem individual enviada
- `telegram_users` — Destinatários
- `telegram_sessions` — Estado de broadcast do bot

### Cleanup
`cleanup-stuck-broadcasts` — Cancela broadcasts travados há >10 minutos
