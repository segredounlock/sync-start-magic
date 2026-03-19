

# Como WhatsApp e Telegram Identificam Quem Está Online

## Pesquisa: Como Funciona nos Apps Profissionais

### WhatsApp
- **Conexao persistente**: Quando voce abre o WhatsApp, o app abre um socket TCP permanente com o servidor (protocolo FunXMPP). Nao usa polling.
- **Presenca efemera**: Ao conectar, o app envia `<presence type="available" />`. O servidor guarda em **memoria (Redis)**, nao no banco de dados.
- **Ao sair**: O servidor detecta que o socket caiu e marca `status: offline, last_seen: timestamp`. Notifica os contatos instantaneamente.
- **Heartbeat**: O app envia "pings" periodicos (~30s) para manter a conexao viva. Se parar de pingar, o servidor marca offline.
- **Nao toca banco de dados**: Tudo e in-memory e volatil.

### Telegram
- **3 sinais combinados**: O status "online" vem de: (1) timestamp do last_seen, (2) presenca do socket ativo, (3) recibos de leitura.
- **Timeout automatico**: Se o usuario fica 30 segundos sem interagir, o status muda para "visto recentemente".
- **Reciprocidade**: Voce so ve o status de quem permite que voce veja (privacidade mutua).

### Resumo da Arquitetura Profissional
```text
┌─────────────┐     Socket TCP      ┌──────────────┐     In-Memory     ┌──────────────┐
│  App/Client │ ◄──────────────────► │   Gateway    │ ◄───────────────► │  Redis/Cache │
│             │   (conexao aberta)   │   Server     │   (presenca)      │  (volatil)   │
└─────────────┘                      └──────────────┘                   └──────────────┘
                                           │
                                     Notifica contatos
                                     quando status muda
```

## Como Funciona o Seu Sistema Atual

Seu sistema ja usa o **Supabase Realtime Presence** que e bastante similar ao modelo profissional:

- **Canal de presenca**: Usa `supabase.channel("chat-presence-v2")` com Presence (baseado em WebSocket, similar ao socket TCP)
- **Track/Untrack**: Quando entra no chat faz `track()`, quando sai faz `untrack()` - igual WhatsApp
- **Heartbeat de 15s**: Re-envia presenca a cada 15 segundos
- **Visibilidade**: Re-track quando volta para a aba
- **last_seen_at**: Salva no banco a ultima vez que o usuario esteve online

**Conclusao**: Seu sistema ja segue o mesmo padrao do WhatsApp e Telegram. A arquitetura e correta. O Supabase Presence funciona via WebSocket (conexao persistente), exatamente como os apps profissionais fazem.

### Diferencas Menores
| Aspecto | WhatsApp/Telegram | Seu Sistema |
|---------|-------------------|-------------|
| Protocolo | TCP/XMPP customizado | WebSocket (Supabase) |
| Armazenamento presenca | Redis in-memory | Supabase Presence (in-memory no servidor) |
| Heartbeat | ~30s | 15s (ate mais frequente) |
| Deteccao de saida | Socket fecha = offline | `untrack()` + WebSocket fecha |
| last_seen | In-memory | Banco de dados (profiles.last_seen_at) |

**Seu sistema esta bem implementado e alinhado com as melhores praticas da industria.** Nao ha necessidade de mudancas arquiteturais.

